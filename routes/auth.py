#routes/auth.py

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import db
from models.user import User  

# Cria o Blueprint para rotas de autenticação
auth_bp = Blueprint('auth', __name__)

# Rota para registro de novo usuário
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Verifica se todos os campos necessários foram fornecidos
    if not data.get('nome') or not data.get('senha'):
        return jsonify({'message': 'nome and senha are required'}), 400

    # Verifica se o usuário já existe
    existing_user = User.query.filter_by(nome=data['nome']).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400


    # Cria um novo usuário com a senha criptografada
    hashed_password = generate_password_hash(data['senha'], method='sha256')
    new_user = User(nome=data['nome'], senha=hashed_password)

    # Adiciona o novo usuário ao banco de dados
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'user registered successfully'}), 201

# Rota para login do usuário
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    # Verifica se os dados necessários foram fornecidos
    if not data.get('nome') or not data.get('password'):
        return jsonify({'message': 'nome and senha are required'}), 400

    # Verifica se o usuário existe
    user = User.query.filter_by(nome=data['nome']).first() 
    if not user or not check_password_hash(user.senha, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    return jsonify({'message': 'Login successful'}), 200
