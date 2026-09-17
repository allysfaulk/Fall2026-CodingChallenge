from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

collections = [
    {"id": 1, "name": "Nature"},
    {"id": 2, "name": "Travel"}
]


@app.route("/collections", methods=["GET"])
def get_collections():
    return jsonify(collections)


@app.route("/collections", methods=["POST"])
def create_collection():
    data = request.get_json()

    new_collection = {
        "id": len(collections) + 1,
        "name": data["name"]
    }

    collections.append(new_collection)

    return jsonify(new_collection), 201


if __name__ == "__main__":
    app.run(debug=True)