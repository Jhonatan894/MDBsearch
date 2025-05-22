# models/user.py

from models.database import db
import hashlib

class User(db.Model):
    __tablename__ = 'usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)
    matricula = db.Column(db.Integer, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(200), nullable=False)  # A senha deve ter espaço suficiente para armazenar o sha256
    permissao = db.Column(db.String(50), nullable=False)
    funcao = db.Column(db.String(200), nullable=False)

 # Gera o hash da senha com sha256
    def set_password(self, password):
        self.senha = hashlib.sha256(password.encode('utf-8')).hexdigest()

    # Verifica se a senha fornecida corresponde ao hash
    def check_password(self, password):
        return self.senha == hashlib.sha256(password.encode('utf-8')).hexdigest()