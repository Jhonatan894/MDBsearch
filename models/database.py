#models/database.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  # Apenas inicializa o objeto do banco

def init_app(app):
    """Configura o banco de dados e o associa ao app Flask"""
    db.init_app(app)