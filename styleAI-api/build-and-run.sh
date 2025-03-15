#!/bin/bash

# Build and run the StyleAI API Docker container

# 设置颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 显示信息函数
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Python和依赖版本
info "Python和依赖版本信息:"
echo "Python: $(python --version)"
pip list | grep -E "scikit-learn|torch|transformers"

# 解析命令行参数
REBUILD=false
SKIP_TESTS=false
SHOW_LOGS=true

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --rebuild) REBUILD=true ;;
        --skip-tests) SKIP_TESTS=true ;;
        --no-logs) SHOW_LOGS=false ;;
        *) echo "未知参数: $1"; exit 1 ;;
    esac
    shift
done

# 停止并移除现有容器
info "停止并移除现有容器（如果存在）..."
docker stop styleai-api 2>/dev/null || true
docker rm styleai-api 2>/dev/null || true

# 构建Docker镜像
if [ "$REBUILD" = true ]; then
    info "强制重新构建Docker镜像（不使用缓存）..."
    docker build --no-cache -t styleai-api .
else
    info "构建Docker镜像（使用缓存）..."
    docker build -t styleai-api .
fi

# 启动容器
info "启动容器..."
docker run -d --name styleai-api -p 5001:5001 styleai-api

# 检查容器状态
info "检查容器状态..."
docker ps --filter "name=styleai-api" --format "{{.ID}}   {{.Image}}   {{.Command}}   {{.RunningFor}}   {{.Status}}   {{.Ports}}
   {{.Names}}"

# 等待服务器启动
info "等待服务器启动..."
MAX_RETRIES=10
RETRY_COUNT=0
SERVER_READY=false

info "检查服务器是否响应..."
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -s http://localhost:5001/health > /dev/null; then
        SERVER_READY=true
        info "服务器已启动并正常运行！"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT+1))
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            warn "等待服务器启动... (尝试 $RETRY_COUNT/$MAX_RETRIES)"
            sleep 3
        fi
    fi
done

# 如果服务器未能启动，显示日志
if [ "$SERVER_READY" = false ]; then
    error "服务器未能正常启动。查看以下日志:"
fi

# 显示容器日志
if [ "$SHOW_LOGS" = true ]; then
    info "容器日志:"
    docker logs styleai-api
fi

# 测试API
if [ "$SKIP_TESTS" = false ]; then
    info "测试API..."
    python test-api.py
fi

# 提供有用的信息
info "StyleAI API 现在运行在 http://localhost:5001"
info "检查健康状态: curl http://localhost:5001/health"
info "停止容器: docker stop styleai-api"

# 如果需要，可以添加更多命令，例如自动打开浏览器等
# open http://localhost:5001/health 