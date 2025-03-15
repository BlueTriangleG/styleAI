import os
import time
import requests


API_KEY = "fa-84gopSsawBwF-4h9E2Uc0WeNaWqerxymZmYH4"
BASE_URL = "https://api.fashn.ai/v1"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {API_KEY}"
}

def submit_prediction(model_image_url, garment_image_url, category="one-pieces", mode="quality", num_samples=1):
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
def main(user_input_url, model_image_url, category="one-pieces", mode="quality", num_samples=1):
    """
    Generate a new outfit image using the StyleAI API.
    Parameters:
        user_input_url (str): URL of the user input image.
        model_image_url (str): URL of the model image.
        category (str): Category of the garment to generate ("tops", "bottoms", "one-pieces").
        mode (str): Quality mode ("performance", "balanced", "quality").
        num_samples (int): Number of samples to generate.
    Returns:
        str: File path of the downloaded.
    """
    prediction_id = submit_prediction(user_input_url, model_image_url, category, mode, num_samples)
    if not prediction_id:
        return None

    output_images = check_status(prediction_id)
    if not output_images:
        return None

    output_path = download_images(output_images)
    return output_path
