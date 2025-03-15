"""
预加载算法模块
此模块用于在Flask应用启动时预加载算法模块，提高响应速度
"""

import os
import sys
import logging
import importlib
import time
import importlib.util

# 配置日志
logger = logging.getLogger(__name__)

# 算法模块路径
ALGORITHMS_PATH = os.path.join(os.path.dirname(__file__), 'algorithms')

# 预加载的模型和tokenizer
model_name = "distilbert-base-uncased"
device = None
tokenizer = None
model = None

def preload_modules():
    """预加载算法模块"""
    start_time = time.time()
    logger.info("开始预加载算法模块...")
    
    # 确保算法模块路径在sys.path中
    if ALGORITHMS_PATH not in sys.path:
        sys.path.append(ALGORITHMS_PATH)
        logger.info(f"已将算法模块路径添加到sys.path: {ALGORITHMS_PATH}")
    
    # 检查算法模块文件是否存在
    module_files = ['main.py', 'input_analyse.py', 'embedding_match.py', 'change_ootd.py']
    missing_files = []
    
    for file in module_files:
        file_path = os.path.join(ALGORITHMS_PATH, file)
        if not os.path.exists(file_path):
            missing_files.append(file)
    
    if missing_files:
        logger.error(f"以下算法模块文件不存在: {', '.join(missing_files)}")
        logger.error(f"请确保这些文件存在于目录: {ALGORITHMS_PATH}")
        return False
    
    # 预加载算法模块
    try:
        # 导入主要算法模块
        import_module('main')
        import_module('input_analyse')
        import_module('embedding_match')
        import_module('change_ootd')
        
        logger.info(f"算法模块预加载完成，耗时: {time.time() - start_time:.2f}秒")
        return True
    except Exception as e:
        logger.error(f"预加载算法模块时出错: {str(e)}")
        return False

def preload_models():
    """预加载模型和tokenizer"""
    global device, tokenizer, model
    
    # 检查必要的依赖是否已安装
    if not check_dependencies(['torch', 'transformers']):
        logger.error("缺少必要的依赖，无法预加载模型")
        return False
    
    # 检查scikit-learn是否已安装（不要求特定版本）
    if not check_scikit_learn():
        logger.warning("scikit-learn未安装或版本不兼容，某些功能可能受限")
        # 继续执行，因为我们可以在没有scikit-learn的情况下加载模型
    
    start_time = time.time()
    logger.info("开始预加载模型和tokenizer...")
    
    try:
        # 导入必要的模块
        import torch
        from transformers import AutoTokenizer, AutoModel
        
        # 设置设备
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"使用设备: {device}")
        
        # 加载tokenizer和模型
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModel.from_pretrained(model_name).to(device)
        
        logger.info(f"模型和tokenizer预加载完成，耗时: {time.time() - start_time:.2f}秒")
        return True
    except Exception as e:
        logger.error(f"预加载模型和tokenizer时出错: {str(e)}")
        return False

def check_dependencies(packages):
    """检查依赖是否已安装"""
    missing_packages = []
    
    for package in packages:
        if importlib.util.find_spec(package) is None:
            missing_packages.append(package)
    
    if missing_packages:
        logger.warning(f"以下依赖包未安装: {', '.join(missing_packages)}")
        logger.warning(f"请使用以下命令安装: pip install {' '.join(missing_packages)}")
        return False
    
    return True

def check_scikit_learn():
    """检查scikit-learn是否已安装（不要求特定版本）"""
    try:
        if importlib.util.find_spec('sklearn') is None:
            return False
        
        # 尝试导入scikit-learn
        import sklearn
        logger.info(f"scikit-learn版本: {sklearn.__version__}")
        return True
    except Exception as e:
        logger.warning(f"检查scikit-learn时出错: {str(e)}")
        return False

def import_module(module_name):
    """导入模块并记录日志"""
    try:
        start_time = time.time()
        module = importlib.import_module(module_name)
        logger.info(f"成功导入模块 {module_name}，耗时: {time.time() - start_time:.2f}秒")
        return module
    except Exception as e:
        logger.error(f"导入模块 {module_name} 时出错: {str(e)}")
        return None

def get_model_resources():
    """获取预加载的模型资源"""
    return {
        'tokenizer': tokenizer,
        'model': model,
        'device': device
    }

# 初始化函数
def initialize():
    """初始化预加载"""
    logger.info("开始初始化预加载...")
    
    # 预加载算法模块
    modules_loaded = preload_modules()
    
    # 如果算法模块加载成功，则预加载模型
    if modules_loaded:
        models_loaded = preload_models()
        if models_loaded:
            logger.info("预加载初始化完成")
        else:
            logger.warning("模型预加载失败，API将使用模拟数据")
    else:
        logger.warning("算法模块预加载失败，API将使用模拟数据") 