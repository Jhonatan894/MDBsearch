#models/database.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()  

def init_app(app):
    """associando ao app flask"""
    db.init_app(app)