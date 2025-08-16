import json
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import time
import os



# weights for important attributes
WEIGHTS = {
    "Semantic Features.Temperament Features.Overall Style First Impression": 3.0,
    "Semantic Features.Temperament Features.Style and Temperament Description": 3.0,
    "Structural Features.Body Features.Body Type and Curve Characteristics": 2.0,
    "Structural Features.Body Features.Overall Body Weight Impression": 3.0,
    "Structural Features.Body Features.Limb Thickness and Line Definition": 2.0
    # by default, all other attributes have a weight of 1.0
}

# similarity threshold and penalty value
THRESHOLD = 0.95  # square similarity threshold, below which a penalty is applied
PENALTY_VALUE = 0.3  # punishment value, to which attributes are adjusted if below threshold

# # attribute extraction
# def extract_attributes(text):
#     try:
#         data = json.loads(text)
#         attributes = {}
#         def traverse_dict(d, prefix=""):
#             for key, value in d.items():
#                 new_key = f"{prefix}{key}" if prefix else key
#                 if isinstance(value, dict):
#                     traverse_dict(value, f"{new_key}.")
#                 elif isinstance(value, str):
#                     attributes[new_key] = value
#         traverse_dict(data)
#         # exclude scoring attributes
#         return {k: v for k, v in attributes.items() if not k.startswith("Scoring.")}
#     except json.JSONDecodeError as e:
#         print(f"Error parsing text: {e}")
#         return {}

# def extract_score(text):
#     try:
#         data = json.loads(text)
#         scoring = data.get("Scoring", {})
#         score = scoring.get("Aesthetic Score", None)
#         return score
#     except Exception as e:
#         print(f"Error extracting score: {e}")
#         return None

def extract_attributes_scoring(text):
    try:
        data = json.loads(text)
        attributes = {}
        scoring = {}
        
        def traverse_dict(d, prefix=""):
            for key, value in d.items():
                new_key = f"{prefix}{key}" if prefix else key
                if isinstance(value, dict):
                    traverse_dict(value, f"{new_key}.")
                else:
                    str_value = str(value)
                    if new_key.startswith("Scoring."):
                        scoring[new_key] = str_value
                    else:
                        attributes[new_key] = str_value
        
        traverse_dict(data)
        return attributes, scoring
    except json.JSONDecodeError as e:
        print(f"Error parsing text: {e}")
        return {}, {}

def generate_embeddings(texts, tokenizer, model, device):
    normalized_texts = [" ".join(text.lower().split()) for text in texts]
    inputs = tokenizer(normalized_texts, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].cpu().numpy()

