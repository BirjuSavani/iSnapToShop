import json
import os
import io
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
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# -------------------- CONFIG --------------------
CHROMA_DB_PATH = "slug_chroma_db"
COLLECTION_NAME = "product_index"
EMBEDDING_DIM = 1024
MODEL_ID = "openai/clip-vit-base-patch32"
LOCAL_MODEL_DIR = "clip_model"
# LOCAL_MODEL_DIR = "clip_model_cache"

# -------------------- LOAD MODEL --------------------
print("Loading CLIP model...")

try:
    if not os.path.exists(LOCAL_MODEL_DIR) or not os.listdir(LOCAL_MODEL_DIR):
        print("Model not found locally. Downloading from Hugging Face...")
        snapshot_download(repo_id=MODEL_ID, local_dir=LOCAL_MODEL_DIR, local_dir_use_symlinks=False)
    else:
        print("Using locally cached model.")

    clip_model = CLIPModel.from_pretrained(LOCAL_MODEL_DIR)
    processor = CLIPProcessor.from_pretrained(LOCAL_MODEL_DIR)
except Exception as e:
    print(f"Failed to load model from local cache: {e}")
    print("Attempting to load model directly from Hugging Face...")
    model = CLIPModel.from_pretrained(MODEL_ID)
    processor = CLIPProcessor.from_pretrained(MODEL_ID)

print("Model and processor loaded successfully.")

# -------------------- GEMINI MODEL SETUP --------------------
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai_client = genai.Client(
    api_key=GOOGLE_API_KEY
)

gemini_model = "gemini-2.0-flash-preview-image-generation"

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

def generate_image_bytes(prompt):
    try:
        contents = [
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=prompt)],
            ),
        ]   
        generate_content_config = types.GenerateContentConfig(
            response_modalities=["IMAGE", "TEXT"],
            response_mime_type="text/plain",
        )   
        for chunk in genai_client.models.generate_content_stream(
            model=gemini_model,
            contents=contents,
            config=generate_content_config,
        ):
            if (
                chunk.candidates
                and chunk.candidates[0].content
                and chunk.candidates[0].content.parts
            ):
                part = chunk.candidates[0].content.parts[0]
                if part.inline_data and part.inline_data.data:
                    mime_type = part.inline_data.mime_type
                    data = part.inline_data.data
                    return io.BytesIO(data), mime_type
        return None, None
        
    except Exception as e:
        return None, None

def get_image_embedding_by_image(img: Image.Image) -> list:
    img = img.convert("RGBA")
    inputs = processor(images=img, return_tensors="pt")
    with torch.no_grad():
        features = clip_model.get_image_features(**inputs)
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
                "distance": distance,
                "brand": meta.get("brand", ""),
                "price_marked": meta.get("price_marked_formatted", "N/A"),
                "price_effective": meta.get("price_effective_formatted", "N/A"),
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
        price_obj = item.get("price", {})

        if emb is None:
            return None

        # Extract marked and effective prices
        marked = price_obj.get("marked", {})
        effective = price_obj.get("effective", {})

        def format_price(price_data: dict) -> str:
            min_price = price_data.get("min")
            max_price = price_data.get("max")
            currency_symbol = price_data.get("currency_symbol", "")
            if min_price is not None and max_price is not None:
                if min_price == max_price:
                    return f"{currency_symbol}{min_price}"
                else:
                    return f"{currency_symbol}{min_price} - {currency_symbol}{max_price}"
            return "N/A"

        marked_price_str = format_price(marked)
        effective_price_str = format_price(effective)

        # Extract brand name
        brand = item.get("brand", {})
        brand_name = brand.get("name", "")

        return {
            "id": f"{slug}_{id_counter}",
            "embedding": emb,
            "document": name,
            "metadata": {
                "name": name,
                "slug": slug,
                "image": img_url,
                "application_id": application_id,
                "brand": brand_name,
                # "price_marked_min": marked.get("min"),
                # "price_marked_max": marked.get("max"),
                "price_marked_formatted": marked_price_str,
                # "price_effective_min": effective.get("min"),
                # "price_effective_max": effective.get("max"),
                "price_effective_formatted": effective_price_str,
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

        # Batch insert into ChromaDB in chunks of 5000
        for i in range(0, len(final_results), 5000):
            chunk = final_results[i:i + 5000]
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