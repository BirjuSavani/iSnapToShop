import json
import os
import requests
import asyncio
import aiohttp
import torch
import numpy as np
from io import BytesIO
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
from transformers import CLIPModel, CLIPProcessor
from chromadb import PersistentClient
from huggingface_hub import snapshot_download

# -------------------- CONFIG --------------------
CHROMA_DB_PATH = "slug_chroma_db"
COLLECTION_NAME = "product_index"
EMBEDDING_DIM = 512
MODEL_ID = "openai/clip-vit-base-patch32"
LOCAL_MODEL_DIR = "clip_model"

# -------------------- LOAD MODEL --------------------
print("Loading CLIP model...")

try:
    if not os.path.exists(LOCAL_MODEL_DIR) or not os.listdir(LOCAL_MODEL_DIR):
        print("Model not found locally. Downloading from Hugging Face...")
        snapshot_download(repo_id=MODEL_ID, local_dir=LOCAL_MODEL_DIR, local_dir_use_symlinks=False)
    else:
        print("Using locally cached model.")

    model = CLIPModel.from_pretrained(LOCAL_MODEL_DIR)
    processor = CLIPProcessor.from_pretrained(LOCAL_MODEL_DIR)
except Exception as e:
    print(f"Failed to load model from local cache: {e}")
    print("Attempting to load model directly from Hugging Face...")
    model = CLIPModel.from_pretrained(MODEL_ID)
    processor = CLIPProcessor.from_pretrained(MODEL_ID)

print("Model and processor loaded successfully.")

# -------------------- CHROMA DB SETUP --------------------
print("Connecting to Chroma DB...")
client = PersistentClient(path=CHROMA_DB_PATH)
existing_collections = [col.name for col in client.list_collections()]

if COLLECTION_NAME in existing_collections:
    collection = client.get_collection(name=COLLECTION_NAME)
    print(f"Using existing collection: {COLLECTION_NAME}")
else:
    collection = client.create_collection(name=COLLECTION_NAME)
    print(f"Created new collection: {COLLECTION_NAME}")

print("Ready to encode and store image embeddings.")

# -------------------- UTILS --------------------

def check_api_key(api_key: str) -> bool:
    return str(api_key) == "FYND@AI/ML@2025"

def get_image_embedding_by_image(img: Image.Image) -> list:
    img = img.convert("RGBA")
    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        features = model.get_image_features(**inputs)
        features = features / features.norm(p=2, dim=-1, keepdim=True)
    return features.cpu().numpy().flatten().tolist()

def get_image_embedding_by_url(url: str) -> list | None:
    try:
        response = requests.get(url, timeout=5)
        img = Image.open(BytesIO(response.content)).convert("RGBA")
        inputs = processor(images=img, return_tensors="pt")
        with torch.no_grad():
            features = model.get_image_features(**inputs)
            features = features / features.norm(p=2, dim=-1, keepdim=True)
        return features.cpu().numpy().flatten().tolist()
    except requests.exceptions.RequestException as req_err:
        print(f"Network error for {url}: {req_err}")
    except Exception as e:
        print(f"Image processing error for {url}: {e}")
    return None

def chroma_search(query_emb: list, k: int = 20) -> dict:
    return collection.query(
        query_embeddings=[query_emb],
        n_results=k,
        include=["documents", "metadatas", "distances"]
    )

def format_results(result: dict) -> list:
    output = []
    for doc, meta, distance in zip(result["documents"][0], result["metadatas"][0], result["distances"][0]):
        if distance < 0.5:
            output.append({
                "name": meta.get("name", ""),
                "slug": meta.get("slug", ""),
                "image": meta.get("image", ""),
                "text": doc,
                "distance": distance
            })
    return output

# -------------------- ASYNC IMAGE DOWNLOAD --------------------

async def fetch_image(session: aiohttp.ClientSession, url: str) -> Image.Image | None:
    try:
        async with session.get(url, timeout=10) as resp:
            if resp.status == 200:
                content = await resp.read()
                return Image.open(BytesIO(content)).convert("RGBA")
            else:
                print(f"HTTP {resp.status} for {url}")
    except Exception as e:
        print(f"Failed to download {url}: {e}")
    return None

async def fetch_all_images(image_tasks: list) -> list:
    connector = aiohttp.TCPConnector(limit=20)
    async with aiohttp.ClientSession(connector=connector) as session:
        tasks = [fetch_image(session, url) for _, url, _ in image_tasks]
        return await asyncio.gather(*tasks)

# -------------------- EMBEDDING --------------------

def embed_image(item: dict, img_url: str, id_counter: int, image: Image.Image, application_id: str | None = None) -> dict | None:
    try:
        name = item.get("name", "")
        slug = item.get("slug", "")
        emb = get_image_embedding_by_image(image)
        if emb is None:
            return None
        return {
            "id": f"{slug}_{id_counter}",
            "embedding": emb,
            "document": name,
            "metadata": {
                "name": name,
                "slug": slug,
                "image": img_url,
                "application_id": application_id
            }
        }
    except Exception as e:
        print(f"Error embedding {img_url}: {e}")
        return None

