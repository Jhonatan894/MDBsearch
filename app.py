#app.py

from flask import Flask, json, render_template, request, jsonify, session, redirect
import pandas as pd
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User
from models.arquivo import Arquivo  # Corrigido para importar Arquivo de models/arquivo.py
from models.database import db, init_app as init_db  # Importa a configuração do banco de dados
from werkzeug.utils import secure_filename 
from flask import current_app
import os
from datetime import datetime
import hashlib
import traceback
from sqlalchemy.exc import IntegrityError
import json


app = Flask(__name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER




app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:1234@localhost/sistema_usuarios'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.secret_key = '1234'

app.jinja_env.cache = {}


# Inicializando o banco de dados com o app
init_db(app)



# Variável global para armazenar os dados do CSV após o upload
csv_data = pd.DataFrame()
uploads_realizados = []


#INICIO DO SITE (INDEX)
@app.route('/')
def home():
    if 'user_id' not in session:
        return redirect('/login') 

    user_data = {
        "nome": session['user']['nome'],
        "permissao": session['user']['permissao'],
        "funcao": session['user']['funcao']
    }

    return render_template('index.html', user_data=user_data)  # Se estiver logado, carrega a página principal




# LOGIN
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('login.html')  # Retorna a página de login quando o método é GET

    #pega os dados do formulário
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Buscar usuário no banco de dados
    user_instance = User.query.filter_by(email=email).first()

    if user_instance and user_instance.check_password(password):
        session['user_id'] = user_instance.id
        session['user'] = {
        'nome': user_instance.nome,
        'permissao': user_instance.permissao,
        'funcao': user_instance.funcao
}

        return jsonify({'mensagem': 'Login realizado!'}), 200
    else:
        return jsonify({'mensagem': 'Senha incorreta'}), 401
    




#ACESSO
@app.route('/acesso', methods=['GET'])
def acesso():
    if 'user_id' not in session:
        return redirect('/login') 

    user_data = {
        "nome": session['user']['nome'],
        "permissao": session['user']['permissao'],
        "funcao": session['user']['funcao']
    }
    
    # Carregar arquivos CSV da pasta 'uploads'
    global uploads_realizados
    return render_template('acesso.html', user_data=user_data, planilhas=uploads_realizados)  # Se estiver logado, carrega a página principal


# Alteração na rota para ler diretamente o CSV
@app.route('/dados-planilha/<nome_arquivo>', methods=['GET'])
def dados_planilha(nome_arquivo):
    if 'user_id' not in session:
        return jsonify({'error': 'Não autenticado'}), 401

    # Caminho do arquivo CSV
    csv_path = os.path.join(app.config['UPLOAD_FOLDER'], nome_arquivo)

    if not os.path.exists(csv_path):
        return jsonify({'error': 'Arquivo CSV não encontrado'}), 404

    try:
        # Ler o CSV usando pandas
        df = pd.read_csv(csv_path, sep=None, engine='python', encoding='utf-8', dtype=str)
        
        # Normalizando os nomes das colunas (removendo espaços extras, por exemplo)
        df.columns = df.columns.str.strip()

        # Convertendo os dados para uma lista de dicionários
        dados = df.to_dict(orient='records')

        # Retornando as colunas e dados em formato JSON
        return jsonify({
            'colunas': list(df.columns),  # Retorna os nomes das colunas
            'dados': dados  # Retorna os dados do CSV
        })

    except Exception as e:
        return jsonify({'error': f'Erro ao processar o arquivo CSV: {str(e)}'}), 500





#LOGOUT
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect('/login')




#ROTA PARA AS INFORMAÇÕES DO SITE
@app.route('/informacao')
def infomacao():
    return render_template('informacao.html') 






# buscar CPF no CSV
@app.route('/buscar_cpf', methods=['POST'])
def buscar_cpf():
    cpf_input = request.json.get('cpf')  # Pega o CPF do JSON enviado

    if not cpf_input:
        return jsonify({"error": "CPF não fornecido"}), 400

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
# CADASTRO
@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if 'user_id' not in session:
        return redirect('/login') 
    
    user_data = {
        "nome": session['user']['nome'],
        "permissao": session['user']['permissao'],
        "funcao": session['user']['funcao']
    }
    
    return render_template('cadastro.html', user_data=user_data)
    
    
    
@app.route('/registrar', methods=['POST'])
def registrar():
    try:
        # Recebe os dados em JSON
        dados = request.get_json()  # Obtém os dados enviados como JSON
        
        # Extração dos dados do corpo da requisição
        nome = dados.get('nome')
        matricula = dados.get('matricula')
        email = dados.get('email')
        senha = dados.get('senha')
        permissao = dados.get('permissao')
        funcao = dados.get('funcao')
        confirm_password = dados.get('confirm_password')

        # Verificação de campos obrigatórios
        if not nome or not matricula or not email or not senha or not permissao or not funcao:
            return jsonify({"mensagem": "Todos os campos são obrigatórios."}), 400

        # Verifica se as senhas coincidem
        if senha != confirm_password:
            return jsonify({"mensagem": "As senhas não coincidem."}), 400

        # Verificação de formato do email (opcional, caso você queira validar isso no backend também)
        if '@' not in email:
            return jsonify({"mensagem": "Email inválido."}), 400
        
        # Hash da senha para armazenar de forma segura
        def hash_senha(senha):
            return hashlib.sha256(senha.encode('utf-8')).hexdigest()
        senha_hash = hash_senha(senha)

        # Criação do novo usuário no banco de dados
        novo_usuario = User(
            nome=nome,
            matricula=matricula,
            email=email,
            senha=senha_hash,
            permissao=permissao,  # Permissão recebida da requisição
            funcao=funcao         # Função recebida da requisição
        )

        # Adiciona o usuário ao banco de dados e faz o commit
        db.session.add(novo_usuario)
        db.session.commit()

        # Resposta de sucesso
        return jsonify({"mensagem": "Usuário registrado com sucesso!"}), 201

    except IntegrityError as e:
        # Se ocorrer um erro de integridade (como um email ou matrícula já existente)
        db.session.rollback()  # Faz rollback para não deixar dados inconsistentes
        return jsonify({"mensagem": "Erro ao registrar o usuário. Verifique se os dados estão corretos."}), 400
    except Exception as e:
        # Qualquer outro erro genérico
        print(f"Erro: {str(e)}")
        return jsonify({"mensagem": "Ocorreu um erro inesperado."}), 500

    
    
    
#ARQUIVO

# Função para carregar os dados de metadados
def carregar_metadados(nome_arquivo):
    metadata_path = os.path.join(app.config['UPLOAD_FOLDER'], nome_arquivo + '.json')
    if os.path.exists(metadata_path):
        with open(metadata_path, 'r') as f:
            return json.load(f)
    return None

# Rota para pegar a lista de arquivos na pasta de uploads
@app.route('/arquivos', methods=['GET'])
def listar_arquivos():
    arquivos = []
    try:
        # Lê os arquivos na pasta de uploads
        for arquivo in os.listdir(app.config['UPLOAD_FOLDER']):
            if arquivo.endswith('.csv'):
                metadados = carregar_metadados(arquivo)  # Busca metadados do arquivo
                if metadados:
                    arquivos.append({
                        'nomeArquivo': arquivo,
                        'setor': metadados.get('setor'),
                        'tipo': metadados.get('tipo'),
                        'data': metadados.get('data'),
                        'usuario': metadados.get('usuario')
                    })
        return jsonify(arquivos), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
# Rota para excluir um arquivo
@app.route('/deletar/<nome_arquivo>', methods=['DELETE'])
def deletar_arquivo(nome_arquivo):
    try:
        caminho_arquivo = os.path.join(app.config['UPLOAD_FOLDER'], nome_arquivo)
        os.remove(caminho_arquivo)
        return jsonify({'message': 'Arquivo excluído com sucesso!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500




#HISTORICO
@app.route('/historico')
def historico():
    if 'user_id' not in session:
        return redirect('/login') 
    
    user_data = session.get('user')  
    user_id = session.get('user_id')   
    
    # Caminho da pasta de uploads
    upload_folder = os.path.join(app.root_path, 'uploads')

    # Lista os arquivos
    arquivos = []
    for filename in os.listdir(upload_folder):
        file_path = os.path.join(upload_folder, filename)
        # Opcional: verifica se é arquivo
        if os.path.isfile(file_path):
            arquivos.append(filename)
    
    return render_template('historico.html', user_data=user_data, arquivos=arquivos)






# UPLOAD 
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'csv'
# Upload do arquivo CSV
@app.route('/upload', methods=['POST'])
def upload():
    if 'user_id' not in session:
        return jsonify({'error': 'Usuário não autenticado. Faça login primeiro.'}), 401

    file = request.files.get('file')
    setor = request.form.get('setor')
    tipo = request.form.get('tipo')

    if not file or not allowed_file(file.filename):
        return jsonify({'error': 'Arquivo inválido. Envie um CSV.'}), 400

    try:
        filename = secure_filename(file.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(save_path)  # ✅ Salva o arquivo localmente

        # Carrega para o pandas, se quiser manipular
        df = pd.read_csv(save_path, sep=None, engine='python', encoding='utf-8', dtype=str)
        df.columns = df.columns.str.strip()
        
         # Converte para formato de lista de dicionários
        dados_csv = df.to_dict(orient='records')  # Cada linha vira um dicionário
        
        session['ultimo_csv'] = filename


        # ✅ Exemplo opcional: armazenar global
        global csv_data
        csv_data = df
        
        
        # Prepara metadados + conteúdo
        metadados = {
            'setor': setor,
            'tipo': tipo,
            'data': datetime.now().strftime('%Y-%m-%d'),
            'usuario': session['user']['nome'],
            'conteudo': dados_csv
        }
        
        
        # Salva metadados como .json
        metadata_filename = filename + '.json'
        metadata_path = os.path.join(app.config['UPLOAD_FOLDER'], metadata_filename)
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadados, f, ensure_ascii=False, indent=2)

        
        uploads_realizados.append({
            'nome': filename,
            **metadados
        })

        return jsonify({
            'mensagem': 'Upload realizado com sucesso!',
            'dados_csv': dados_csv,  # Envia os dados da planilha para o frontend
        })

    except Exception as e:
        return jsonify({'error': f'Erro ao processar arquivo: {str(e)}'}), 500






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
