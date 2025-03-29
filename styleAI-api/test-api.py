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

# 使用已知存在的jobId
KNOWN_JOB_ID = "d2f79de6-ef8c-4e82-9a73-a874a6c96f78"

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


def test_personalized_analysis():
    """Test the personalized analysis endpoint"""
    print("Testing personalized analysis endpoint...")
    try:
        # 使用已知存在的jobId
        job_id = KNOWN_JOB_ID
        
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


def main():
    # 在函数开始处声明全局变量
    global API_URL, KNOWN_JOB_ID
    
    parser = argparse.ArgumentParser(description="Test the StyleAI API server")
    parser.add_argument("--image", help="Path to an image file for testing image processing")
    parser.add_argument("--url", help="API server URL (default: http://localhost:5001)", default="http://localhost:5001")
    parser.add_argument("--job-id", help=f"Job ID for testing (default: {KNOWN_JOB_ID})", default=KNOWN_JOB_ID)
    args = parser.parse_args()
    
    API_URL = args.url
    KNOWN_JOB_ID = args.job_id
    
    print(f"Testing API server at {API_URL}")
    print(f"Using job ID: {KNOWN_JOB_ID}")
    
    # Test health check
    health_ok = test_health()
    
    
    # Test personalized analysis
    analysis_ok = test_personalized_analysis()
    

    # Print summary
    if health_ok:
        print("All tests passed!")
        return 0
    else:
        print("Some tests failed!")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 