def txt2image_embeddings(json_input) -> dict:
    try:
        products_json = json.loads(json_input) if isinstance(json_input, str) else json_input
        print("JSON loaded.")
        application_id = products_json.get("application_id", "")
        print(f"Downloading and embedding images for Application ID: {application_id}")

        image_tasks = []
        id_counter = 0
        for item in products_json.get("products", []):
            for img_obj in item.get("media", []):
                image_tasks.append((item, img_obj.get("url"), id_counter))
                id_counter += 1

        if not image_tasks:
            return {"status": "warning", "message": "No image URLs found in input."}

        images = asyncio.run(fetch_all_images(image_tasks))

        final_results = []
        with ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
            futures = [
                executor.submit(embed_image, item, img_url, id_counter, image, application_id)
                for (item, img_url, id_counter), image in zip(image_tasks, images) if image is not None
            ]
            for future in futures:
                result = future.result()
                if result:
                    final_results.append(result)

        if not final_results:
            return {"status": "warning", "message": "No valid image embeddings generated."}

        # Batch insert into ChromaDB in chunks of 1000
        for i in range(0, len(final_results), 1000):
            chunk = final_results[i:i + 1000]
            collection.add(
                ids=[r["id"] for r in chunk],
                embeddings=[r["embedding"] for r in chunk],
                documents=[r["document"] for r in chunk],
                metadatas=[r["metadata"] for r in chunk],
            )

        return {
            "status": "success",
            "message": f"Saved {len(final_results)} image entries to Chroma collection."
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Error: {str(e)}"
        }


# import json
# import re
# from chromadb.errors import NotFoundError
# import torch
# import requests
# import numpy as np
# from io import BytesIO
# from PIL import Image
# from bs4 import BeautifulSoup
# from chromadb import PersistentClient
# from huggingface_hub import snapshot_download
# import os
# import aiohttp
# import asyncio
# from concurrent.futures import ThreadPoolExecutor
# from transformers import CLIPModel, CLIPProcessor

# # -------------------- CONFIG --------------------
# CHROMA_DB_PATH = "slug_chroma_db"
# COLLECTION_NAME = "product_index"
# EMBEDDING_DIM = 512

# # -------------------- LOAD MODEL --------------------
# print("Loading CLIP model...")

# model_id = "openai/clip-vit-base-patch32"
# local_dir = "/home/birju/Documents/POC/fynd-demo/Hacktimus2025/Image_processing/clip_model"

# try:
#    # Check if the model is cached locally
#    if not os.path.exists(local_dir) or not os.listdir(local_dir):
#        print("Model not found locally. Downloading from Hugging Face...")
#        snapshot_download(repo_id=model_id, local_dir=local_dir, local_dir_use_symlinks=False)
#    else:
#        print("Using locally cached model.")

#    # Attempt to load from local directory
#    model = CLIPModel.from_pretrained(local_dir)
#    processor = CLIPProcessor.from_pretrained(local_dir)
# except Exception as e:
#    print(f"Failed to load model from local cache. Reason: {e}")
#    print("Attempting to load model directly from Hugging Face...")
#    model = CLIPModel.from_pretrained(model_id)
#    processor = CLIPProcessor.from_pretrained(model_id)

# print("Model and processor loaded successfully.")


# # -------------------- CHROMA DB SETUP --------------------
# print("Connecting to Chroma DB...")
# client = PersistentClient(path=CHROMA_DB_PATH)


# existing_collections = [col.name for col in client.list_collections()]


# if COLLECTION_NAME in existing_collections:
#    collection = client.get_collection(name=COLLECTION_NAME)
#    print(f"Using existing collection: {COLLECTION_NAME}")
# else:
#    collection = client.create_collection(name=COLLECTION_NAME)
#    print(f"Created new collection: {COLLECTION_NAME}")


# print("Encoding and storing image embeddings...")

# # -------------------- Check API KEY --------------------
# def check_api_key(api_key):
#    return str(api_key) == "FYND@AI/ML@2025"
  
# # -------------------- IMAGE EMBEDDING --------------------
# def get_image_embedding_by_image(img: Image.Image):
#    img = img.convert("RGBA")
#    inputs = processor(images=img, return_tensors="pt")


#    with torch.no_grad():
#        features = model.get_image_features(**inputs)
#        features = features / features.norm(p=2, dim=-1, keepdim=True)
#    return features.cpu().numpy().flatten().tolist()


# def get_image_embedding_by_url(url):
#    try:
#        response = requests.get(url, timeout=5)
#        img = Image.open(BytesIO(response.content))

#        # Convert palette or other non-RGBA images safely
#        if img.mode != "RGBA":
#            img = img.convert("RGBA")

#        inputs = processor(images=img, return_tensors="pt")

#        with torch.no_grad():
#            features = model.get_image_features(**inputs)
#            features = features / features.norm(p=2, dim=-1, keepdim=True)

#        return features.cpu().numpy().flatten().tolist()
  
#    except requests.exceptions.RequestException as req_err:
#        print(f"Network error for {url}: {req_err}")
#        return None
#    except Exception as e:
#        print(f"Image processing error for {url}: {e}")
#        return None
  
# # -------------------- CHROMA_DB SEARCH --------------------
# def chroma_search(query_emb, k=20):
#    results = collection.query(
#        query_embeddings=[query_emb],
#        n_results=k,
#        include=["documents", "metadatas","distances"]
#    )
#    return results


