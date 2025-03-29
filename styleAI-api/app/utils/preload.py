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
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 全局变量
_model_resources = None
model_name = "distilbert-base-uncased"
ALGORITHMS_PATH = os.path.join(os.path.dirname(__file__), 'algorithms')

def safe_import_preload():
    """
    安全导入预加载模块
    
    Returns:
        module or None: 预加载模块，如果导入失败则返回None
    """
    try:
        # 返回当前模块
        return sys.modules[__name__]
    except Exception as e:
        logger.error(f"导入预加载模块失败: {e}")
        return None

def get_model_resources():
    """
    获取预加载的模型资源
    
    Returns:
        dict: 包含预加载模型资源的字典
    """
    global _model_resources
    
    if _model_resources is None:
        logger.warning("模型资源尚未加载")
        return {}
        
    return _model_resources

def preload_models():
    """
    预加载模型和其他资源
    """
    global _model_resources
    
    try:
        logger.info("开始预加载模型和资源...")
        
        # 初始化资源字典
        _model_resources = {}
        
        # 检查是否可以导入torch
        try:
            import torch
            import transformers
            from transformers import AutoModel, AutoTokenizer
            
            # 设置设备
            _model_resources['device'] = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            logger.info(f"使用设备: {_model_resources['device']}")
            
            # 尝试加载embedding模型和tokenizer
            try:
                # 加载tokenizer
                logger.info(f"加载tokenizer: {model_name}")
                tokenizer = AutoTokenizer.from_pretrained(model_name)
                _model_resources['tokenizer'] = tokenizer
                
                # 加载模型
                logger.info(f"加载embedding模型: {model_name}")
                model = AutoModel.from_pretrained(model_name).to(_model_resources['device'])
                _model_resources['model'] = model
                
                # 验证模型和tokenizer是否正确加载
                if tokenizer and model:
                    logger.info("成功加载embedding模型和tokenizer")
                else:
                    logger.error("模型或tokenizer加载失败")
                    if not tokenizer:
                        logger.error("tokenizer为空")
                    if not model:
                        logger.error("model为空")
            except Exception as e:
                logger.error(f"加载embedding模型和tokenizer失败: {e}")
                # 设置为None以便后续检查
                _model_resources['tokenizer'] = None
                _model_resources['model'] = None
        except ImportError as e:
            logger.warning(f"无法导入必要的库: {e}，跳过模型加载")
            _model_resources['tokenizer'] = None
            _model_resources['model'] = None
            _model_resources['device'] = None
        
        # 加载其他资源...
        
        logger.info("模型和资源预加载完成")
        return _model_resources
    except Exception as e:
        logger.error(f"预加载模型和资源时出错: {e}")
        _model_resources = {
            'tokenizer': None,
            'model': None,
            'device': None
        }
        return _model_resources

def import_module(module_name):
    """
    导入指定的模块
    
    Args:
        module_name (str): 要导入的模块名
        
    Returns:
        module or None: 导入的模块，如果导入失败则返回None
    """
    try:
        module_path = os.path.join(ALGORITHMS_PATH, f"{module_name}.py")
        spec = importlib.util.spec_from_file_location(module_name, module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    except Exception as e:
        logger.error(f"导入模块 {module_name} 失败: {e}")
        return None

def check_dependencies(packages):
    """
    检查依赖包是否已安装
    
    Args:
        packages (list): 要检查的包名列表
        
    Returns:
        bool: 所有包都已安装返回True，否则返回False
    """
    for package in packages:
        if importlib.util.find_spec(package) is None:
            logger.error(f"缺少依赖包: {package}")
            return False
    return True

def check_scikit_learn():
    """
    检查scikit-learn是否已安装且版本兼容
    
    Returns:
        bool: scikit-learn已安装且版本兼容返回True，否则返回False
    """
    try:
        import sklearn
        from packaging import version
        
        sklearn_version = sklearn.__version__
        min_version = "0.24.0"
        
        if version.parse(sklearn_version) < version.parse(min_version):
            logger.warning(f"scikit-learn版本过低: {sklearn_version}，建议 >= {min_version}")
            return False
            
        return True
    except ImportError:
        logger.warning("scikit-learn未安装")
        return False

def preload_modules():
    """
    预加载算法模块
    """
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

# 初始化函数
def init():
    """
    初始化预加载模块
    """
    logger.info("初始化预加载模块...")
    
    # 添加算法目录到Python路径
    if ALGORITHMS_PATH not in sys.path:
        sys.path.append(ALGORITHMS_PATH)
        logger.info(f"已将算法目录添加到Python路径: {ALGORITHMS_PATH}")
    
    # 预加载模块
    preload_modules()
    
    # 预加载模型
    preload_models()

# initialize函数作为init函数的别名
def initialize():
    """
    初始化预加载模块(init函数的别名)
    这个函数是为了兼容app/__init__.py中的调用
    """
    return init()

# 在模块导入时自动初始化
init() 