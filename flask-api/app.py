from flask import Flask, jsonify, request
from config import Config
from models import db, User

app = Flask(__name__)
app.config.from_object(Config)

# 绑定数据库
db.init_app(app)

@app.route('/')
def index():
    return "Flask Connected to Neon Postgres!"

@app.route('/add_user', methods=['POST'])
def add_user():
    data = request.json
    if not data or "name" not in data:
        return jsonify({"error": "Missing name"}), 400

    new_user = User(name=data["name"])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User added!", "id": new_user.id})

@app.route('/get_users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{"id": user.id, "name": user.name} for user in users])

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # 初始化数据库表
    app.run(debug=True)
