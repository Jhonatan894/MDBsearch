from flask import Flask, render_template, request, jsonify, session
import pandas as pd
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from models.database import db  # Importa a instância db do arquivo database.py
from models.user import User  # Importa os modelos para poder usar nas rotas
from routes.auth import auth_bp
from routes.user import user_bp  # Ou o caminho correto para o Blueprint de user



app = Flask(__name__)

app.config['SECRET_KEY'] = 'chave-secreta'
app.register_blueprint(auth_bp, url_prefix='/auth')  # As rotas de auth estarão disponíveis em /auth
app.register_blueprint(user_bp, url_prefix='/user')  # As rotas de user estarão disponíveis em /user


# Variável global para armazenar os dados do CSV após o upload
csv_data = pd.DataFrame()

@app.route('/')
def home():
    return render_template('index.html')  # Certifique-se de que index.html está na pasta 'templates'

@app.route('/informacao')
def infomacao():
    return render_template('informacao.html')  # Certifique-se de que informacao.html está na pasta 'templates'

# Rota para receber o upload de arquivo CSV
@app.route('/upload', methods=['POST'])     
def upload_file():
    global csv_data
    file = request.files.get('file')  # Recebe o arquivo

    if not file:
        return jsonify({"error": "Nenhum arquivo foi enviado"}), 400

    try:
        # Lê o arquivo CSV enviado e converte as colunas para string
        csv_data = pd.read_csv(file, sep=';', dtype=str)
        csv_data.columns = csv_data.columns.str.strip()  # Remove espaços extras nos nomes das colunas
        print("Arquivo CSV carregado com sucesso!")
        print("Colunas:", csv_data.columns)
        return jsonify({"message": "Arquivo recebido com sucesso"})
    except Exception as e:
        return jsonify({"error": f"Erro ao ler o arquivo CSV: {e}"}), 500

# Rota para buscar CPF no CSV
@app.route('/buscar_cpf', methods=['POST'])
def buscar_cpf():
    cpf_input = request.json.get('cpf')

    if not cpf_input:
        return jsonify({"error": "CPF não fornecido"}), 400

    print(f"CPF buscado: {cpf_input}")
    
    if csv_data.empty:
        return jsonify({"error": "Nenhum arquivo CSV foi carregado. Faça o upload primeiro."}), 400

    if "CPF" not in csv_data.columns:
        return jsonify({"error": "A coluna 'CPF' não foi encontrada no CSV"}), 500

    # Normaliza os CPFs para evitar inconsistências
    csv_data["CPF"] = csv_data["CPF"].astype(str).str.strip()
    cpf_input = str(cpf_input).strip()

    # Filtra os dados com base no CPF informado
    rows = csv_data[csv_data["CPF"] == cpf_input]



    if rows.empty:
        return jsonify({"error": "CPF não encontrado"}), 404
    

     # Se houver mais de um CPF igual, envia a lista de opções
    elif len(rows) > 1:
        result = rows.to_dict(orient='records')
        return jsonify({"multiple": True, "options": result})
    
    else:
        # Se houver apenas um CPF, retorna os dados normalmente
        result = rows.iloc[0].to_dict()
        return jsonify(result)





#REGISTRANDO User
@app.route('/registrar', methods=['POST'])
def registrar():
    dados = request.json
    senha_hash = generate_password_hash(dados['senha'])

    novo_User = User(
        nome=dados['nome'],
        email=dados['email'],
        senha=senha_hash,
        permissao=dados['permissao']  # 'User' ou 'gerente'
    )

    db.session.add(novo_User)
    db.session.commit()

    return jsonify({'mensagem': 'Usuário registrado com sucesso!'})


#LOGIN User
@app.route('/login', methods=['POST'])
def login():
    dados = request.json
    User = User.query.filter_by(email=dados['email']).first()

    if User and check_password_hash(User.senha, dados['senha']):
        session['User_id'] = User.id
        session['permissao'] = User.permissao
        return jsonify({'mensagem': 'Login realizado!', 'permissao': User.permissao})
    else:
        return jsonify({'mensagem': 'Credenciais inválidas'}), 401


#PERMISSAO ENVIAR ARQUIVO
@app.route('/upload', methods=['POST'])
def upload():
    # Verifique se o usuário está autenticado
    if 'usuario_id' not in session:
        return jsonify({'mensagem': 'Usuário não autenticado. Faça login primeiro.'}), 401

    # Se for necessário, verifique a permissão do usuário (por exemplo, apenas 'gerente' pode enviar arquivos)
    if session.get('permissao') != 'gerente':
        return jsonify({'mensagem': 'Permissão negada. Apenas gerentes podem enviar arquivos.'}), 403

    # O resto do código para processar o upload
    dados = request.json
    novo_arquivo = Arquivo(usuario_id=session['usuario_id'], nome_arquivo=dados['nome_arquivo'])

    db.session.add(novo_arquivo)
    db.session.commit()

    return jsonify({'mensagem': 'Arquivo enviado com sucesso!'})


# Iniciar o servidor Flask
if __name__ == '__main__':
    app.run(debug=True)
