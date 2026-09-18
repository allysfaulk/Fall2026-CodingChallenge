import sqlite3
import os
import urllib.parse
import urllib.request
from dotenv import load_dotenv

from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv("backend/.env")

PIXABAY_API_KEY = os.getenv("PIXABAY_API_KEY")

app = Flask(__name__)
CORS(app)

DATABASE = "backend/collections.db"


def get_db_connection():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_db_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS collections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    """)

    connection.execute("""
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        FOREIGN KEY (collection_id) REFERENCES collections (id)
    )
    """)

    try:
        connection.execute(
            "ALTER TABLE images ADD COLUMN caption TEXT DEFAULT ''"
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
    data = request.get_json()

    connection = get_db_connection()

    cursor = connection.execute(
        "INSERT INTO collections (name) VALUES (?)",
        (data["name"],)
    )

    connection.commit()

    new_collection = {
        "id": cursor.lastrowid,
        "name": data["name"]
    }

    connection.close()

    return jsonify(new_collection), 201

@app.route("/collections/<int:collection_id>", methods=["DELETE"])
def delete_collection(collection_id):
    connection = get_db_connection()

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
    data = request.get_json()

    connection = get_db_connection()

    cursor = connection.execute(
        "INSERT INTO images (collection_id, url) VALUES (?, ?)",
        (collection_id, data["url"])
    )

    connection.commit()

    new_image = {
        "id": cursor.lastrowid,
        "collection_id": collection_id,
        "url": data["url"]
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
    query = request.args.get("q", "")

    if not query:
        return jsonify([])

    params = urllib.parse.urlencode({
        "key": PIXABAY_API_KEY,
        "q": query,
        "image_type": "photo",
        "per_page": 12
    })

    url = f"https://pixabay.com/api/?{params}"

    with urllib.request.urlopen(url) as response:
        data = response.read()

    import json
    pixabay_data = json.loads(data)

    results = []

    for image in pixabay_data["hits"]:
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

if __name__ == "__main__":
    initialize_database()
    app.run(debug=True)