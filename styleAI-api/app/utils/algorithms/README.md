# StyleAI 算法模块

这个目录包含了 StyleAI 的核心算法模块，用于处理用户上传的图像并生成个性化的时尚推荐。

## 模块结构

- `main.py`: 主要算法入口，整合了所有算法步骤
- `input_analyse.py`: 输入分析模块，用于分析用户上传的图像
- `embedding_match.py`: 嵌入匹配模块，用于匹配用户图像与数据库中的样式
- `change_ootd.py`: 服装更换模块，用于生成穿着建议图片

## 预加载功能

为了提高 API 响应速度，我们实现了预加载功能，在 Flask 应用启动时预加载算法模块和模型。预加载功能由以下文件实现：

- `app/utils/preload.py`: 预加载模块，用于预加载算法模块和模型
- `app/__init__.py`: 在 Flask 应用启动时启动预加载

预加载功能会在后台线程中执行，不会阻塞 Flask 应用的启动。预加载完成后，算法模块和模型将被缓存在内存中，以便快速响应 API 请求。

### 预加载流程

1. 在 Flask 应用启动时，`app/__init__.py`中的`create_app`函数会启动一个后台线程执行`preload_resources`函数
2. `preload_resources`函数会导入`app.utils.preload`模块，并调用其`initialize`函数
3. `initialize`函数会依次调用`preload_modules`和`preload_models`函数，分别预加载算法模块和模型
4. 如果预加载成功，算法模块和模型将被缓存在内存中，可以通过`get_model_resources`函数获取

### 错误处理

预加载功能具有完善的错误处理机制：

1. 如果缺少必要的依赖（如 transformers、torch 等），预加载功能会自动降级，API 将使用模拟数据
2. 如果算法模块文件不存在，预加载功能会记录错误日志，API 将使用模拟数据
3. 如果预加载过程中出现任何错误，预加载功能会记录错误日志，API 将使用模拟数据

### 依赖要求

预加载功能需要以下依赖：

- `transformers`: 用于加载和使用预训练的语言模型
- `torch`: PyTorch 深度学习框架
- `scikit-learn`: 用于机器学习算法

可以使用以下命令安装这些依赖：

```bash
pip install transformers torch scikit-learn
```

## 使用方法

在 Flask 路由中使用预加载的模型和 tokenizer：

```python
from app.utils import preload

# 获取预加载的资源
resources = preload.get_model_resources()
tokenizer = resources.get('tokenizer')
model = resources.get('model')
device = resources.get('device')

# 使用预加载的资源进行处理
if tokenizer and model and device:
    # 导入算法模块
    import input_analyse
    import embedding_match

    # 分析用户输入
    user_text = input_analyse.main(image_path)

    # 匹配嵌入
    best_image_name = embedding_match.main(user_text, tokenizer, model, device)
```

## 注意事项

1. 预加载功能需要较大的内存资源，请确保服务器有足够的内存
2. 预加载过程可能需要一些时间，在预加载完成之前，API 请求将使用模拟数据
3. 如果预加载失败，API 将继续使用模拟数据，不会影响 API 的可用性
4. 在开发环境中，Flask 的热重载功能可能会导致预加载模块被多次加载，这是正常的
5. 在生产环境中，建议使用 Gunicorn 等 WSGI 服务器运行 Flask 应用，以避免预加载模块被多次加载
