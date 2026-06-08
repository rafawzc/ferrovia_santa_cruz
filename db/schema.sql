-- =============================================================
-- Ferrovia Santa Cruz - Script de criacao do banco (MySQL 8)
-- =============================================================
-- Cria o banco e todas as tabelas conforme o modelo relacional
-- documentado em docs/banco/modelo-de-dados.md.
-- Une o lado de GESTAO (usuario, linha, carga, alerta) com o
-- monitoramento IoT (trem, sensor, leitura_sensor, relatorio).
--
-- Ordem das tabelas respeita as dependencias de FK: cada tabela
-- referenciada e criada antes de quem a referencia.
-- Sem DROP destrutivo: usa IF NOT EXISTS (nao apaga dado existente).
-- =============================================================

CREATE DATABASE IF NOT EXISTS ferrovia_santa_cruz
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ferrovia_santa_cruz;

-- -------------------------------------------------------------
-- cargo: funcao do usuario (maquinista, rh, admin...). Antes era
-- um ENUM gigante dentro de usuario; virou tabela pra normalizar
-- e tirar DDL (ALTER TABLE) do caminho quando muda um cargo.
-- nivel_acesso encoda a matriz de acesso no banco (em vez de
-- espalhar a regra em codigo): cliente < operacional < gestao.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cargo (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(40) NOT NULL UNIQUE,
    nivel_acesso ENUM('cliente','operacional','gestao') NOT NULL DEFAULT 'cliente'
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- usuario: quem acessa o sistema. cargo_id aponta pra cargo.
-- DEFAULT 1 = 'comum' (semeado como id 1); todo registro novo
-- nasce comum, so um admin promove. O acesso de cada tela e
-- derivado do nivel_acesso do cargo.
-- ON DELETE RESTRICT: nao deixa apagar um cargo em uso.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(120)  NOT NULL,
    email       VARCHAR(160)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(255)  NOT NULL,                 -- senha sempre com hash, nunca texto puro
    cargo_id    INT NOT NULL DEFAULT 1,                 -- 1 = 'comum' (ver seed)
    telefone    VARCHAR(20),
    foto_url    VARCHAR(255),
    ativo       BOOLEAN  NOT NULL DEFAULT TRUE,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_cargo FOREIGN KEY (cargo_id)
        REFERENCES cargo(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- linha: rota da ferrovia, com status operacional.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS linha (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    numero  VARCHAR(20) NOT NULL UNIQUE,                -- ex: "1778"
    status  ENUM('manutencao','atraso','fechado','na_estacao','ja_partiu') NOT NULL,
    ativo   BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- trem: locomotiva/composicao. Roda numa linha (opcional).
-- ON DELETE SET NULL: o trem sobrevive se a linha for removida.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trem (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    identificador VARCHAR(40) NOT NULL UNIQUE,
    status        ENUM('ativo','manutencao','parado') NOT NULL DEFAULT 'ativo',
    linha_id      INT NULL,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trem_linha FOREIGN KEY (linha_id)
        REFERENCES linha(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- sensor: sensor IoT vinculado a um trem (obrigatorio).
-- ON DELETE RESTRICT: nao deixa o trem sumir com sensores soltos.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sensor (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(80)  NOT NULL,
    localizacao VARCHAR(120) NOT NULL,
    tipo_dado   ENUM('velocidade','temperatura','falha','energia','localizacao') NOT NULL,
    trem_id     INT NOT NULL,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensor_trem FOREIGN KEY (trem_id)
        REFERENCES trem(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- leitura_sensor: cada medicao enviada por um sensor.
-- REGRA CRITICA (atividade DB, item 6): ON DELETE RESTRICT.
-- E isto que impede excluir um sensor que ja tenha leituras.
-- BIGINT no PK pelo volume alto de medicoes.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leitura_sensor (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id           INT NOT NULL,
    valor               DECIMAL(10,2) NOT NULL,
    status_operacional  ENUM('normal','alerta','falha') NOT NULL DEFAULT 'normal',
    data_hora           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leitura_sensor FOREIGN KEY (sensor_id)
        REFERENCES sensor(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- carga: carga/passageiros transportados. Vai num trem (opcional).
-- ON DELETE SET NULL: a carga historica sobrevive ao trem.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carga (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    tipo          VARCHAR(80)  NOT NULL,
    peso_t        DECIMAL(6,2) NOT NULL,                -- toneladas
    local_partida VARCHAR(120) NOT NULL,
    destino       VARCHAR(120) NOT NULL,
    vagao         VARCHAR(20),
    trem_id       INT NULL,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carga_trem FOREIGN KEY (trem_id)
        REFERENCES trem(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- alerta: notificacao manual sobre uma linha.
-- ON DELETE CASCADE: alerta nao faz sentido sem a linha.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerta (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    linha_id     INT NOT NULL,
    tempo_espera VARCHAR(40),                           -- ex: "15 a 30 min"
    motivo       VARCHAR(200) NOT NULL,
    status       VARCHAR(40)  NOT NULL,                 -- ex: "Parado"
    criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_linha FOREIGN KEY (linha_id)
        REFERENCES linha(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------------
-- relatorio: relatorio operacional gerado por um usuario,
-- filtravel por periodo e tipo de falha.
-- ON DELETE RESTRICT: preserva a autoria do relatorio.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS relatorio (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id     INT NOT NULL,
    tipo           VARCHAR(80) NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim    DATE NOT NULL,
    tipo_falha     ENUM('normal','alerta','falha') NULL,
    criado_em      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_relatorio_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
