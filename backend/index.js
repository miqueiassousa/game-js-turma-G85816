require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados MySQL');
});

// Middleware para interpretar JSON
app.use(express.json());

// Rota para receber os dados do jogador e armazenar no banco de dados
app.post('/api/cadastro', (req, res) => {
    const { nome, email, telefone } = req.body;

    // Validação simples
    if (!nome || !email || !telefone) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Query para inserir os dados no banco de dados
    const query = 'INSERT INTO jogadores (nome, email, telefone) VALUES (?, ?, ?)';
    const values = [nome, email, telefone];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Erro ao inserir dados no banco:', err);
            return res.status(500).json({ error: 'Erro ao salvar os dados.' });
        }
        console.log('Dados inseridos com sucesso:', result);
        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
