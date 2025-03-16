import json
from sklearn.metrics.pairwise import cosine_similarity
import requests
import time
import os
import shutil
import logging

# 设置日志记录器
logger = logging.getLogger(__name__)

# Dify API
BASE_URL = "https://api.dify.ai/v1"
API_KEY = "app-uh7Oz9FNxyZ7J65Z4pvFTW4j"
HEADERS = {"Authorization": f"Bearer {API_KEY}"}
USER_ID = "difyuser"

def download_file(url, save_path):
    """
    下载文件或复制本地文件到指定路径
    支持HTTP URL和本地文件路径
    """
    logger.info(f"尝试获取图像: {url}")
    
    # 检查是否是本地文件路径
    if url.startswith('file://'):
        local_path = url[7:]  # 移除 'file://' 前缀
        logger.info(f"检测到本地文件路径: {local_path}")
        if os.path.exists(local_path):
            shutil.copy(local_path, save_path)
            logger.info(f"✅ 已复制本地文件到: {save_path}")
            return True
        else:
            logger.error(f"❌ 本地文件未找到: {local_path}")
            return False
    
    # 直接使用本地文件路径
    elif os.path.exists(url):
        logger.info(f"检测到直接本地文件路径: {url}")
        try:
            shutil.copy(url, save_path)
            logger.info(f"✅ 已复制本地文件到: {save_path}")
            return True
        except Exception as e:
            logger.error(f"❌ 复制文件时出错: {e}")
            return False
    
    # 处理HTTP URL
    else:
        logger.info(f"尝试下载HTTP URL: {url}")
        try:
            response = requests.get(url, stream=True)
            if response.status_code == 200:
                with open(save_path, "wb") as f:
                    for chunk in response.iter_content(1024):
                        f.write(chunk)
                logger.info(f"✅ 已下载并覆盖: {save_path}")
                return True
            else:
                logger.error(f"❌ 下载错误，状态码: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ 下载文件时出错: {e}")
            return False

# upload to Dify
def upload_file(file_path: str, user: str, timeout=5) -> str:
    upload_url = f"{BASE_URL}/files/upload"
    start_time = time.time()
    try:
        print(f"Uploading file: {file_path} ...")
        with open(file_path, "rb") as file:
            files = {"file": (os.path.basename(file_path), file, "image/jpeg")}
            data = {"user": user, "type": "image"}
            response = requests.post(upload_url, headers=HEADERS, files=files, data=data, timeout=timeout)
            if response.status_code == 201:
                file_id = response.json().get("id")
                elapsed = time.time() - start_time
                print(f"Upload successful, File ID: {file_id}, Time: {elapsed:.2f} seconds")
                return file_id
            else:
                print(f"Upload failed, Status code: {response.status_code}, Response: {response.text}")
                return None
    except requests.exceptions.Timeout:
        print(f"Upload timed out (exceeded {timeout} seconds)")
        return None
    except Exception as e:
        print(f"Upload exception: {e}")
        return None

def run_workflow(file_id: str, user: str, response_mode: str = "blocking", timeout=30) -> dict:
    workflow_url = f"{BASE_URL}/workflows/run"
    headers = HEADERS.copy()
    headers["Content-Type"] = "application/json"
    payload = {
        "inputs": {
            "image": {
                "transfer_method": "local_file",
                "upload_file_id": file_id,
                "type": "image"
            }
        },
        "response_mode": response_mode,
        "user": user,
        "temperature": 0,
        "top_p": 0.5,
        "max_tokens": 2048
    }
    start_time = time.time()
    try:
        print(f"Starting workflow, File ID: {file_id} ...")
        response = requests.post(workflow_url, headers=headers, json=payload, timeout=timeout)
        if response.status_code == 200:
            result = response.json()
            elapsed = time.time() - start_time
            print(f"Workflow executed successfully, Time: {elapsed:.2f} seconds")
            return result
        else:
            print(f"Workflow failed, Status code: {response.status_code}, Response: {response.text}")
            return None
    except requests.exceptions.Timeout:
        print(f"Workflow timed out (exceeded {timeout} seconds)")
        return None
    except Exception as e:
        print(f"Workflow exception: {e}")
        return None

# process user input
def process_single_image(save_path: str) -> str:
    start_total = time.time()
    file_id = upload_file(save_path, USER_ID)
    workflow_result = run_workflow(file_id, USER_ID, timeout=30)
    if workflow_result and "data" in workflow_result and "outputs" in workflow_result["data"]:
        total_time = time.time() - start_total
        print(f"Total processing completed, Total time: {total_time:.2f} seconds")
        return workflow_result["data"]["outputs"]["text"]
    else:
        print("Failed to retrieve valid description text.")
        return None

def clean_markdown_json(md_str: str) -> str:
    """
    移除 JSON 字符串中的 Markdown 代码块标记（例如 ```json 和 ```）。
    """
    if md_str.startswith("```json"):
        md_str = md_str[len("```json"):].strip()
    if md_str.endswith("```"):
        md_str = md_str[:-3].strip()
    return md_str


# entry
def main(user_image_url):
    """
    Main function to process user input image and return the description text.
    Parameters:
        user_image_url (str): URL or local file path of the user input image.
                             Supports HTTP URLs, local file paths (with 'file://' prefix),
                             and absolute file paths.
    """
    logger.info(f"开始处理图像: {user_image_url}")
    
    # 创建输出目录
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)
    
    # 检查是否是绝对路径且文件存在
    if os.path.isabs(user_image_url) and os.path.exists(user_image_url):
        logger.info(f"检测到有效的绝对文件路径: {user_image_url}")
        # 直接使用绝对路径处理图像
        logger.info("开始处理图像...")
        user_text = process_single_image(user_image_url)
        if not user_text:
            logger.error("获取用户描述失败，退出")
            return None
        
        logger.info(f"成功获取分析结果: {user_text[:100]}...")
        return user_text
    
    # 如果不是绝对路径或文件不存在，则尝试下载或复制
    save_path = os.path.join(output_dir, "downloaded_input.jpg")
    logger.info(f"将保存图像到: {save_path}")
    
    # 下载或复制图像
    if not download_file(user_image_url, save_path):
        logger.error("获取输入图像失败，退出")
        return None
    
    # 检查文件是否存在
    if not os.path.exists(save_path):
        logger.error(f"保存的图像文件不存在: {save_path}")
        return None
    
    # 检查文件大小
    file_size = os.path.getsize(save_path)
    logger.info(f"图像文件大小: {file_size} 字节")
    
    # 处理图像
    logger.info("开始处理图像...")
    user_text = process_single_image(save_path)
        
    if not user_text:
        logger.error("获取用户描述失败，退出")
        return None
    else:
        user_text = user_text.strip("```json").strip("```")
    logger.info(f"成功获取分析结果: {user_text[:100]}...")
    return user_text