# # -------------------- FORMAT RESULTS --------------------
# def format_results(result):
#    output = []
#    for doc, meta, distance in zip(result["documents"][0], result["metadatas"][0],result["distances"][0]):
#        if distance < 0.5:
#            output.append({
#                "name": meta.get("name", ""),
#                "slug": meta.get("slug", ""),
#                "image": meta.get("image", ""),
#                "text": doc,
#                "distance" : distance
#            })
#    return output

# # Asynchronous image downloader using aiohttp
# async def fetch_image(session, url):
#    try:
#        async with session.get(url, timeout=10) as resp:
#            if resp.status == 200:
#                content = await resp.read()
#                return Image.open(BytesIO(content)).convert("RGBA")
#            else:
#                print(f"HTTP {resp.status} for {url}")
#    except Exception as e:
#        print(f"Failed to download {url}: {e}")
#    return None

# async def fetch_all_images(image_tasks):
#    connector = aiohttp.TCPConnector(limit=20)
#    async with aiohttp.ClientSession(connector=connector) as session:
#        tasks = [fetch_image(session, url) for _, url, _ in image_tasks]
#        images = await asyncio.gather(*tasks)
#        return images




# def embed_image(item, img_url, id_counter, image, application_id=None):
#    try:
#        name = item.get("name", "")
#        slug = item.get("slug", "")
#        emb = get_image_embedding_by_image(image)
#        if emb is None:
#            return None


#        return {
#            "id": f"{slug}_{id_counter}",
#            "embedding": emb,
#            "document": name,
#            "metadata": {
#                "name": name,
#                "slug": slug,
#                "image": img_url,
#                "application_id": application_id
#            }
#        }
#    except Exception as e:
#        print(f"Error embedding {img_url}: {e}")
#        return None

# def txt2image_embeddings(json_input):
#    try:
#        # Load JSON if input is string
#        if isinstance(json_input, str):
#            products_json = json.loads(json_input)
#        else:
#            products_json = json_input

#        print("JSON loaded.")
#        application_id = products_json.get("application_id", "")
#        print("Downloading and embedding images for Application ID:", application_id)


#        # Prepare image tasks
#        image_tasks = []
#        id_counter = 0
#        for item in products_json.get("products", []):
#            for img_obj in item.get("media", []):
#                image_tasks.append((item, img_obj.get("url"), id_counter))
#                id_counter += 1


#        if not image_tasks:
#            return {"status": "warning", "message": "No image URLs found in input."}


#        # Asynchronously download all images
#        images = asyncio.run(fetch_all_images(image_tasks))


#        # Run embedding in parallel
#        final_results = []
#        with ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
#            futures = []
#            for (item, img_url, id_counter), image in zip(image_tasks, images):
#                if image is None:
#                    continue
#                futures.append(
#                    executor.submit(embed_image, item, img_url, id_counter, image, application_id)
#                )


#            for future in futures:
#                result = future.result()
#                if result is not None:
#                    final_results.append(result)


#        if not final_results:
#            return {"status": "warning", "message": "No valid image embeddings generated."}


#        # Batch insert into ChromaDB
#        for i in range(0, len(final_results), 1000):
#            chunk = final_results[i:i + 1000]
#            collection.add(
#                ids=[r["id"] for r in chunk],
#                embeddings=[r["embedding"] for r in chunk],
#                documents=[r["document"] for r in chunk],
#                metadatas=[r["metadata"] for r in chunk]
#            )


#        return {
#            "status": "success",
#            "message": f"Saved {len(final_results)} image entries to Chroma collection."
#        }


#    except Exception as e:
#        return {
#            "status": "error",
#            "message": f"Error: {str(e)}"
#        }











# import json
# import re
# from chromadb.errors import NotFoundError
# import torch
# import requests
# import numpy as np
# from io import BytesIO
# from PIL import Image
# from bs4 import BeautifulSoup
# from chromadb import PersistentClient
# from huggingface_hub import snapshot_download
# import os
# import aiohttp
# import asyncio
# from concurrent.futures import ThreadPoolExecutor
# from transformers import CLIPModel, CLIPProcessor

# # -------------------- CONFIG --------------------
# CHROMA_DB_PATH = "slug_chroma_db"
# COLLECTION_NAME = "product_index"
# EMBEDDING_DIM = 512

# # -------------------- LOAD MODEL --------------------
# print("📦 Loading CLIP model...")

# model_id = "openai/clip-vit-base-patch32"
# local_dir = "/home/birju/Documents/POC/fynd-demo/Hacktimus2025/Image_processing/clip_model"

# try:
#     # Check if the model is cached locally
#     if not os.path.exists(local_dir) or not os.listdir(local_dir):
#         print("⚠️ Model not found locally. Downloading from Hugging Face...")
#         snapshot_download(repo_id=model_id, local_dir=local_dir, local_dir_use_symlinks=False)
#     else:
#         print("✅ Using locally cached model.")

#     # Attempt to load from local directory
#     model = CLIPModel.from_pretrained(local_dir)
#     processor = CLIPProcessor.from_pretrained(local_dir)
# except Exception as e:
#     print(f"❌ Failed to load model from local cache. Reason: {e}")
#     print("🌐 Attempting to load model directly from Hugging Face...")
#     model = CLIPModel.from_pretrained(model_id)
#     processor = CLIPProcessor.from_pretrained(model_id)

