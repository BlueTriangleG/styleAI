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

# 解析属性（排除 Scoring 部分）
def extract_attributes(text):
    try:
        data = json.loads(text)
        attributes = {}
        def traverse_dict(d, prefix=""):
            for key, value in d.items():
                new_key = f"{prefix}{key}" if prefix else key
                if isinstance(value, dict):
                    traverse_dict(value, f"{new_key}.")
                elif isinstance(value, str):
                    attributes[new_key] = value
        traverse_dict(data)
        # 排除以 "Scoring." 开头的键
        return {k: v for k, v in attributes.items() if not k.startswith("Scoring.")}
    except json.JSONDecodeError as e:
        print(f"Error parsing text: {e}")
        return {}

# 从文本中提取评分信息
def extract_score(text):
    try:
        data = json.loads(text)
        scoring = data.get("Scoring", {})
        score = scoring.get("Aesthetic Score", None)
        return score
    except Exception as e:
        print(f"Error extracting score: {e}")
        return None

# 生成嵌入（假设 tokenizer、model、device 已定义）
def generate_embeddings(texts, tokenizer, model, device):
    normalized_texts = [" ".join(text.lower().split()) for text in texts]
    inputs = tokenizer(normalized_texts, return_tensors="pt", padding=True, truncation=True, max_length=512).to(device)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :].cpu().numpy()

# 匹配前五名和后五名
def top_matches(user_text, model_data, tokenizer, model, device):
    start_time = time.time()
    
    user_attributes = extract_attributes(user_text)
    if not user_attributes:
        print("User description parsing failed, unable to match.")
        return [], []
    
    user_texts = list(user_attributes.values())
    user_embeddings = generate_embeddings(user_texts, tokenizer, model, device)
    user_emb_dict = {attr_name: emb for attr_name, emb in zip(user_attributes.keys(), user_embeddings)}

    results = []
    for model_entry in model_data:
        if not all(key in model_entry and model_entry[key] is not None for key in ["image", "attribute_embeddings"]):
            print(f"Skipping invalid entry: {model_entry.get('image', 'Unknown image')}")
            continue
        
        # 提取该模型图片的评分
        score = None
        if ("result" in model_entry and "data" in model_entry["result"] 
            and "outputs" in model_entry["result"]["data"]):
            text = model_entry["result"]["data"]["outputs"]["text"]
            score = extract_score(text)
        
        model_embeddings = model_entry["attribute_embeddings"]
        total_weighted_similarity = 0
        total_weight = 0
        attr_contributions = {}
        common_attrs = set(user_emb_dict.keys()) & set(model_embeddings.keys())
        
        if not common_attrs:
            continue
        
        for attr in common_attrs:
            sim = cosine_similarity([user_emb_dict[attr]], [np.array(model_embeddings[attr])])[0][0]
            squared_sim = sim ** 2  # 计算平方后的相似度
            weight = WEIGHTS.get(attr, 1.0)
            # 仅对权重为 1.0 的属性应用惩罚规则
            if weight == 1.0:
                adjusted_sim = squared_sim if squared_sim >= THRESHOLD else PENALTY_VALUE
            else:
                adjusted_sim = squared_sim  # 权重不为 1.0 时，不应用惩罚
            weighted_sim = weight * adjusted_sim  # 使用调整后的值计算加权相似度
            attr_contributions[attr] = sim  # 存储原始相似度用于显示
            total_weighted_similarity += weighted_sim
            total_weight += weight
        
        weighted_avg_similarity = total_weighted_similarity / total_weight if total_weight > 0 else 0
        results.append({
            "image": os.path.join(model_entry["image"]),
            "similarity": weighted_avg_similarity,
            "contributions": attr_contributions,
            "score": score
        })

    results.sort(key=lambda x: x["similarity"], reverse=True)
    
    top_5 = results[:5]

    # sort top 5 by score
    top_5.sort(key=lambda x: x["score"], reverse=True)
    top_1 = top_5[0] if top_5 else None
    
    end_time = time.time()
    match_time = end_time - start_time
    print(f"Matching process took: {match_time:.2f} seconds")
    return top_1[0]  # return best image name

# entry
def main(user_text, tokenizer, model, device):
    if not user_text:
        print("Failed to retrieve user description, exiting.")
        return

    with open("men_results_with_attr_embeddings.json", "r", encoding="utf-8") as f:
        model_data = json.load(f)

    best_image_name = top_matches(user_text, model_data, tokenizer, model, device)