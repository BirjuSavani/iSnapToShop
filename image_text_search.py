# -------------------- IMPORTS --------------------
import json
import re
import faiss
import requests
import numpy as np
from io import BytesIO
from PIL import Image
from docx import Document
from bs4 import BeautifulSoup
from sentence_transformers import SentenceTransformer
import webbrowser

# -------------------- MODEL INIT --------------------
print("Loading CLIP model...")
model = SentenceTransformer('clip-ViT-B-32')
# embedding_dim = model.get_sentence_embedding_dimension()
embedding_dim = 1512 

# -------------------- LOAD JSON FROM .DOCX --------------------
print("Extracting JSON from DOCX...")
doc = Document("/home/ubuntu/SERP_AI/Abhay_Space/Learning/Sample Response.docx")  # Replace with your file name
full_text = "\n".join([para.text for para in doc.paragraphs])

json_match = re.search(r'\{.*\}', full_text, re.DOTALL)

if not json_match:
    raise ValueError("❌ No JSON object found in the document.")

json_str = json_match.group(0)

try:
    decoder = json.JSONDecoder()
    products_json, end_idx = decoder.raw_decode(json_str)
    print("✅ JSON loaded successfully.")
except json.JSONDecodeError as e:
    raise ValueError(f"❌ JSON decode error: {e}")


# -------------------- HELPERS --------------------
def clean_text(html):
    """Strip HTML tags from description fields."""
    return BeautifulSoup(html, "html.parser").get_text(separator=" ").strip()

def get_combined_text(item):
    """Combine name, short_description, full description, and tags into one text blob."""
    name = item.get("name", "")
    short_desc = item.get("short_description", "")
    desc = clean_text(item.get("description", ""))
    tags = " ".join(item.get("tags", []))
    return f"{name}. {short_desc}. {desc}. Tags: {tags}"

def get_image_embedding(url):
    """Generate embedding from an image URL using CLIP."""
    try:
        response = requests.get(url, timeout=5)
        img = Image.open(BytesIO(response.content)).convert("RGB")
        return model.encode(img, convert_to_numpy=True)
    except Exception as e:
        print(f"Image error for {url}:", e)
        return np.zeros(embedding_dim)

def get_text_embedding(text):
    """Generate embedding from text."""
    return model.encode(text, convert_to_numpy=True)

def get_product_embedding(product):
    """Return average of text and image embeddings."""
    text = get_combined_text(product)
    text_emb = get_text_embedding(text)
    
    if product.get("images"):
        img_url = product["images"][0]
        img_emb = get_image_embedding(img_url)
        return ((text_emb + img_emb) / 2).astype("float32")
    else:
        return text_emb.astype("float32")

# -------------------- BUILD FAISS INDEX --------------------
print("Encoding and indexing products...")
product_data = []
embedding_list = []

for item in products_json["products"]["items"]:
    emb = get_product_embedding(item)
    embedding_list.append(emb)
    product_data.append({
        "name": item.get("name", ""),
        "description": get_combined_text(item),
        "image": item["images"][0] if item.get("images") else ""
    })

embedding_matrix = np.array(embedding_list).astype("float32")
index = faiss.IndexFlatL2(embedding_dim)
index.add(embedding_matrix)
print(f"✅ Indexed {len(embedding_list)} products.\n")

# -------------------- SEARCH FUNCTION --------------------
def search_products(query, k=15):
    if isinstance(query, str):
        query_emb = get_text_embedding(query).astype("float32")
    else:
        query_emb = model.encode(query, convert_to_numpy=True).astype("float32")

    D, I = index.search(np.array([query_emb]), k)

    for idx in I[0]:
        product = product_data[idx]
        print(f"\n✅ Product: {product['name']}")
        print(f"📝 Description: {product['description'][:200]}...")
        if product["image"]:
            print(f"🖼 Opening Image: {product['image']}")
            webbrowser.open(product["image"])

# -------------------- USAGE --------------------
if __name__ == "__main__":
    print("\n🔍 Ready to search.\n")

    # 🔎 Test with a text query
    # search_products("white running shoes", k=5)

    # 📷 To search with a local image file, uncomment this:
    from PIL import Image
    query_image = Image.open("/home/ubuntu/SERP_AI/Abhay_Space/Learning/try.png")
    search_products(query_image, k=5)