# print("✅ Model and processor loaded successfully.")

# # -------------------- CHROMA DB SETUP --------------------
# print("🔧 Connecting to Chroma DB...")
# client = PersistentClient(path=CHROMA_DB_PATH)

# existing_collections = [col.name for col in client.list_collections()]

# if COLLECTION_NAME in existing_collections:
#     collection = client.get_collection(name=COLLECTION_NAME)
#     print(f"📂 Using existing collection: {COLLECTION_NAME}")
# else:
#     collection = client.create_collection(name=COLLECTION_NAME)
#     print(f"🆕 Created new collection: {COLLECTION_NAME}")

# print("🧠 Encoding and storing image embeddings...")

# # -------------------- Check API KEY --------------------
# def check_api_key(api_key):
#     return str(api_key) == "FYND@AI/ML@2025"
    
# # -------------------- IMAGE EMBEDDING --------------------
# def get_image_embedding_by_image(img: Image.Image):
#     img = img.convert("RGB")
#     inputs = processor(images=img, return_tensors="pt")

#     with torch.no_grad():
#         features = model.get_image_features(**inputs)
#         features = features / features.norm(p=2, dim=-1, keepdim=True)
#     return features.cpu().numpy().flatten().tolist()

# def get_image_embedding_by_url(url):
#     try:
#         response = requests.get(url, timeout=5) 
#         img = Image.open(BytesIO(response.content))

#         # Convert palette or other non-RGBA images safely
#         if img.mode != "RGBA":
#             img = img.convert("RGBA")

#         inputs = processor(images=img, return_tensors="pt")

#         with torch.no_grad():
#             features = model.get_image_features(**inputs)
#             features = features / features.norm(p=2, dim=-1, keepdim=True)

#         return features.cpu().numpy().flatten().tolist()
    
#     except requests.exceptions.RequestException as req_err:
#         print(f"❌ Network error for {url}: {req_err}")
#         return None
#     except Exception as e:
#         print(f"❌ Image processing error for {url}: {e}")
        
#         return None
    
# # -------------------- CHROMA_DB SEARCH --------------------
# def chroma_search(query_emb, k=5):
#     results = collection.query(
#         query_embeddings=[query_emb],
#         n_results=k,
#         include=["documents", "metadatas","distances"]
#     )
#     return results

# # -------------------- FORMAT RESULTS --------------------
# def format_results(result):
#     output = []
#     for doc, meta, distance in zip(result["documents"][0], result["metadatas"][0],result["distances"][0]):
#         if distance < 0.6:
#             output.append({
#                 "name": meta.get("name", ""),
#                 "slug": meta.get("slug", ""),
#                 "image": meta.get("image", ""),
#                 "text": doc
#             })
#     return output

# # # -------------------- EMBEDDING FUNCTION --------------------
# # def download_image(url):
# #     try:
# #         response = requests.get(url, timeout=5)
# #         response.raise_for_status()
# #         return Image.open(BytesIO(response.content)).convert("RGB")
# #     except Exception as e:
# #         print(f"❌ Failed to download {url}: {e}")
# #         return None

# # def process_image(item, img_url, id_counter):
# #     name = item.get("name", "")
# #     slug = item.get("slug", "")
    
# #     image = download_image(img_url)
# #     if image is None:
# #         return None

# #     emb = get_image_embedding_by_image(image)
# #     if emb is None:
# #         return None

# #     metadata = {
# #         "name": name,
# #         "slug": slug,
# #         "image": img_url
# #     }

# #     return {
# #         "id": f"{slug}_{id_counter}",
# #         "embedding": emb,
# #         "document": name,
# #         "metadata": metadata
# #     }

# # def txt2image_embeddings(json_str):
# #     try:
# #         try:
# #             products_json = json.loads(json_str)  # Handle raw string
# #         except TypeError:
# #             products_json = json_str  # Already parsed

# #         print("✅ JSON loaded.")
# #         print("🧠 Encoding and storing image embeddings...")

# #         tasks = []
# #         id_counter = 0

# #         for item in products_json["products"]["items"]:
# #             images = item.get("images", [])
# #             if not images:
# #                 print(f"⚠️ No images for: {item.get('name', '')}")
# #                 continue

# #             for img_url in images:
# #                 tasks.append((item, img_url, id_counter))
# #                 id_counter += 1

# #         # Process in parallel
# #         with ThreadPoolExecutor(max_workers=10) as executor:
# #             results = list(executor.map(lambda args: process_image(*args), tasks))

# #         # Filter successful results
# #         results = [r for r in results if r is not None]

# #         if not results:
# #             return "⚠️ No valid image embeddings generated."

# #         # Batch insert
# #         collection.add(
# #             ids=[r["id"] for r in results],
# #             embeddings=[r["embedding"] for r in results],
# #             documents=[r["document"] for r in results],
# #             metadatas=[r["metadata"] for r in results]
# #         )

# #         return f"✅ Saved {len(results)} image entries to Chroma collection."

# #     except Exception as e:
# #         return f"❌ Error: {str(e)}"


# # Asynchronous image downloader using aiohttp
# async def fetch_image(session, url):
#     try:
#         async with session.get(url, timeout=10) as resp:
#             if resp.status == 200:
#                 content = await resp.read()
#                 return Image.open(BytesIO(content)).convert("RGB")
#             else:
#                 print(f"❌ HTTP {resp.status} for {url}")
#     except Exception as e:
#         print(f"❌ Failed to download {url}: {e}")
#     return None


