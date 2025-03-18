from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys
from dotenv import load_dotenv
import logging
import threading
import importlib.util
import platform

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
    
    # 检查Python版本和必要的依赖是否已安装
    check_environment()
    
    # 在后台线程中预加载算法模块和模型
    threading.Thread(target=preload_resources, daemon=True).start()
    
    # Register blueprints
    from app.routes.personalized import personalized_bp
    
    app.register_blueprint(personalized_bp)
    
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        return jsonify({"status": "ok"})
    
    return app

def check_environment():
    """检查Python版本和必要的依赖是否已安装"""
    # 检查Python版本
    python_version = platform.python_version()
    logger.info(f"Python版本: {python_version}")
    
    # 检查必要的依赖是否已安装
    required_packages = {
        'transformers': None,  # None表示不要求特定版本
        'torch': None,
        'scikit-learn': None
    }
    
    missing_packages = []
    installed_packages = []
    
    for package, version in required_packages.items():
        if importlib.util.find_spec(package) is None:
            missing_packages.append(package)
        else:
            installed_packages.append(package)
    
    if missing_packages:
        logger.warning(f"以下依赖包未安装: {', '.join(missing_packages)}")
        logger.warning(f"请使用以下命令安装: pip install {' '.join(missing_packages)}")
        logger.warning("某些功能可能受限")
    
    if installed_packages:
        logger.info(f"已安装的依赖包: {', '.join(installed_packages)}")

def preload_resources():
    """在后台线程中预加载资源"""
    try:
        logger.info("开始在后台线程中预加载资源...")
        
        # 检查preload.py文件是否存在
        preload_path = os.path.join(os.path.dirname(__file__), 'utils', 'preload.py')
        if not os.path.exists(preload_path):
            logger.error(f"预加载模块文件不存在: {preload_path}")
            return
            
        # 导入预加载模块
        try:
            from app.utils import preload
            
            # 初始化预加载
            preload.initialize()
            
            logger.info("资源预加载完成")
        except ImportError as e:
            logger.error(f"导入预加载模块失败: {str(e)}")
            logger.error("请确保app/utils/__init__.py文件中正确导入了preload模块")
    except Exception as e:
        logger.error(f"预加载资源时出错: {str(e)}") 