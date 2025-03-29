# StyleAI Docker 部署指南

本指南详细说明了如何使用 Docker Compose 构建和运行 StyleAI 应用程序，包括前端、后端 API 和 Nginx 反向代理。

## 前提条件

- [Docker](https://docs.docker.com/get-docker/) (包含 Docker Compose V2)

## 快速开始

使用以下命令一键启动整个应用：

```bash
# 构建并启动所有服务
docker compose up -d

# 查看日志
docker compose logs -f
```

或者使用提供的部署脚本：

```bash
# 添加执行权限（如果尚未添加）
chmod +x docker-deploy.sh

# 运行部署脚本
./docker-deploy.sh
```

启动后，可以通过以下地址访问应用：

- 前端应用：http://localhost
- 直接访问 API：http://localhost:5001

## 服务组件

该 Docker Compose 配置包含以下服务：

1. **api** - 后端 Flask API 服务

   - 构建自：`./styleAI-api`
   - 端口：5001
   - 提供风格分析、图像处理等核心功能

2. **frontend** - Next.js 前端应用

   - 构建自：`./styleAI`
   - 端口：3000
   - 提供用户界面和交互体验

3. **nginx** - Nginx 反向代理服务
   - 构建自：`./styleAI-api/nginx`
   - 端口：80（主要访问入口）
   - 为前端和 API 提供统一的访问入口

## 详细构建和运行说明

### 构建服务

```bash
# 构建所有服务
docker compose build

# 构建单个服务
docker compose build api
docker compose build frontend
docker compose build nginx
```

### 启动服务

```bash
# 启动所有服务（后台运行）
docker compose up -d

# 启动单个服务
docker compose up -d api
```

### 查看服务状态

```bash
# 查看所有容器状态
docker compose ps

# 查看服务日志
docker compose logs -f
docker compose logs -f api
```

### 停止服务

```bash
# 停止所有服务
docker compose down

# 停止并删除卷（清理数据）
docker compose down -v
```

## 配置文件说明

1. **docker-compose.yml**：定义了服务配置，包括构建路径、端口映射、环境变量等

2. **styleAI-api/Dockerfile**：后端 API 服务的构建配置

3. **styleAI/Dockerfile**：前端应用的构建配置

4. **styleAI-api/nginx/default.conf**：Nginx 配置，设置了反向代理规则

## 环境变量

可以通过环境变量或.env 文件自定义配置：

- 后端 API 服务:

  - `FLASK_ENV`: 运行环境（development/production）
  - `FLASK_DEBUG`: 调试模式（0/1）

- 前端服务:
  - `NODE_ENV`: 运行环境（development/production）
  - `NEXT_PUBLIC_API_URL`: API 服务的 URL

## 持久化数据

在 docker-compose.yml 中，使用 volumes 进行数据持久化：

```yaml
volumes:
  - ./styleAI-api/app:/app/app
  - ./styleAI-api/temp:/app/temp
```

这确保了应用程序的核心代码和临时文件可以在容器外部进行管理和持久化。

## 开发模式

在开发过程中，可以使用开发模式配置：

```bash
# 使用开发配置
export FLASK_ENV=development
export FLASK_DEBUG=1
export NODE_ENV=development

# 启动服务
docker compose up -d
```

## 故障排除

### 容器无法启动

检查日志了解错误详情：

```bash
docker compose logs api
```

### 服务之间无法通信

确认网络配置是否正确：

```bash
docker network ls
docker network inspect styleai_styleai-network
```

### 内存不足

增加 Docker 分配的内存资源：

- Docker Desktop: 设置 -> 资源 -> 内存

### 端口冲突

如果端口已被占用，可以修改 docker-compose.yml 中的端口映射：

```yaml
ports:
  - '8080:80' # 将主机端口改为8080
```