# async def fetch_all_images(image_tasks):
#     connector = aiohttp.TCPConnector(limit=20)
#     async with aiohttp.ClientSession(connector=connector) as session:
#         tasks = [fetch_image(session, url) for _, url, _ in image_tasks]
#         images = await asyncio.gather(*tasks)
#         return images


# def embed_image(item, img_url, id_counter, image, application_id=None):
#     try:
#         name = item.get("name", "")
#         slug = item.get("slug", "")
#         emb = get_image_embedding_by_image(image)
#         if emb is None:
#             return None

#         return {
#             "id": f"{slug}_{id_counter}",
#             "embedding": emb,
#             "document": name,
#             "metadata": {
#                 "name": name,
#                 "slug": slug,
#                 "image": img_url,
#                 "application_id": application_id
#             }
#         }
#     except Exception as e:
#         print(f"❌ Error embedding {img_url}: {e}")
#         return None


# # def txt2image_embeddings(json_str):
# #     try:
# #         application_id = json_str.get("application_id")
# #         print("Received data:", application_id)
# #         products_json = json_str

# #         try:
# #             products_json = json.loads(json_str)
# #         except TypeError:
# #             products_json = json_str

# #         print("✅ JSON loaded.")
# #         print("🔄 Downloading and embedding images...")

# #         image_tasks = []
# #         id_counter = 0

# #         application_id = products_json.get("application_id", "")

# #         for item in products_json["products"]:
# #             for img_url in item.get("images", []):
# #                 image_tasks.append((item, img_url, id_counter))
# #                 id_counter += 1

# #         # Async download images
# #         images = asyncio.run(fetch_all_images(image_tasks))

# #         # Run embedding in parallel using thread pool
# #         final_results = []
# #         with ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
# #             futures = []
# #             for i, image in enumerate(images):
# #                 if image is None:
# #                     continue
# #                 item, img_url, id_counter = image_tasks[i]
# #                 futures.append(executor.submit(embed_image, item, img_url, id_counter, image, application_id))

# #             for future in futures:
# #                 result = future.result()
# #                 if result is not None:
# #                     final_results.append(result)

# #         if not final_results:
# #             return "⚠️ No valid image embeddings generated."

# #         # Safe batched insertion into ChromaDB
# #         for i in range(0, len(final_results), 1000):
# #             chunk = final_results[i:i + 1000]
# #             collection.add(
# #                 ids=[r["id"] for r in chunk],
# #                 embeddings=[r["embedding"] for r in chunk],
# #                 documents=[r["document"] for r in chunk],
# #                 metadatas=[r["metadata"] for r in chunk]
# #             )

# #         return f"✅ Saved {len(final_results)} image entries to Chroma collection."

# #     except Exception as e:
# #         return f"❌ Error: {str(e)}"

# def txt2image_embeddings(json_input):
#     try:
#         # Load JSON if input is string
#         if isinstance(json_input, str):
#             products_json = json.loads(json_input)
#         else:
#             products_json = json_input

#         print("✅ JSON loaded.")
#         application_id = products_json.get("application_id", "")
#         print("🔄 Downloading and embedding images for Application ID:", application_id)

#         # Prepare image tasks
#         image_tasks = []
#         id_counter = 0
#         for item in products_json.get("products", []):
#             for img_url in item.get("images", []):
#                 image_tasks.append((item, img_url, id_counter))
#                 id_counter += 1

#         if not image_tasks:
#             return {"status": "warning", "message": "⚠️ No image URLs found in input."}

#         # Asynchronously download all images
#         images = asyncio.run(fetch_all_images(image_tasks))

#         # Run embedding in parallel
#         final_results = []
#         with ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
#             futures = []
#             for (item, img_url, id_counter), image in zip(image_tasks, images):
#                 if image is None:
#                     continue
#                 futures.append(
#                     executor.submit(embed_image, item, img_url, id_counter, image, application_id)
#                 )

#             for future in futures:
#                 result = future.result()
#                 if result is not None:
#                     final_results.append(result)

#         if not final_results:
#             return {"status": "warning", "message": "⚠️ No valid image embeddings generated."}

#         # Batch insert into ChromaDB
#         for i in range(0, len(final_results), 1000):
#             chunk = final_results[i:i + 1000]
#             collection.add(
#                 ids=[r["id"] for r in chunk],
#                 embeddings=[r["embedding"] for r in chunk],
#                 documents=[r["document"] for r in chunk],
#                 metadatas=[r["metadata"] for r in chunk]
#             )

#         return {
#             "status": "success",
#             "message": f"✅ Saved {len(final_results)} image entries to Chroma collection."
#         }

#     except Exception as e:
#         return {
#             "status": "error",
#             "message": f"❌ Error: {str(e)}"
#         }

# # ---------------------------------------------------------------------------------------------

# # import json
# # import re
# # from chromadb.errors import NotFoundError
# # import torch
# # import requests
# # import numpy as np
# # from io import BytesIO
# # from PIL import Image
# # from bs4 import BeautifulSoup
# # from chromadb import PersistentClient
# # from huggingface_hub import snapshot_download
# # import os
# # import aiohttp
# # import asyncio
# # from concurrent.futures import ThreadPoolExecutor
# # from transformers import CLIPModel, CLIPProcessor

