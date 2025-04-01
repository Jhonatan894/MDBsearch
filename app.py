#app.py

from flask import Flask, render_template, request, jsonify, session, redirect, url_for
import pandas as pd
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User # Importa os modelos para poder usar nas rotas
from routes.auth import auth_bp
from routes.user import user_bp  # Ou o caminho correto para o Blueprint de user
from models.arquivo import Arquivo  # Corrigido para importar Arquivo de models/arquivo.py
from flask_cors import CORS
from models.database import db, init_app as init_db  # Importa a configuração do banco de dados
from routes import init_app as init_routes  # Importa a configuração das rotas



app = Flask(__name__)

#Verificar Erros de CORS (Cross-Origin Resource Sharing)
CORS(app)  # Habilita CORS para todas as rotas

app.secret_key = '1234'

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:1234@localhost/sistema_usuarios'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


# Inicializando o banco de dados com o app
init_db(app)


# Iniciando as rotas blueprints
init_routes(app)


# Variável global para armazenar os dados do CSV após o upload
csv_data = pd.DataFrame()


#INICIO DO SITE
@app.route('/')
def home():
    if 'user_id' not in session:
        return redirect('/login')  # Redireciona para login se não estiver logado
    return render_template('index.html')  # Se estiver logado, carrega a página principal




#LOGIN
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')  # Renderiza o HTML da página de login

    data = request.get_json()
    email = data.get('email')  
    password = data.get('password')  

    user_instance = User.query.filter_by(email=email).first()

    if user_instance and check_password_hash(user_instance.senha, password):
        session['user_id'] = user_instance.id  
        session['permissao'] = user_instance.permissao
        print(session)
        return jsonify({'mensagem': 'Login realizado!'}), 200
        

    else:
        return jsonify({'mensagem': 'Senha incorreta'}), 401




#LOGOUT
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  # Limpa toda a sessão
    return redirect('/login')  # Redireciona para a página de login




#ROTA PARA AS INFORMAÇÕES DO SITE
@app.route('/informacao')
def infomacao():
    return render_template('informacao.html') 






#buscar CPF no CSV
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




# REGISTRANDO USER
@app.route('/registrar', methods=['POST'])
def registrar():
    dados = request.json
    password_hash = generate_password_hash(dados['password'])

    novo_user = User(
        nome=dados['nome'],
        email=dados['email'],
        password=password_hash,
        permissao=dados['permissao']  # 'user' ou 'gerente'
    )

    db.session.add(novo_user)
    db.session.commit()

    return jsonify({'mensagem': 'Usuário registrado com sucesso!'})





# UPLOAD
@app.route('/upload', methods=['POST'])
def upload():
    # Verifique se o usuário está autenticado
    if 'user_id' not in session:
        return jsonify({'mensagem': 'Usuário não autenticado. Faça login primeiro.'}), 401

    # Recebe o arquivo enviado
    file = request.files.get('file')  

    if not file:
        return jsonify({"error": "Nenhum arquivo foi enviado"}), 400

    try:
        # Lê o arquivo CSV enviado e converte as colunas para string
        global csv_data
        csv_data = pd.read_csv(file, sep=';', dtype=str)
        csv_data.columns = csv_data.columns.str.strip()  # Remove espaços extras nos nomes das colunas

        print("Arquivo CSV carregado com sucesso!")
        print("Colunas:", csv_data)

        # Verifica se o usuário tem permissão para registrar no banco de dados
        if session.get('permissao') == 'gerente':
            novo_arquivo = Arquivo(usuario_id=session['user_id'], nome_arquivo=file.filename)
            db.session.add(novo_arquivo)
            db.session.commit()
            return jsonify({"mensagem": "Arquivo recebido"})
        else:
            return jsonify({"mensagem": "Arquivo recebido, mas não registrado (permissão negada)."}), 200

    except Exception as e:
        return jsonify({"error": f"Erro ao processar o arquivo CSV: {e}"}), 500






#SEARCH
@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '').strip()  # Obtém o CPF digitado

    if not query:
        return jsonify({"error": "Nenhum CPF fornecido"}), 400

    # Verifica se o arquivo CSV já foi carregado
    if 'csv_data' not in globals() or csv_data is None:
        return jsonify({"error": "Nenhum arquivo CSV carregado"}), 400

    try:
        # Busca o CPF no CSV
        result = csv_data[csv_data["CPF"].str.strip() == query]

        if result.empty:
            return jsonify({"error": "Nenhum resultado encontrado"}), 404

        # Converte os dados para JSON e envia
        data = (result.to_dict(orient="records"))
    

        #vendo se tem CPFs multiplos
        if len(data) > 1:
            return jsonify({"multiple": True, "options": data})

        # nao tem retorna o único registro
        return jsonify(data[0])

    except Exception as e:
        return jsonify({"error": f"Erro na pesquisa: {e}"}), 500


# Iniciar o servidor Flask
if __name__ == '__main__':
    app.run(debug=True)
