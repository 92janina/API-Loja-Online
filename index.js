const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bd_dsapi'
});

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API funcionando!'
    });
});

app.get('/produtos', async (req, res) => {
    try {
        const [produtos] = await pool.query(
            'SELECT * FROM produtos'
        );

        res.json(produtos);

    } catch (erro) {
        res.status(500).json({
            erro: erro.message
        });
    }
});

app.get('/produtos/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const [produto] = await pool.query(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
        );

        if (produto.length === 0) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado'
            });
        }

        res.json(produto[0]);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.get('/categorias', async (req, res) => {

    try {

        const [categorias] = await pool.query(
            'SELECT * FROM categorias'
        );

        res.json(categorias);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.get('/cidades', async (req, res) => {

    try {

        const [cidades] = await pool.query(
            'SELECT * FROM cidades'
        );

        res.json(cidades);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.get('/pedidos', async (req, res) => {

    try {

        const [pedidos] = await pool.query(`
            SELECT
                pedidos.id,
                pedidos.horario,
                pedidos.endereco,
                clientes.nome AS cliente
            FROM pedidos
            INNER JOIN clientes
                ON pedidos.cliente_id = clientes.id
        `);

        res.json(pedidos);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.get('/pedidos/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const [pedido] = await pool.query(
            'SELECT * FROM pedidos WHERE id = ?',
            [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({
                mensagem: 'Pedido não encontrado'
            });
        }

        res.json(pedido[0]);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.get('/clientes', async (req, res) => {

    try {

    const [clientes] = await pool.query(`
    SELECT
        clientes.id,
        clientes.nome,
        clientes.altura,
        DATE_FORMAT(clientes.nascimento, '%Y-%m-%d') AS nascimento,
        clientes.cidade_id,
        cidades.nome AS cidade
    FROM clientes
    LEFT JOIN cidades
        ON clientes.cidade_id = cidades.id`);

        res.json(clientes);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.get('/clientes/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const [cliente] = await pool.query(`
    SELECT
        clientes.id,
        clientes.nome,
        clientes.altura,
        DATE_FORMAT(clientes.nascimento, '%Y-%m-%d') AS nascimento,
        clientes.cidade_id,
        cidades.nome AS cidade
    FROM clientes
    LEFT JOIN cidades
        ON clientes.cidade_id = cidades.id
    WHERE clientes.id = ?`, 
    [id]);

        if (cliente.length === 0) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado'
            });
        }

        res.json(cliente[0]);

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.post('/produtos', async (req, res) => {

    try {

        const {
            nome,
            preco,
            quantidade,
            categoria_id
        } = req.body;

        if (!nome || !preco) {
            return res.status(400).json({
                mensagem: 'Nome e preço são obrigatórios'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO produtos
            (nome, preco, quantidade, categoria_id)
            VALUES (?, ?, ?, ?)`,
            [nome, preco, quantidade, categoria_id]
        );

        res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso',
            id: resultado.insertId
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.post('/categorias', async (req, res) => {

    try {

        const { nome } = req.body;
        if (!nome) {
            return res.status(400).json({
                mensagem: 'Nome da categoria é obrigatório'
            });
        }

        const [resultado] = await pool.query(
            'INSERT INTO categorias (nome) VALUES (?)',
            [nome]
        );

        res.status(201).json({
            mensagem: 'Categoria cadastrada com sucesso',
            id: resultado.insertId
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.post('/cidades', async (req, res) => {

    try {

        const { nome } = req.body;
        if (!nome) {
            return res.status(400).json({
                mensagem: 'Nome da cidade é obrigatório'
            });
        }

        const [resultado] = await pool.query(
            'INSERT INTO cidades (nome) VALUES (?)',
            [nome]
        );

        res.status(201).json({
            mensagem: 'Cidade cadastrada com sucesso',
            id: resultado.insertId
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.post('/pedidos', async (req, res) => {

    try {

        const {
            endereco,
            cliente_id,
            produtos
        } = req.body;
        if (!cliente_id || !endereco || !produtos || produtos.length === 0) {
                return res.status(400).json({
                    mensagem: 'Cliente, endereço e produtos são obrigatórios'
            });
        }

        const [pedido] = await pool.query(
            `INSERT INTO pedidos
            (horario, endereco, cliente_id)
            VALUES (NOW(), ?, ?)`,
            [endereco, cliente_id]
        );

        const pedido_id = pedido.insertId;

        for (const item of produtos) {

            const [produtoBanco] = await pool.query(
                'SELECT preco FROM produtos WHERE id = ?',
                [item.produto_id]
            );

            if (produtoBanco.length === 0) {
                continue;
            }

            const preco = produtoBanco[0].preco;

            await pool.query(
                `INSERT INTO pedidos_produtos
                (pedido_id, produto_id, preco, quantidade)
                VALUES (?, ?, ?, ?)`,
                [
                    pedido_id,
                    item.produto_id,
                    preco,
                    item.quantidade
                ]
            );
        }

        res.status(201).json({
            mensagem: 'Pedido criado com sucesso',
            pedido_id
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.post('/clientes', async (req, res) => {

    try {

        const {
            nome,
            altura,
            nascimento,
            cidade_id
        } = req.body;


        if (!nome || !cidade_id) {
            return res.status(400).json({
                mensagem: 'Nome e cidade são obrigatórios'
            });
        }

        const [resultado] = await pool.query(
            `INSERT INTO clientes
            (nome, altura, nascimento, cidade_id)
            VALUES (?, ?, ?, ?)`,
            [nome, altura, nascimento, cidade_id]
        );

        res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso',
            id: resultado.insertId
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.put('/produtos/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nome,
            preco,
            quantidade,
            categoria_id
        } = req.body;
        if (!nome || !preco) {
                return res.status(400).json({
                    mensagem: 'Nome e preço são obrigatórios'
            });
        }

        const [resultado] = await pool.query(
            `UPDATE produtos
            SET nome = ?,
                preco = ?,
                quantidade = ?,
                categoria_id = ?
            WHERE id = ?`,
            [nome, preco, quantidade, categoria_id, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado'
            });
        }

        res.json({
            mensagem: 'Produto atualizado com sucesso'
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.put('/clientes/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const {
            nome,
            altura,
            nascimento,
            cidade_id
        } = req.body;
        if (!nome || !cidade_id) {
                return res.status(400).json({
                    mensagem: 'Nome e cidade são obrigatórios'
            });
        }

        const [resultado] = await pool.query(
            `UPDATE clientes
             SET nome = ?,
                altura = ?,
                nascimento = ?,
                cidade_id = ?
             WHERE id = ?`,
            [nome, altura, nascimento, cidade_id, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado'
            });
        }

        res.json({
            mensagem: 'Cliente atualizado com sucesso'
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.delete('/produtos/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const [resultado] = await pool.query(
            'DELETE FROM produtos WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado'
            });
        }

        res.json({
            mensagem: 'Produto removido com sucesso'
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.delete('/pedidos/:id', async (req, res) => {

    try {

        const { id } = req.params;

        await pool.query(
            'DELETE FROM pedidos_produtos WHERE pedido_id = ?',
            [id]
        );

        const [resultado] = await pool.query(
            'DELETE FROM pedidos WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Pedido não encontrado'
            });
        }

        res.json({
            mensagem: 'Pedido removido com sucesso'
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});

app.delete('/clientes/:id', async (req, res) => {

    try {

        const { id } = req.params;

        const [resultado] = await pool.query(
            'DELETE FROM clientes WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Cliente não encontrado'
            });
        }

        res.json({
            mensagem: 'Cliente removido com sucesso'
        });

    } catch (erro) {

        res.status(500).json({
            erro: erro.message
        });

    }

});


app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});