#!/bin/bash

# 定义颜色常量
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示标题
echo -e "${GREEN}=====================================================${NC}"
echo -e "${GREEN}          StyleAI Docker 部署脚本                     ${NC}"
echo -e "${GREEN}=====================================================${NC}"
echo ""

# 确保脚本在根目录运行
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本。${NC}"
    exit 1
fi

# 检查docker是否已安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装。${NC}"
    echo -e "请访问 https://docs.docker.com/get-docker/ 安装Docker。"
    exit 1
fi

# 检查docker compose命令是否可用
if ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装或不可用。${NC}"
    echo -e "请确保安装了Docker Desktop或Docker Compose插件。"
    exit 1
fi

# 函数定义
function build_and_start() {
    echo -e "${YELLOW}准备构建和启动所有服务...${NC}"
    docker compose build && docker compose up -d
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}服务已成功启动!${NC}"
        echo -e "前端界面: ${GREEN}http://localhost${NC}"
        echo -e "API服务 (Gunicorn): ${GREEN}http://localhost:5001${NC}"
    else
        echo -e "${RED}启动服务失败，请检查日志。${NC}"
        exit 1
    fi
}

function show_logs() {
    echo -e "${YELLOW}显示服务日志...${NC}"
    docker compose logs -f
}

function stop_services() {
    echo -e "${YELLOW}停止所有服务...${NC}"
    docker compose down
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}所有服务已停止。${NC}"
    else
        echo -e "${RED}停止服务失败。${NC}"
        exit 1
    fi
}

function restart_services() {
    echo -e "${YELLOW}重启所有服务...${NC}"
    docker compose restart
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}所有服务已重启。${NC}"
    else
        echo -e "${RED}重启服务失败。${NC}"
        exit 1
    fi
}

function check_status() {
    echo -e "${YELLOW}检查服务状态...${NC}"
    docker compose ps
}

# 显示菜单
show_menu() {
    echo ""
    echo -e "${GREEN}请选择操作:${NC}"
    echo "1) 构建并启动所有服务"
    echo "2) 查看服务日志"
    echo "3) 停止所有服务"
    echo "4) 重启所有服务"
    echo "5) 查看服务状态"
    echo "0) 退出"
    echo ""
    echo -n "请输入选项 [0-5]: "
}

# 主循环
while true; do
    show_menu
    read -r choice

    case $choice in
        1) build_and_start ;;
        2) show_logs ;;
        3) stop_services ;;
        4) restart_services ;;
        5) check_status ;;
        0) echo -e "${GREEN}感谢使用!${NC}"; exit 0 ;;
        *) echo -e "${RED}无效选项，请重试。${NC}" ;;
    esac
done 