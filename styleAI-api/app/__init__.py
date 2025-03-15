from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

def create_app():
    """
    Create and configure the Flask application
    """
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Configure app
    app.config['JSON_AS_ASCII'] = False
    app.config['MAX_CONTENT_LENGTH'] = int(os.environ.get('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))  # 默认16MB
    
    # 确保临时目录存在
    temp_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'temp')
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        logger.info(f"创建临时目录: {temp_dir}")
    
    # Register blueprints
    from app.routes.image_processing import image_bp
    from app.routes.personalized import personalized_bp
    
    app.register_blueprint(image_bp)
    app.register_blueprint(personalized_bp)
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({"status": "ok"})
    
    return app 