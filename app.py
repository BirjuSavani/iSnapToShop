from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
import torch
from utils import txt2image_embeddings, get_image_embedding_by_image, chroma_search, format_results, check_api_key
from utils import model, processor, collection

# -------------------- Init Flask --------------------
app = Flask(__name__)
# -------------------- ROUTE FOR HOME --------------------
@app.route("/", methods=["GET"])
def home():
   return "Welcome to the CLIP + ChromaDB API"

# -------------------- ROUTE FOR STORE IMAGE EMBEDDINGS --------------------
@app.route("/embeddings_store", methods=["POST"])
def embeddings_store():
   data = request.get_json()
   headers = request.headers
   print("Headers:", headers)
   api_key = headers.get('X-API-KEY')
   if not check_api_key(api_key):
       return jsonify({"message": "Wrong API key"}), 401

   if not data:
       return jsonify({"error": "No file provided"}), 400

   result = txt2image_embeddings(data)
   return jsonify({"message": result})

# ------------------- ROUTE FOR SEARCHING SIMILAR IMAGE --------------------
@app.route("/search/image", methods=["POST"])
def search_by_image():
   if "image" not in request.files:
       return jsonify({"error": "Missing image file in request"}), 400

   file = request.files["image"]
   headers = request.headers
   api_key = headers.get('X-API-KEY')
  
   if not check_api_key(api_key):
       return jsonify({"message": "Wrong API key"}), 401

   try:
       img = Image.open(file.stream)
       q_emb = get_image_embedding_by_image(img)
       result = chroma_search(q_emb)
       formatted_result = format_results(result)
       return jsonify(formatted_result) if len(formatted_result)>0 else {"message" : "No match found"}
   except Exception as e:
       return jsonify({"error": str(e)}), 500

# -------------------- ROUTE FOR DELETE EMBEDDING DATA --------------------
@app.route("/delete_embeddings", methods=["POST"])
def delete_embeddings():
   data = request.get_json()
   headers = request.headers
   api_key = headers.get('X-API-KEY')

   if not check_api_key(api_key):
       return jsonify({"message": "Wrong API key"}), 401

   application_id = data.get("application_id")
   print("Received data:", application_id)
   if not application_id:
       return jsonify({"error": "application_id not provided"}), 400

   try:
       # Query for matching embeddings
       results = collection.get(
           where={"application_id": application_id}
       )

       if not results or len(results["ids"]) == 0:
           return jsonify({"message": "No embeddings found for this application_id."}), 404

       # Delete them
       collection.delete(ids=results["ids"])
       return jsonify({"message": f"Deleted {len(results['ids'])} embeddings for application_id: {application_id}"}), 200


   except Exception as e:
       print(f"Error deleting embeddings: {e}")
       return jsonify({"error": str(e)}), 500

# -------------------- ROUTE FOR HEALTH --------------------
@app.route("/health", methods=["GET"])
def health_check():
   return jsonify({"status": "ok"}), 200

# -------------------- Run App --------------------
if __name__ == "__main__":
   app.run(debug=True)











# from flask import Flask, request, jsonify
# from PIL import Image
# import numpy as np
# import torch
# from utils import txt2image_embeddings, get_image_embedding_by_image, chroma_search, format_results, check_api_key 
# from utils import model, processor, collection

# # -------------------- Init Flask --------------------
# app = Flask(__name__)

# # -------------------- ROUTE FOR HOME --------------------
# @app.route("/", methods=["GET"])
# def home():
#     return "Welcome to the CLIP + ChromaDB API"

# # -------------------- ROUTE FOR STORE IMAGE EMBEDDINGS --------------------
# @app.route("/embeddings_store", methods=["POST"])
# def embeddings_store():
#     data = request.get_json()
#     headers = request.headers

#     print("Headers:", headers)
#     api_key = headers.get('X-API-KEY')
    
#     if not check_api_key(api_key):
#         return jsonify({"message": "Wrong API key"}), 401

#     if not data:
#         return jsonify({"error": "No file provided"}), 400