# # # -------------------- CONFIG --------------------
# # CHROMA_DB_PATH = "slug_chroma_db"
# # COLLECTION_NAME = "product_index"
# # EMBEDDING_DIM = 512

# # # -------------------- LOAD MODEL --------------------
# # print("📦 Loading CLIP model...")

# # model_id = "openai/clip-vit-base-patch32"
# # local_dir = "C:\\Users\\700055\\Downloads\\clip_model_cache\\clip_model_cache"

# # try:
# #     # Check if the model is cached locally
# #     if not os.path.exists(local_dir) or not os.listdir(local_dir):
# #         print("⚠️ Model not found locally. Downloading from Hugging Face...")
# #         snapshot_download(repo_id=model_id, local_dir=local_dir, local_dir_use_symlinks=False)
# #     else:
# #         print("✅ Using locally cached model.")

# #     # Attempt to load from local directory
# #     model = CLIPModel.from_pretrained(local_dir)
# #     processor = CLIPProcessor.from_pretrained(local_dir)
# # except Exception as e:
# #     print(f"❌ Failed to load model from local cache. Reason: {e}")
# #     print("🌐 Attempting to load model directly from Hugging Face...")
# #     model = CLIPModel.from_pretrained(model_id)
# #     processor = CLIPProcessor.from_pretrained(model_id)

# # print("✅ Model and processor loaded successfully.")

# # # -------------------- CHROMA DB SETUP --------------------
# # print("🔧 Connecting to Chroma DB...")
# # client = PersistentClient(path=CHROMA_DB_PATH)

# # existing_collections = [col.name for col in client.list_collections()]

# # if COLLECTION_NAME in existing_collections:
# #     collection = client.get_collection(name=COLLECTION_NAME)
# #     print(f"📂 Using existing collection: {COLLECTION_NAME}")
# # else:
# #     collection = client.create_collection(name=COLLECTION_NAME)
# #     print(f"🆕 Created new collection: {COLLECTION_NAME}")

# # print("🧠 Encoding and storing image embeddings...")

# # # -------------------- IMAGE EMBEDDING --------------------
# # def get_image_embedding_by_image(img: Image.Image):
# #     img = img.convert("RGB")
# #     inputs = processor(images=img, return_tensors="pt")

# #     with torch.no_grad():
# #         features = model.get_image_features(**inputs)
# #         features = features / features.norm(p=2, dim=-1, keepdim=True)
# #     return features.cpu().numpy().flatten().tolist()

# # def get_image_embedding_by_url(url):
# #     try:
# #         response = requests.get(url, timeout=5) 
# #         img = Image.open(BytesIO(response.content))

# #         # Convert palette or other non-RGBA images safely
# #         if img.mode != "RGBA":
# #             img = img.convert("RGBA")

# #         inputs = processor(images=img, return_tensors="pt")

# #         with torch.no_grad():
# #             features = model.get_image_features(**inputs)
# #             features = features / features.norm(p=2, dim=-1, keepdim=True)

# #         return features.cpu().numpy().flatten().tolist()
    
# #     except requests.exceptions.RequestException as req_err:
# #         print(f"❌ Network error for {url}: {req_err}")
# #         return None
# #     except Exception as e:
# #         print(f"❌ Image processing error for {url}: {e}")
        
# #         return None
    
# # # -------------------- CHROMA_DB SEARCH --------------------
# # def chroma_search(query_emb, k=5):
# #     results = collection.query(
# #         query_embeddings=[query_emb],
# #         n_results=k,
# #         include=["documents", "metadatas"]
# #     )
# #     return results

# # # -------------------- FORMAT RESULTS --------------------
# # def format_results(result):
# #     output = []
# #     for doc, meta in zip(result["documents"][0], result["metadatas"][0]):
# #         output.append({
# #             "name": meta.get("name", ""),
# #             "slug": meta.get("slug", ""),
# #             "image": meta.get("image", ""),
# #             "text": doc
# #         })
# #     return output

# # # # -------------------- EMBEDDING FUNCTION --------------------
# # # def download_image(url):
# # #     try:
# # #         response = requests.get(url, timeout=5)
# # #         response.raise_for_status()
# # #         return Image.open(BytesIO(response.content)).convert("RGB")
# # #     except Exception as e:
# # #         print(f"❌ Failed to download {url}: {e}")
# # #         return None

# # # def process_image(item, img_url, id_counter):
# # #     name = item.get("name", "")
# # #     slug = item.get("slug", "")
    
# # #     image = download_image(img_url)
# # #     if image is None:
# # #         return None

# # #     emb = get_image_embedding_by_image(image)
# # #     if emb is None:
# # #         return None

# # #     metadata = {
# # #         "name": name,
# # #         "slug": slug,
# # #         "image": img_url
# # #     }

# # #     return {
# # #         "id": f"{slug}_{id_counter}",
# # #         "embedding": emb,
# # #         "document": name,
# # #         "metadata": metadata
# # #     }

# # # def txt2image_embeddings(json_str):
# # #     try:
# # #         try:
# # #             products_json = json.loads(json_str)  # Handle raw string
# # #         except TypeError:
# # #             products_json = json_str  # Already parsed

