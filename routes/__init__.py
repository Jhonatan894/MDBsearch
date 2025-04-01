# routes/__init__.py

from flask import Flask


def init_app(app: Flask):
    # Registra os Blueprints

    from routes.auth import auth_bp  # Importa o Blueprint de autenticação
    from routes.user import user_bp  # Importa o Blueprint de usuário
    app.register_blueprint(auth_bp, url_prefix='/auth')  # Prefixo '/auth' para as rotas de autenticação
    app.register_blueprint(user_bp, url_prefix='/user')  # Prefixo '/user' para as rotas de usuário
