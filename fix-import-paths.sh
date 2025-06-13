#!/bin/bash

# Fix import paths script
# 修复 LiquidChrome 组件的导入路径从 Background 到 background

echo "🔧 开始修复导入路径..."

# 定义需要替换的文件列表
files=(
    "styleAI/src/app/algorithmGallery/page.tsx"
    "styleAI/src/app/credits/page.tsx"
    "styleAI/src/app/getBestFitCloth/generateReport/page.tsx"
    "styleAI/src/app/getBestFitCloth/uploadImages/page.tsx"
    "styleAI/src/app/getBestFitCloth/loading/page.tsx"
    "styleAI/src/app/reportHistory/page.tsx"
    "styleAI/src/app/hair-style/uploadImages/page.tsx"
    "styleAI/src/components/home/content/index.tsx"
)

# 错误的路径模式
OLD_PATH="@/components/Background/LiquidChrome"
# 正确的路径
NEW_PATH="@/components/background/LiquidChrome"

echo "📝 将要替换的路径："
echo "  从: $OLD_PATH"
echo "  到: $NEW_PATH"
echo ""

# 计数器
fixed_count=0
total_files=${#files[@]}

# 遍历文件并进行替换
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        # 检查文件是否包含需要替换的内容
        if grep -q "$OLD_PATH" "$file"; then
            echo "🔄 修复文件: $file"
            # 使用 sed 进行替换
            sed -i "s|$OLD_PATH|$NEW_PATH|g" "$file"
            ((fixed_count++))
        else
            echo "✅ 文件已正确: $file"
        fi
    else
        echo "❌ 文件不存在: $file"
    fi
done

echo ""
echo "✨ 修复完成！"
echo "📊 统计信息："
echo "  - 总文件数: $total_files"
echo "  - 已修复文件: $fixed_count"
echo "  - 跳过文件: $((total_files - fixed_count))"

# 验证修复结果
echo ""
echo "🔍 验证修复结果..."
remaining_issues=$(grep -r "Background/LiquidChrome" styleAI/src/ 2>/dev/null | wc -l)

if [ "$remaining_issues" -eq 0 ]; then
    echo "✅ 所有路径问题已修复！"
else
    echo "⚠️  仍有 $remaining_issues 个文件存在路径问题："
    grep -r "Background/LiquidChrome" styleAI/src/ 2>/dev/null
fi

echo ""
echo "🚀 现在可以尝试重新构建应用程序了！" 