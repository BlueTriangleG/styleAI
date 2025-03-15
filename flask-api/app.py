from flask import Flask, request, jsonify

app = Flask(__name__)

# Mock data
mock_users = [
    {"id": 1, "name": "张三", "age": 25},
    {"id": 2, "name": "李四", "age": 30},
    {"id": 3, "name": "王五", "age": 28}
]

@app.route('/api/users', methods=['POST'])
def create_user():

    data = request.get_json()
    
    new_user = {
        "id": len(mock_users) + 1,
        "name": data.get('name', ''),
        "age": data.get('age', 0)
    }
    
    # 添加到mock数据中
    mock_users.append(new_user)
    
    return jsonify({
        "status": "success",
        "message": "用户创建成功",
        "data": new_user
    }), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)