# Docker 构建和运行注意事项

## 依赖版本兼容性

在 Docker 环境中构建 StyleAI API 时，需要注意以下依赖版本兼容性问题：

1. **Python 版本**：

   - 我们使用 Python 3.10 作为基础镜像，因为 scikit-learn 1.4.x 需要 Python 3.9+的支持
   - 如果您在本地开发环境中使用不同版本的 Python，可能会遇到兼容性问题

2. **scikit-learn 版本**：

   - 在 requirements.txt 中，我们使用`scikit-learn>=1.3.0,<1.5.0`来指定版本范围
   - 这样可以确保 Docker 构建过程能够找到与当前 Python 版本兼容的 scikit-learn 版本
   - 在 ARM 架构（如 Apple Silicon）上，可能需要使用较低版本的 scikit-learn

3. **torch 版本**：
   - torch 的安装可能会因为不同的硬件平台而有所不同
   - 在 requirements.txt 中，我们指定了 torch 2.2.1 版本，但您可能需要根据您的硬件平台进行调整

## 构建问题排查

如果您在构建 Docker 镜像时遇到问题，可以尝试以下方法：

1. **查看构建日志**：

   ```bash
   docker build -t styleai-api . --no-cache --progress=plain
   ```

2. **手动安装依赖**：

   ```bash
   # 创建一个临时容器
   docker run -it --rm python:3.10-slim bash

   # 在容器内安装依赖
   pip install scikit-learn torch transformers

   # 检查安装的版本
   pip list | grep -E "scikit-learn|torch|transformers"
   ```

3. **调整依赖版本**：
   如果某个依赖无法安装，可以尝试调整其版本要求。例如：

   ```
   # 修改前
   scikit-learn==1.4.1

   # 修改后
   scikit-learn>=1.3.0,<1.5.0
   ```

## 运行时错误排查

如果 API 服务器在运行时出现错误，可以尝试以下方法：

1. **查看容器日志**：

   ```bash
   docker logs styleai-api
   ```

2. **进入容器内部**：

   ```bash
   docker exec -it styleai-api bash
   ```

3. **检查 Python 环境**：
   ```bash
   python -c "import sys; print(sys.version)"
   python -c "import sklearn; print(sklearn.__version__)"
   python -c "import torch; print(torch.__version__)"
   ```

## 预加载功能

StyleAI API 使用预加载功能来提高响应速度。如果预加载功能出现问题，API 将自动降级使用模拟数据。您可以通过以下方法检查预加载状态：

1. **查看日志**：

   ```bash
   docker logs styleai-api | grep -E "预加载|preload"
   ```

2. **手动测试预加载**：
   ```bash
   docker exec -it styleai-api python -c "from app.utils import preload; print(preload.get_model_resources())"
   ```

## 本地开发与 Docker 环境的差异

在本地开发环境和 Docker 环境之间可能存在以下差异：

1. **Python 版本**：Docker 使用 Python 3.10，而本地环境可能使用不同版本
2. **依赖版本**：Docker 环境中的依赖版本可能与本地环境不同
3. **文件路径**：Docker 环境中的文件路径是相对于容器内部的，而不是主机系统
4. **环境变量**：Docker 环境中的环境变量是通过 Dockerfile 或 docker run 命令设置的

为了确保一致性，建议使用 Docker 进行开发和测试。
