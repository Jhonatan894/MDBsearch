# models/user.py

from models.database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'usuarios'  # Use 'usuarios' para corresponder ao banco
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False) 
    permissao = db.Column(db.Enum('usuario', 'gerente', name='permissoes'), nullable=False)
    
    def set_password(self, senha):
        self.senha = generate_password_hash(senha)
    
    def check_password(self, senha):
        return check_password_hash(self.senha, senha)
    
    def __repr__(self):
        return f"<User {self.nome}>"