#     result = txt2image_embeddings(data)
#     return jsonify({"message": result})

# # -------------------- ROUTE FOR SEARCHING SIMILAR IMAGE --------------------
# @app.route("/search/image", methods=["POST"])
# def search_by_image():
#     if "image" not in request.files:
#         return jsonify({"error": "Missing image file in request"}), 400

#     file = request.files["image"]
#     headers = request.headers
#     api_key = headers.get('X-API-KEY')
    
#     if not check_api_key(api_key):
#         return jsonify({"message": "Wrong API key"}), 401

#     try:
#         img = Image.open(file.stream)
#         q_emb = get_image_embedding_by_image(img)
#         result = chroma_search(q_emb)
#         formatted_result = format_results(result)
#         return jsonify(formatted_result) if len(formatted_result)>0 else {"message" : "No match found"}

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500

# # -------------------- ROUTE FOR DELETE EMBEDDING DATA --------------------
# @app.route("/delete_embeddings", methods=["POST"])
# def delete_embeddings():
#     data = request.get_json()
#     headers = request.headers
#     api_key = headers.get('X-API-KEY')

#     if not check_api_key(api_key):
#         return jsonify({"message": "Wrong API key"}), 401

#     application_id = data.get("application_id")
#     print("Received data:", application_id)
#     if not application_id:
#         return jsonify({"error": "application_id not provided"}), 400

#     try:
#         # Query for matching embeddings
#         results = collection.get(
#             where={"application_id": application_id}
#         )

#         if not results or len(results["ids"]) == 0:
#             return jsonify({"message": "No embeddings found for this application_id."}), 404

#         # Delete them
#         collection.delete(ids=results["ids"])
#         return jsonify({"message": f"Deleted {len(results['ids'])} embeddings for application_id: {application_id}"}), 200

#     except Exception as e:
#         print(f"❌ Error deleting embeddings: {e}")
#         return jsonify({"error": str(e)}), 500

# # -------------------- ROUTE FOR HEALTH --------------------
# @app.route("/health", methods=["GET"])
# def health_check():
#     return jsonify({"status": "ok"}), 200

# # -------------------- Run App --------------------
# if __name__ == "__main__":
#     app.run(debug=True)


# # from flask import Flask, request, jsonify
# # from PIL import Image
# # import numpy as np
# # import torch
# # from utils import txt2image_embeddings, get_image_embedding_by_image, chroma_search, format_results
# # from utils import model, processor, collection

# # # -------------------- Init Flask --------------------
# # app = Flask(__name__)

# # # -------------------- ROUTE FOR HOME --------------------
# # @app.route("/", methods=["GET"])
# # def home():
# #     return "Welcome to the CLIP + ChromaDB API"

# # # -------------------- ROUTE FOR STORE IMAGE EMBEDDINGS --------------------
# # @app.route("/embeddings_store", methods=["POST"])
# # def embeddings_store():
# #     data = request.get_json()
# #     print("Received data:", data)
# #     if not data:
# #         return jsonify({"error": "No file provided"}), 400

# #     result = txt2image_embeddings(data)
# #     return jsonify({"message": result})

# # # -------------------- ROUTE FOR SEARCHING SIMILAR IMAGE --------------------
# # @app.route("/search/image", methods=["POST"])
# # def search_by_image():
# #     if "image" not in request.files:
# #         return jsonify({"error": "Missing image file in request"}), 400

# #     file = request.files["image"]
# #     try:
# #         img = Image.open(file.stream)
# #         q_emb = get_image_embedding_by_image(img)
# #         result = chroma_search(q_emb)
# #         return jsonify(format_results(result))

# #     except Exception as e:
# #         return jsonify({"error": str(e)}), 500

# # # -------------------- ROUTE FOR HEALTH --------------------
# # @app.route("/health", methods=["GET"])
# # def health_check():
# #     return jsonify({"status": "ok"}), 200

# # # -------------------- Run App --------------------
# # if __name__ == "__main__":
# #     app.run(debug=True)