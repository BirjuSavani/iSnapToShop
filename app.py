import subprocess
import sys

def install_requirements():
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

try:
    from PIL import Image
except ImportError:
    print("PIL module not found. Installing requirements...")
    install_requirements()

from flask import Flask, request, jsonify, send_file
import mimetypes
from PIL import Image
from utils import (
    txt2image_embeddings,
    get_image_embedding_by_image,
    chroma_search,
    format_results,
    check_api_key,
    collection,
    generate_image_bytes,
)

app = Flask(__name__)

@app.route("/", methods=["GET"])
def home():
    return "Welcome to the CLIP + ChromaDB API"

@app.route("/embeddings_store", methods=["POST"])
def embeddings_store():
    data = request.get_json()
    api_key = request.headers.get("X-API-KEY")

    if not check_api_key(api_key):
        return jsonify({"message": "Wrong API key"}), 401

    if not data:
        return jsonify({"error": "No data provided"}), 400

    result = txt2image_embeddings(data)
    return jsonify(result)  # result is already a dict

@app.route("/search/image", methods=["POST"])
def search_by_image():
    api_key = request.headers.get("X-API-KEY")
    if not check_api_key(api_key):
        return jsonify({"message": "Wrong API key"}), 401

    if "image" not in request.files:
        return jsonify({"error": "Missing image file in request"}), 400

    try:
        img = Image.open(request.files["image"].stream)
        q_emb = get_image_embedding_by_image(img)
        result = chroma_search(q_emb)
        formatted_result = format_results(result)

        if formatted_result:
            return jsonify(formatted_result)
        else:
            return jsonify({"message": "No match found"}), 404
    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500

@app.route("/delete_embeddings", methods=["POST"])
def delete_embeddings():
    data = request.get_json()
    api_key = request.headers.get("X-API-KEY")

    if not check_api_key(api_key):
        return jsonify({"message": "Wrong API key"}), 401

    application_id = data.get("application_id") if data else None
    if not application_id:
        return jsonify({"error": "application_id not provided"}), 400

    try:
        results = collection.get(where={"application_id": application_id})

        if not results or not results.get("ids"):
            return jsonify({"message": "No embeddings found for this application_id."}), 404

        collection.delete(ids=results["ids"])
        return jsonify({"message": f"Deleted {len(results['ids'])} embeddings for application_id: {application_id}"}), 200

    except Exception as e:
        return jsonify({"error": f"Internal error: {str(e)}"}), 500
    
# @app.route("/generate_prompts_to_image", methods=["POST"])
# def generate_image_api():
#     data = request.get_json()
#     if not data or "prompt" not in data:
#         return jsonify({"error": "Missing 'prompt' in request body"}), 400

#     prompt = data["prompt"]
#     image_io, mime_type = generate_image_bytes(prompt)

#     if image_io is None:
#         return jsonify({"error": "Image generation failed"}), 500

#     ext = mimetypes.guess_extension(mime_type) or ".png"
#     return send_file(image_io, mimetype=mime_type, download_name=f"generated_image{ext}") 

@app.route("/generate_prompts_to_image", methods=["POST"])
def generate_image_api():
    try:
        data = request.get_json()
        if not data or "prompt" not in data:
            return jsonify({"error": "Missing 'prompt' in request body"}), 400

        prompt = data["prompt"]

        image_io, mime_type = generate_image_bytes(prompt)

        if image_io is None:
            return jsonify({"error": "Image generation failed"}), 500

        ext = mimetypes.guess_extension(mime_type) or ".png"
        return send_file(
            image_io,
            mimetype=mime_type,
            download_name=f"generated_image{ext}",
            as_attachment=False,
        )

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"}), 200

if __name__ == "__main__":
    # For production, use gunicorn or another WSGI server, disable debug mode.
    app.run(debug=True, host="0.0.0.0", port=5000)