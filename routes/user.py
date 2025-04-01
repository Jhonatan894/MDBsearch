#routes/user.py

from flask import Blueprint, request, jsonify
from models.user import User
from models.database import db

user_bp = Blueprint('user', __name__)

# Rota para visualizar o perfil do usuário
@user_bp.route('/profile', methods=['GET'])
def profile():
    
    user = User.query.get(1)  # Exemplo, substitua com lógica de autenticação real
    if user:
        return jsonify({'id': user.id, 'nome': user.nome, 'email': user.email})
    return jsonify({'message': 'user not found'}), 404

# Rota para atualizar o perfil do usuário
@user_bp.route('/update', methods=['PUT'])
def update():
    data = request.get_json()
    user = user.query.get(1)  # Exemplo, substitua com lógica de autenticação real
    if user:
        if 'nome' in data:
            user.nome = data['nome']
        if 'email' in data:
            user.email = data['email']
        db.session.commit()
        return jsonify({'message': 'user updated successfully'})
    return jsonify({'message': 'user not found'}), 404
