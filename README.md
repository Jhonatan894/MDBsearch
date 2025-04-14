O mdbsearch é um sistema web que permite o upload e busca de arquivos CSV, focado principalmente em realizar consultas de CPF de maneira simples e rápida. O sistema é projetado para ser utilizado por usuários autenticados, com funcionalidades de upload de arquivos, armazenamento e pesquisa de dados específicos do arquivo, com a possibilidade de realizar ações diferenciadas conforme o nível de permissão do usuário.

Funcionalidades
Login e autenticação de usuários: Permite que os usuários façam login para acessar o sistema.

Upload de arquivos CSV: Permite que os usuários enviem arquivos CSV para o sistema, com verificação de permissões para registrar ou não os dados no banco.

Busca por CPF: Realiza a busca de um CPF específico em arquivos CSV carregados.

Gestão de usuários: Criação e autenticação de usuários com diferentes permissões (como 'gerente' e 'usuário').

Tecnologias utilizadas
Backend
Flask: Framework web em Python para desenvolvimento rápido de aplicações. O Flask facilita a criação de APIs RESTful, como as rotas de upload e login.

SQLAlchemy: ORM (Object Relational Mapper) usado para interação com o banco de dados MySQL de maneira simples e eficiente.

MySQL: Banco de dados relacional utilizado para armazenar informações de usuários e arquivos carregados.

Pandas: Biblioteca Python para manipulação de dados, utilizada para processar e manipular os arquivos CSV carregados.

Werkzeug: Utilizado para a criptografia de senhas dos usuários, garantindo maior segurança.

Flask-CORS: Middleware para permitir o compartilhamento de recursos entre diferentes origens, habilitando a comunicação entre o frontend e o backend.

Frontend
HTML/CSS/JavaScript: Linguagens de marcação e estilo usadas para construir a interface do usuário.

Fetch API: Usada no frontend para enviar dados para o backend, como o envio de arquivos CSV via uma requisição POST.