# # #         print("✅ JSON loaded.")
# # #         print("🧠 Encoding and storing image embeddings...")

# # #         tasks = []
# # #         id_counter = 0

# # #         for item in products_json["products"]["items"]:
# # #             images = item.get("images", [])
# # #             if not images:
# # #                 print(f"⚠️ No images for: {item.get('name', '')}")
# # #                 continue

# # #             for img_url in images:
# # #                 tasks.append((item, img_url, id_counter))
# # #                 id_counter += 1

# # #         # Process in parallel
# # #         with ThreadPoolExecutor(max_workers=10) as executor:
# # #             results = list(executor.map(lambda args: process_image(*args), tasks))

# # #         # Filter successful results
# # #         results = [r for r in results if r is not None]

# # #         if not results:
# # #             return "⚠️ No valid image embeddings generated."

# # #         # Batch insert
# # #         collection.add(
# # #             ids=[r["id"] for r in results],
# # #             embeddings=[r["embedding"] for r in results],
# # #             documents=[r["document"] for r in results],
# # #             metadatas=[r["metadata"] for r in results]
# # #         )

# # #         return f"✅ Saved {len(results)} image entries to Chroma collection."

# # #     except Exception as e:
# # #         return f"❌ Error: {str(e)}"


# # # ------------------------ Asynchronous Image Downloader ------------------------

# # # Asynchronous image downloader using aiohttp
# # async def fetch_image(session, url):
# #     try:
# #         async with session.get(url, timeout=10) as resp:
# #             if resp.status == 200:
# #                 content = await resp.read()
# #                 return Image.open(BytesIO(content)).convert("RGB")
# #             else:
# #                 print(f"❌ HTTP {resp.status} for {url}")
# #     except Exception as e:
# #         print(f"❌ Failed to download {url}: {e}")
# #     return None


# # async def fetch_all_images(image_tasks):
# #     connector = aiohttp.TCPConnector(limit=20)
# #     async with aiohttp.ClientSession(connector=connector) as session:
# #         tasks = [fetch_image(session, url) for _, url, _ in image_tasks]
# #         images = await asyncio.gather(*tasks)
# #         return images


# # def embed_image(item, img_url, id_counter, image):
# #     try:
# #         name = item.get("name", "")
# #         slug = item.get("slug", "")
# #         emb = get_image_embedding_by_image(image)
# #         if emb is None:
# #             return None

# #         return {
# #             "id": f"{slug}_{id_counter}",
# #             "embedding": emb,
# #             "document": name,
# #             "metadata": {
# #                 "name": name,
# #                 "slug": slug,
# #                 "image": img_url
# #             }
# #         }
# #     except Exception as e:
# #         print(f"❌ Error embedding {img_url}: {e}")
# #         return None


# # def txt2image_embeddings(json_str):
# #     try:
# #         try:
# #             products_json = json.loads(json_str)
# #         except TypeError:
# #             products_json = json_str

# #         print("✅ JSON loaded.")
# #         print("🔄 Downloading and embedding images...")

# #         image_tasks = []
# #         id_counter = 0

# #         for item in products_json["products"]:
# #             for img_url in item.get("images", []):
# #                 image_tasks.append((item, img_url, id_counter))
# #                 id_counter += 1

# #         # Async download images
# #         images = asyncio.run(fetch_all_images(image_tasks))

# #         # Run embedding in parallel using thread pool
# #         final_results = []
# #         with ThreadPoolExecutor(max_workers=10) as executor:
# #             futures = []
# #             for i, image in enumerate(images):
# #                 if image is None:
# #                     continue
# #                 item, img_url, id_counter = image_tasks[i]
# #                 futures.append(executor.submit(embed_image, item, img_url, id_counter, image))

# #             for future in futures:
# #                 result = future.result()
# #                 if result is not None:
# #                     final_results.append(result)

# #         if not final_results:
# #             return "⚠️ No valid image embeddings generated."

# #         # Safe batched insertion into ChromaDB
# #         for i in range(0, len(final_results), 1000):
# #             chunk = final_results[i:i + 1000]
# #             collection.add(
# #                 ids=[r["id"] for r in chunk],
# #                 embeddings=[r["embedding"] for r in chunk],
# #                 documents=[r["document"] for r in chunk],
# #                 metadatas=[r["metadata"] for r in chunk]
# #             )

# #         return f"✅ Saved {len(final_results)} image entries to Chroma collection."

# #     except Exception as e:
# #         return f"❌ Error: {str(e)}"


# # # import json
# # # import re
# # # from chromadb.errors import NotFoundError
# # # import torch
# # # import requests
# # # import numpy as np
# # # from io import BytesIO
# # # from PIL import Image
# # # from bs4 import BeautifulSoup
# # # from chromadb import PersistentClient
# # # from huggingface_hub import snapshot_download
# # # import os
# # # from transformers import CLIPModel, CLIPProcessor

# # # # -------------------- CONFIG --------------------
# # # CHROMA_DB_PATH = "slug_chroma_db"
# # # COLLECTION_NAME = "product_index"
# # # EMBEDDING_DIM = 512

# # # # -------------------- LOAD MODEL --------------------
# # # print("📦 Loading CLIP model...")

