import sqlite3
import os
import urllib.parse
import urllib.request
from dotenv import load_dotenv
import uuid
import json

from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv("backend/.env")

PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY")

app = Flask(__name__)
CORS(app)

DATABASE = "backend/collections.db"


#open a new SQLite connection and return rows that can be accessed by column namne
def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_db_connection()

    # Create the collections table
    connection.execute("""
        CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    """)

    # Create the images table
    connection.execute("""
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            collection_id INTEGER NOT NULL,
            url TEXT NOT NULL,
            FOREIGN KEY (collection_id) REFERENCES collections (id)
        )
    """)

    # Add captions to images if the column doesn't exist yet
    try:
        connection.execute(
            "ALTER TABLE images ADD COLUMN caption TEXT DEFAULT ''"
        )
    except sqlite3.OperationalError:
        pass

    # Add sharing IDs to collections if the column doesn't exist yet
    try:
        connection.execute(
            "ALTER TABLE collections ADD COLUMN share_id TEXT"
        )
    except sqlite3.OperationalError:
        pass

    connection.commit()
    connection.close()


@app.route("/collections", methods=["GET"])
def get_collections():
    connection = get_db_connection()

    collections = connection.execute(
        "SELECT * FROM collections"
    ).fetchall()

    connection.close()

    return jsonify([dict(collection) for collection in collections])


@app.route("/collections", methods=["POST"])
def create_collection():
    data = request.get_json() or {}
    name = data.get("name", "").strip()

    if not name:
        return jsonify({"error": "Collection name is required"}), 400

    connection = get_db_connection()

    cursor = connection.execute(
        "INSERT INTO collections (name) VALUES (?)",
        (name,)
    )

    connection.commit()

    new_collection = {
        "id": cursor.lastrowid,
        "name": name
    }

    connection.close()

    return jsonify(new_collection), 201

@app.route("/collections/<int:collection_id>", methods=["DELETE"])
def delete_collection(collection_id):
    connection = get_db_connection()

    #remove a collection's images first so no orphaned image records remain
    connection.execute(
        "DELETE FROM images WHERE collection_id = ?",
        (collection_id,)
    )

    connection.execute(
        "DELETE FROM collections WHERE id = ?",
        (collection_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({"message": "Collection deleted"})

@app.route("/collections/<int:collection_id>/images", methods=["POST"])
def add_image(collection_id):
    data = request.get_json() or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "Image URL is required"}), 400

    connection = get_db_connection()

    cursor = connection.execute(
        "INSERT INTO images (collection_id, url) VALUES (?, ?)",
        (collection_id, url)
    )

    connection.commit()

    new_image = {
        "id": cursor.lastrowid,
        "collection_id": collection_id,
        "url": url,
        "caption": ""
    }

    connection.close()

    return jsonify(new_image), 201

@app.route("/collections/<int:collection_id>/images", methods=["GET"])
def get_images(collection_id):
    connection = get_db_connection()

    images = connection.execute(
        "SELECT * FROM images WHERE collection_id = ?",
        (collection_id,)
    ).fetchall()

    connection.close()

    return jsonify([dict(image) for image in images])

@app.route("/images/<int:image_id>", methods=["DELETE"])
def delete_image(image_id):
    connection = get_db_connection()

    connection.execute(
        "DELETE FROM images WHERE id = ?",
        (image_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({"message": "Image deleted"})

@app.route("/search", methods=["GET"])
def search_images():
    query = request.args.get("q", "").strip()
    page = request.args.get("page", 1, type=int)

    if not query:
        return jsonify([])

    #forward the search query and page number to Pixaby for paginated results
    params = urllib.parse.urlencode({
        "key": PIXABAY_API_KEY,
        "q": query,
        "image_type": "photo",
        "per_page": 12,
        "page": page
    })

    url = f"https://pixabay.com/api/?{params}"

    #keep an external Pixaby failure from crashing the Flask API
    try:
        with urllib.request.urlopen(url, timeout=8) as response:
            data = response.read()

        pixabay_data = json.loads(data)

    except Exception:
        return jsonify({
            "error": "Image search is unavailable right now"
        }), 502

    results = []

    for image in pixabay_data.get("hits", []):
        results.append({
            "id": image["id"],
            "url": image["webformatURL"],
            "preview": image["previewURL"],
            "tags": image["tags"]
        })

    return jsonify(results)

@app.route("/images/<int:image_id>", methods=["PUT"])
def update_image(image_id):
    data = request.get_json()
    caption = data.get("caption", "")

    connection = get_db_connection()

    connection.execute(
        "UPDATE images SET caption = ? WHERE id = ?",
        (caption, image_id)
    )

    connection.commit()
    connection.close()

    return jsonify({
        "id": image_id,
        "caption": caption
    })

@app.route("/collections/<int:collection_id>/share", methods=["POST"])
def share_collection(collection_id):
    connection = get_db_connection()

    existing = connection.execute(
        "SELECT share_id FROM collections WHERE id = ?",
        (collection_id,)
    ).fetchone()

    if existing is None:
        connection.close()
        return jsonify({"error": "Collection not found"}), 404

    # reuse an existing share ID so public collection links stay stable
    if existing["share_id"]:
        connection.close()
        return jsonify({"share_id": existing["share_id"]})

    #generate a short unique ID that can be used in a public share URL
    share_id = uuid.uuid4().hex[:8]

    connection.execute(
        "UPDATE collections SET share_id = ? WHERE id = ?",
        (share_id, collection_id)
    )

    connection.commit()
    connection.close()

    return jsonify({"share_id": share_id})

@app.route("/collections/<int:collection_id>/unshare", methods=["POST"])
def unshare_collection(collection_id):
    connection = get_db_connection()

    #clearing the share ID makes the collection private and invalidates its old link
    connection.execute(
        "UPDATE collections SET share_id = NULL WHERE id = ?",
        (collection_id,)
    )

    connection.commit()
    connection.close()

    return jsonify({"message": "Collection is now private"})

@app.route("/shared/<share_id>", methods=["GET"])
def get_shared_collection(share_id):
    connection = get_db_connection()

    collection = connection.execute(
        "SELECT * FROM collections WHERE share_id = ?",
        (share_id,)
    ).fetchone()

    if collection is None:
        connection.close()
        return jsonify({"error": "Collection not found"}), 404

    images = connection.execute(
        "SELECT * FROM images WHERE collection_id = ?",
        (collection["id"],)
    ).fetchall()

    connection.close()

    return jsonify({
        "collection": dict(collection),
        "images": [dict(image) for image in images]
    })

if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)