def top_matches(user_text, model_data, tokenizer, model, device):
    start_time = time.time()
    
    # user_attributes = extract_attributes(user_text)
    user_attributes, user_scoring = extract_attributes_scoring(user_text)
    if not user_attributes:
        print("User description parsing failed, unable to match.")
        return [], []

    user_gender = user_attributes.get("Semantic Features.Intrinsic Features.Gender", None)
    if user_gender:
        user_gender = user_gender.lower()

    user_texts = list(user_attributes.values())
    user_embeddings = generate_embeddings(user_texts, tokenizer, model, device)
    user_emb_dict = {attr_name: emb for attr_name, emb in zip(user_attributes.keys(), user_embeddings)}

    results = []
    for model_entry in model_data:
        if not all(k in model_entry and model_entry[k] is not None 
                   for k in ["image", "attribute_embeddings", "result"]):
            print(f"Skipping invalid entry: {model_entry.get('image', 'Unknown image')}")
            continue

        model_attributes, model_scoring = extract_attributes_scoring(model_entry["result"]["data"]["outputs"]["text"])
        
        model_gender = model_attributes.get("Semantic Features.Intrinsic Features.Gender", None)
        # Apply gender matching preference but don't exclude completely
        # Add a penalty to similarity for gender mismatch instead of skipping entirely
        gender_penalty = 0.0
        if user_gender and model_gender and (user_gender != model_gender.lower()):
            gender_penalty = 0.1  # Small penalty for gender mismatch
            print(f"Gender mismatch penalty applied for {model_entry.get('image')}: user {user_gender} vs model {model_gender}")
        else:
            print(f"Gender match or unknown for {model_entry.get('image')}: user {user_gender} vs model {model_gender}")

        # aesthetic_score
        aesthetic_score_str = model_scoring.get("Scoring.Aesthetic Score", "0")
        aesthetic_score = float(aesthetic_score_str) if aesthetic_score_str.replace('.', '', 1).isdigit() else 0

        # # extract score
        # score = None
        # if ("result" in model_entry and "data" in model_entry["result"] 
        #     and "outputs" in model_entry["result"]["data"]):
        #     text = model_entry["result"]["data"]["outputs"]["text"]
        #     score = extract_score(text)
        
        total_weighted_similarity = 0.0
        total_weight = 0.0
        attr_contributions = {}

        model_emb_dict = model_entry["attribute_embeddings"]
        common_attrs = set(user_emb_dict.keys()) & set(model_emb_dict.keys())
        
        mapped_attrs = {
            "Clothing Color Optimization Suggestions": "Clothing Color Description",
            "Style Optimization and Temperament Enhancement Suggestions": "Style and Temperament Description"
        }

        if not common_attrs:
            continue
        
        for attr in common_attrs:
            user_emb = user_emb_dict[attr]
            model_emb = np.array(model_emb_dict[attr])
            sim = cosine_similarity([user_emb], [model_emb])[0][0]
            squared_sim = sim ** 2
            weight = WEIGHTS.get(attr, 1.0)

            # apply penalty if similarity is below threshold
            if weight == 1.0:
                adjusted_sim = squared_sim if squared_sim >= THRESHOLD else PENALTY_VALUE
            else:
                adjusted_sim = squared_sim 
            weighted_sim = weight * adjusted_sim  
            attr_contributions[attr] = sim  
            total_weighted_similarity += weighted_sim
            total_weight += weight
        
        # extra map
        for user_key, model_key in mapped_attrs.items():
            if user_key in user_emb_dict and model_key in model_emb_dict:
                sim = cosine_similarity([user_emb_dict[user_key]], [np.array(model_emb_dict[model_key])])[0][0]
                squared_sim = sim ** 2
                weight = WEIGHTS.get(user_key, 1.0)

                if weight == 1.0:
                    adjusted_sim = squared_sim if squared_sim >= THRESHOLD else PENALTY_VALUE
                else:
                    adjusted_sim = squared_sim

                weighted_sim = weight * adjusted_sim
                attr_contributions[user_key] = sim
                total_weighted_similarity += weighted_sim
                total_weight += weight
        
        weighted_avg_similarity = total_weighted_similarity / total_weight if total_weight > 0 else 0
        # Apply gender penalty to final similarity score
        final_similarity = max(0, weighted_avg_similarity - gender_penalty)
        results.append({
            "image": os.path.join(model_entry["image"]),
            "similarity": final_similarity,
            "contributions": attr_contributions,
            "score": aesthetic_score
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    
    top_5 = results[:5]

    # sort top 5 by score
    top_5.sort(key=lambda x: x["score"], reverse=True)
    top_1 = top_5[0] if top_5 else None
    
    end_time = time.time()
    match_time = end_time - start_time
    print(f"Matching process took: {match_time:.2f} seconds")

    return top_1["image"] if top_1 else None  # return best image name

# entry
def main(user_text, tokenizer, model, device):
    if not user_text:
        print("Failed to retrieve user description, exiting.")
        return

    # 使用绝对路径
    current_dir = os.path.dirname(os.path.abspath(__file__))
    embeddings_file = os.path.join(current_dir, "ALL_final_merged.json")
    
    try:
        with open(embeddings_file, "r", encoding="utf-8") as f:
            model_data = json.load(f)
        print(f"成功加载嵌入数据: {embeddings_file}")
    except Exception as e:
        print(f"加载嵌入数据失败: {str(e)}")
        return None

    best_image_name = top_matches(user_text, model_data, tokenizer, model, device)
    
    return best_image_name