CREATE DATABASE  bd_dsapi;

USE  bd_dsapi;

CREATE TABLE cidades(
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
    nome VARCHAR (50)
);

CREATE TABLE clientes (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT ,
    nome VARCHAR(100) NOT NULL ,
    altura DOUBLE,
    nascimento DATE,
    cidade_id INT,
    FOREIGN KEY (cidade_id) REFERENCES cidades(id)
);


CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    horario DATETIME,
    endereco VARCHAR(200),
    cliente_id INT,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);


CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DOUBLE,
    quantidade DOUBLE,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE pedidos_produtos (
    pedido_id INT,
    produto_id INT,
    preco DOUBLE,
    quantidade DOUBLE,
    PRIMARY KEY (pedido_id, produto_id),
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);

INSERT INTO categorias (nome)
VALUES ('Informática');

INSERT INTO categorias (nome)
VALUES('Celulares'),('Monitores'),('Hardware'),('Games')
;

INSERT INTO clientes
(nome, altura, nascimento, cidade_id)
VALUES
('Maria', 1.65, '2000-05-10', 1);