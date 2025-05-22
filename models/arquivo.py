# models/arquivo.py

from models.database import db

class Arquivo(db.Model):
    __tablename__ = 'arquivos'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    nome_arquivo = db.Column(db.String(255), nullable=False)
    data_envio = db.Column(db.TIMESTAMP, default=db.func.current_timestamp())

    def __repr__(self):
        return f"<Arquivo {self.nome_arquivo}>"