# # # model_id = "openai/clip-vit-base-patch32"
# # # local_dir = "C:\\Users\\700055\\Downloads\\clip_model_cache\\clip_model_cache"

# # # try:
# # #     # Check if the model is cached locally
# # #     if not os.path.exists(local_dir) or not os.listdir(local_dir):
# # #         print("⚠️ Model not found locally. Downloading from Hugging Face...")
# # #         snapshot_download(repo_id=model_id, local_dir=local_dir, local_dir_use_symlinks=False)
# # #     else:
# # #         print("✅ Using locally cached model.")

# # #     # Attempt to load from local directory
# # #     model = CLIPModel.from_pretrained(local_dir)
# # #     processor = CLIPProcessor.from_pretrained(local_dir)
# # # except Exception as e:
# # #     print(f"❌ Failed to load model from local cache. Reason: {e}")
# # #     print("🌐 Attempting to load model directly from Hugging Face...")
# # #     model = CLIPModel.from_pretrained(model_id)
# # #     processor = CLIPProcessor.from_pretrained(model_id)

# # # print("✅ Model and processor loaded successfully.")

# # # # -------------------- CHROMA DB SETUP --------------------
# # # print("🔧 Connecting to Chroma DB...")
# # # client = PersistentClient(path=CHROMA_DB_PATH)

# # # existing_collections = [col.name for col in client.list_collections()]

# # # if COLLECTION_NAME in existing_collections:
# # #     collection = client.get_collection(name=COLLECTION_NAME)
# # #     print(f"📂 Using existing collection: {COLLECTION_NAME}")
# # # else:
# # #     collection = client.create_collection(name=COLLECTION_NAME)
# # #     print(f"🆕 Created new collection: {COLLECTION_NAME}")

# # # print("🧠 Encoding and storing image embeddings...")

# # # # -------------------- IMAGE EMBEDDING --------------------
# # # def get_image_embedding_by_image(img: Image.Image):
# # #     img = img.convert("RGB")
# # #     inputs = processor(images=img, return_tensors="pt")

# # #     with torch.no_grad():
# # #         features = model.get_image_features(**inputs)
# # #         features = features / features.norm(p=2, dim=-1, keepdim=True)
# # #     return features.cpu().numpy().flatten().tolist()

# # # def get_image_embedding_by_url(url):
# # #     try:
# # #         response = requests.get(url, timeout=5) 
# # #         img = Image.open(BytesIO(response.content))

# # #         # Convert palette or other non-RGBA images safely
# # #         if img.mode != "RGBA":
# # #             img = img.convert("RGBA")

# # #         inputs = processor(images=img, return_tensors="pt")

# # #         with torch.no_grad():
# # #             features = model.get_image_features(**inputs)
# # #             features = features / features.norm(p=2, dim=-1, keepdim=True)

# # #         return features.cpu().numpy().flatten().tolist()
    
# # #     except requests.exceptions.RequestException as req_err:
# # #         print(f"❌ Network error for {url}: {req_err}")
# # #         return None
# # #     except Exception as e:
# # #         print(f"❌ Image processing error for {url}: {e}")
        
# # #         return None
    
# # # # -------------------- CHROMA_DB SEARCH --------------------
# # # def chroma_search(query_emb, k=5):
# # #     results = collection.query(
# # #         query_embeddings=[query_emb],
# # #         n_results=k,
# # #         include=["documents", "metadatas"]
# # #     )
# # #     return results

# # # # -------------------- FORMAT RESULTS --------------------
# # # def format_results(result):
# # #     output = []
# # #     for doc, meta in zip(result["documents"][0], result["metadatas"][0]):
# # #         output.append({
# # #             "name": meta.get("name", ""),
# # #             "slug": meta.get("slug", ""),
# # #             "image": meta.get("image", ""),
# # #             "text": doc
# # #         })
# # #     return output

# # # # -------------------- EMBEDDING FUNCTION --------------------
# # # def txt2image_embeddings(json_str):
# # #     try:
# # #         id_counter = 0

# # #         try:
# # #             products_json = json.loads(json_str)  # Only if data is a JSON string
# # #         except TypeError:
# # #             products_json = json_str  # Already a dictionary

# # #         print("✅ JSON loaded.")
# # #         print("🧠 Encoding and storing image embeddings...")

# # #         for item in products_json["items"]:
# # #             name = item.get("name", "")
# # #             slug = item.get("slug", "")
# # #             images = item.get("images", [])

# # #             print(f"images: {images}")
# # #             if not images:
# # #                 print(f"No images found for item: {name}")
# # #                 continue

# # #             for img_url in images:
# # #                 emb = get_image_embedding_by_url(img_url)
# # #                 if emb is None:
# # #                     continue  # Skip failed image
# # #                 metadata = {
# # #                     "name": name,
# # #                     "slug": slug,
# # #                     "image": img_url
# # #                 }
# # #                 print(f"Metadata: {metadata}")
# # #                 collection.add(
# # #                     ids=[f"{slug}_{id_counter}"],
# # #                     embeddings=[emb],
# # #                     documents=[name],
# # #                     metadatas=[metadata]
# # #                 )

# # #                 id_counter += 1

# # #         return f"✅ Saved {id_counter} image entries to Chroma collection."
            
# # #     except Exception as e:
# # #         return f"❌ Error: {str(e)}"