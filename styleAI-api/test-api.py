#!/usr/bin/env python3
"""
Test script for StyleAI API server
This script tests the health check endpoint and image processing endpoint
"""

import requests
import base64
import argparse
import sys
import os
from time import sleep
import json
import uuid
from PIL import Image
import io

# API base URL
API_URL = "http://localhost:5001"

def test_health():
    """Test the health check endpoint"""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{API_URL}/health")
        if response.status_code == 200 and response.json().get("status") == "ok":
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        return False

def test_image_processing(image_path=None):
    """Test the image processing endpoint"""
    if not image_path:
        print("Skipping image processing test (no image provided)")
        return True
    
    print(f"Testing image processing with {image_path}...")
    try:
        # Read and encode image
        with open(image_path, "rb") as img_file:
            img_data = img_file.read()
            
        # Get image format
        img = Image.open(io.BytesIO(img_data))
        img_format = img.format.lower()
        
        # Encode to base64
        encoded = base64.b64encode(img_data).decode('utf-8')
        
        # Prepare request data
        data = {
            "image": f"data:image/{img_format};base64,{encoded}"
        }
        
        # Send request
        response = requests.post(
            f"{API_URL}/api/image/process",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Image processing successful")
            print(f"   - Original size: {result.get('original_size', 'N/A')} bytes")
            print(f"   - Processed size: {result.get('processed_size', 'N/A')} bytes")
            return True
        else:
            print(f"❌ Image processing failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Image processing failed: {str(e)}")
        return False

def test_personalized_analysis():
    """Test the personalized analysis endpoint"""
    print("Testing personalized analysis endpoint...")
    try:
        # Generate a random job ID
        job_id = str(uuid.uuid4())
        
        # Prepare request data
        data = {
            "jobId": job_id
        }
        
        # Send request
        response = requests.post(
            f"{API_URL}/api/personalized/analysis",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success" and result.get("jobId") == job_id:
                print("✅ Personalized analysis successful")
                return True
            else:
                print(f"❌ Personalized analysis failed: Invalid response data")
                return False
        else:
            print(f"❌ Personalized analysis failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Personalized analysis failed: {str(e)}")
        return False

def test_wear_suit_pictures():
    """Test the wear suit pictures endpoint"""
    print("Testing wear suit pictures endpoint...")
    try:
        # Generate a random job ID
        job_id = str(uuid.uuid4())
        
        # Prepare request data
        data = {
            "jobId": job_id
        }
        
        # Send request
        response = requests.post(
            f"{API_URL}/api/personalized/wear-suit-pictures",
            json=data
        )
        
        if response.status_code == 200:
            result = response.json()
            if result.get("status") == "success" and result.get("jobId") == job_id:
                print("✅ Wear suit pictures successful")
                return True
            else:
                print(f"❌ Wear suit pictures failed: Invalid response data")
                return False
        else:
            print(f"❌ Wear suit pictures failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ Wear suit pictures failed: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Test the StyleAI API server")
    parser.add_argument("--image", help="Path to an image file for testing image processing")
    parser.add_argument("--url", help="API server URL (default: http://localhost:5001)", default="http://localhost:5001")
    args = parser.parse_args()
    
    global API_URL
    API_URL = args.url
    
    print(f"Testing API server at {API_URL}")
    
    # Test health check
    health_ok = test_health()
    
    # Test image processing if image path provided
    if args.image:
        image_ok = test_image_processing(args.image)
    else:
        image_ok = test_image_processing()
    
    # Test personalized analysis
    analysis_ok = test_personalized_analysis()
    
    # Test wear suit pictures
    suit_ok = test_wear_suit_pictures()
    
    # Print summary
    if health_ok and image_ok and analysis_ok and suit_ok:
        print("All tests passed!")
        return 0
    else:
        print("Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 