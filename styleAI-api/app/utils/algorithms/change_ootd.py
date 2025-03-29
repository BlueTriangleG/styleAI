import os
import time
import requests
import logging
import uuid
import base64

# 设置日志记录器
logger = logging.getLogger(__name__)

API_KEY = "fa-84gopSsawBwF-4h9E2Uc0WeNaWqerxymZmYH4"
BASE_URL = "https://api.fashn.ai/v1"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}


def submit_prediction(model_image_url, garment_image_url, category="one-pieces", mode="quality", num_samples=1):
    # 检查是否为base64编码的图片
    is_model_base64 = model_image_url.startswith('data:image/')
    is_garment_base64 = garment_image_url.startswith('data:image/')
    
    input_data = {
        "model_image": model_image_url,
        "garment_image": garment_image_url,
        "category": category,
        "mode": mode,
        "garment_photo_type": "auto",
        "num_samples": num_samples,
        "restore_background": True
    }

    response = requests.post(f"{BASE_URL}/run", json=input_data, headers=HEADERS)
    data = response.json()

    prediction_id = data.get("id")
    if not prediction_id:
        print("❌ Error:", data)
        return None

    print(f"✅ Prediction started, ID: {prediction_id}")
    return prediction_id

def check_status(prediction_id, sleep_time=3):
    while True:
        response = requests.get(f"{BASE_URL}/status/{prediction_id}", headers=HEADERS)
        data = response.json()
        status = data.get("status", "unknown")

        if status == "completed":
            print("✅ Prediction completed.")
            return data.get("output", [])
        elif status in ["starting", "in_queue", "processing"]:
            print(f"⏳ Prediction status: {status}... Waiting")
            time.sleep(sleep_time)
        else:
            print("❌ Prediction failed:", data.get("error"))
            return None

def download_images(image_urls, save_dir="outputs"):

    os.makedirs(save_dir, exist_ok=True)
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    output_path = os.path.join(save_dir, f"downloaded_output_{timestamp}.jpg")

    if not image_urls:
        print("❌ No valid URL")
        return None

    # for this use case, only return the first image
    first_image_url = image_urls[0]
    response = requests.get(first_image_url, stream=True)

    if response.status_code == 200:
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)
        print(f"✅ Image saved: {output_path}")
    else:
        print(f"❌ Failed to download image, status code: {response.status_code}")
        return None
    return output_path

# entry
def main(model_image_url, garment_image_url, category="one-pieces", mode="quality", num_samples=1):
    """
    Generate a new outfit image using the StyleAI API.
    Parameters:
        model_image_url (str): URL of the model image (person wearing clothes) or base64 encoded image.
        garment_image_url (str): URL of the garment image (clothes to try on) or base64 encoded image.
        category (str): Category of the garment to generate ("tops", "bottoms", "one-pieces").
        mode (str): Quality mode ("performance", "balanced", "quality").
        num_samples (int): Number of samples to generate.
    Returns:
        str: File path of the downloaded.
    """
    # 检查是否为本地文件路径，如果是则转换为base64
    if os.path.isfile(model_image_url) and not model_image_url.startswith('data:image/'):
        with open(model_image_url, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            model_image_url = f"data:image/jpeg;base64,{encoded_string}"
    
    if os.path.isfile(garment_image_url) and not garment_image_url.startswith('data:image/'):
        with open(garment_image_url, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
            garment_image_url = f"data:image/jpeg;base64,{encoded_string}"
    
    prediction_id = submit_prediction(model_image_url, garment_image_url, category, mode, num_samples)
    if not prediction_id:
        return None

    output_images = check_status(prediction_id)
    if not output_images:
        return None

    output_path = download_images(output_images)
    return output_path

def generate_outfit_images(user_image_path, model=None, categories=None):
    """
    Generate outfit images based on user image and return in API response format
    
    Args:
        user_image_path (str): Path to user image or base64 encoded image
        model (object, optional): Pre-loaded model if available
        categories (list, optional): List of garment categories to generate
        
    Returns:
        dict: API response format with success status and pictures
    """
    if categories is None:
        categories = ["one-pieces", "tops", "bottoms"]
    
    try:
        logger.info(f"Generating outfit images for user image: {user_image_path}")
        
        # 创建输出目录
        output_dir = "outputs"
        if not user_image_path.startswith('data:image/'):
            output_dir = os.path.join(os.path.dirname(user_image_path), "outfits")
        os.makedirs(output_dir, exist_ok=True)
        
        pictures = []
        
        # For each category, generate an outfit image
        for category in categories:
            try:
                # Use a sample model image from the dataset
                # In a real implementation, this would be selected based on user characteristics
                model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                                        "utils", "algorithms", "ALL_images")
                
                # Find a suitable model image
                model_images = []
                for root, dirs, files in os.walk(model_dir):
                    for file in files:
                        if file.endswith(".jpg") or file.endswith(".png"):
                            model_images.append(os.path.join(root, file))
                            if len(model_images) >= 5:  # Limit to 5 images for testing
                                break
                    if len(model_images) >= 5:
                        break
                
                if not model_images:
                    logger.warning("No model images found")
                    continue
                
                # Use the first model image for testing
                model_image_url = model_images[0]
                
                # Generate outfit image
                logger.info(f"Generating {category} outfit using model image: {model_image_url}")
                output_path = main(model_image_url, user_image_path, category=category)
                
                if output_path:
                    # Create a unique ID for this outfit
                    outfit_id = str(uuid.uuid4())
                    
                    # Add to pictures list
                    pictures.append({
                        "id": outfit_id,
                        "url": f"file://{output_path}",  # In production, this would be a web URL
                        "description": f"{category.capitalize()} outfit suggestion"
                    })
                    
                    logger.info(f"Successfully generated {category} outfit: {output_path}")
                else:
                    logger.warning(f"Failed to generate {category} outfit")
            
            except Exception as e:
                logger.error(f"Error generating {category} outfit: {str(e)}")
        
        # Return API response format
        if pictures:
            return {
                "success": True,
                "pictures": pictures
            }
        else:
            logger.warning("No outfit images were generated")
            return {
                "success": False,
                "error": "Failed to generate outfit images",
                "pictures": []
            }
            
    except Exception as e:
        logger.error(f"Error in generate_outfit_images: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "pictures": []
        }
