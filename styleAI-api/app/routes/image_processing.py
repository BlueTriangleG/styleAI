from flask import Blueprint, request, jsonify
import base64
import io
from PIL import Image
import re
import os
import tempfile
import uuid

image_bp = Blueprint('image', __name__, url_prefix='/api/image')

# Maximum file size (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024

@image_bp.route('/process', methods=['POST'])
def process_image():
    """
    Process an image to ensure it's under 5MB and convert to JPEG format
    Accepts base64 encoded image data
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
            
        image_data = data['image']
        
        # Extract MIME type and base64 data
        matches = re.match(r'^data:([A-Za-z-+\/]+);base64,(.+)$', image_data)
        
        if not matches or len(matches.groups()) != 2:
            return jsonify({'error': 'Invalid image format'}), 400
            
        mime_type = matches.group(1)
        base64_data = matches.group(2)
        
        # Calculate image size
        image_bytes = base64.b64decode(base64_data)
        size_in_mb = len(image_bytes) / (1024 * 1024)
        
        # If image is already JPEG and under size limit, return as is
        if size_in_mb <= 5 and mime_type == 'image/jpeg':
            return jsonify({
                'success': True,
                'processedImage': image_data,
                'message': 'Image already meets requirements'
            })
        
        # Process the image
        processed_image = compress_image(image_bytes, mime_type)
        
        # Convert back to base64
        processed_base64 = base64.b64encode(processed_image).decode('utf-8')
        processed_data_uri = f'data:image/jpeg;base64,{processed_base64}'
        
        # Calculate new size
        new_size_in_mb = len(processed_image) / (1024 * 1024)
        
        return jsonify({
            'success': True,
            'processedImage': processed_data_uri,
            'message': f'Image processed successfully. Size reduced from {size_in_mb:.2f}MB to {new_size_in_mb:.2f}MB'
        })
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500


def compress_image(image_bytes, mime_type, max_size_mb=5, quality=90):
    """
    Compress image to target size and convert to JPEG
    
    Args:
        image_bytes: Raw image bytes
        mime_type: Original image MIME type
        max_size_mb: Maximum size in MB
        quality: Initial JPEG quality (1-100)
        
    Returns:
        Compressed image bytes
    """
    # Open image from bytes
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if needed (for PNG, RGBA, etc.)
    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        # Paste transparent image on background
        if img.mode == 'RGBA':
            background.paste(img, mask=img.split()[3])
        else:
            background.paste(img, mask=img.convert('RGBA').split()[3])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize if image is too large
    max_width = 1920
    max_height = 1080
    
    if img.width > max_width or img.height > max_height:
        # Calculate new dimensions while maintaining aspect ratio
        ratio = min(max_width / img.width, max_height / img.height)
        new_width = int(img.width * ratio)
        new_height = int(img.height * ratio)
        img = img.resize((new_width, new_height), Image.LANCZOS)
    
    # Compress with decreasing quality until target size is reached
    current_quality = quality
    output = io.BytesIO()
    
    while current_quality >= 10:
        # Reset buffer
        output.seek(0)
        output.truncate(0)
        
        # Save with current quality
        img.save(output, format='JPEG', quality=current_quality, optimize=True)
        
        # Check size
        if output.tell() <= max_size_mb * 1024 * 1024:
            break
            
        # Reduce quality for next iteration
        current_quality -= 10
    
    return output.getvalue()


@image_bp.route('/download', methods=['POST'])
def download_image():
    """
    Prepare an image for download
    This endpoint is useful when client-side download is not working
    """
    try:
        data = request.get_json()
        
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
            
        image_data = data['image']
        filename = data.get('filename', f'processed_image_{uuid.uuid4()}.jpg')
        
        # Extract base64 data
        matches = re.match(r'^data:([A-Za-z-+\/]+);base64,(.+)$', image_data)
        
        if not matches or len(matches.groups()) != 2:
            return jsonify({'error': 'Invalid image format'}), 400
            
        base64_data = matches.group(2)
        
        # Create a temporary file
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, filename)
        
        # Save the image
        with open(temp_path, 'wb') as f:
            f.write(base64.b64decode(base64_data))
        
        return jsonify({
            'success': True,
            'filePath': temp_path,
            'message': 'Image ready for download'
        })
        
    except Exception as e:
        print(f"Error preparing download: {str(e)}")
        return jsonify({'error': f'Failed to prepare download: {str(e)}'}), 500 