DROP TABLE IF EXISTS relatorio;
DROP TABLE IF EXISTS carga;
DROP TABLE IF EXISTS viagem;
DROP TABLE IF EXISTS alerta;
DROP TABLE IF EXISTS leitura_sensor;
DROP TABLE IF EXISTS sensor;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS trem;
DROP TABLE IF EXISTS linha;
DROP TABLE IF EXISTS cargo;

CREATE TABLE cargo (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    nome         VARCHAR(40) NOT NULL UNIQUE,
    nivel_acesso ENUM('cliente','operacional','gestao') NOT NULL DEFAULT 'cliente'
) ENGINE=InnoDB;

CREATE TABLE linha (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    numero  VARCHAR(20)  NOT NULL UNIQUE,
    origem  VARCHAR(120) NOT NULL,
    destino VARCHAR(120) NOT NULL,
    status  ENUM('manutencao','atraso','fechado','na_estacao','ja_partiu') NOT NULL,
    ativo   BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE trem (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    prefixo         VARCHAR(20)  NOT NULL UNIQUE,
    modelo          VARCHAR(80)  NOT NULL,
    ano             SMALLINT     NOT NULL,
    capacidade_t    DECIMAL(7,2) NOT NULL,
    status          ENUM('ativo','manutencao','parado') NOT NULL DEFAULT 'ativo',
    ultima_inspecao DATE NULL,
    linha_id        INT  NULL,
    criado_em       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trem_linha FOREIGN KEY (linha_id)
        REFERENCES linha(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE usuario (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(120) NOT NULL,
    email      VARCHAR(160) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    cargo_id   INT NOT NULL DEFAULT 1,
    trem_id    INT NULL,
    telefone   VARCHAR(20),
    foto_url   VARCHAR(255),
    ativo      BOOLEAN  NOT NULL DEFAULT TRUE,
    criado_em  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_cargo FOREIGN KEY (cargo_id)
        REFERENCES cargo(id) ON DELETE RESTRICT,
    CONSTRAINT fk_usuario_trem FOREIGN KEY (trem_id)
        REFERENCES trem(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE sensor (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    codigo      VARCHAR(20)  NOT NULL UNIQUE,
    nome        VARCHAR(80)  NOT NULL,
    tipo_dado   ENUM('velocidade','temperatura','falha','energia','localizacao') NOT NULL,
    localizacao VARCHAR(120) NOT NULL,
    segmento    VARCHAR(80),
    trem_id     INT NOT NULL,
    criado_em   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sensor_trem FOREIGN KEY (trem_id)
        REFERENCES trem(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE leitura_sensor (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id          INT NOT NULL,
    valor              DECIMAL(10,2) NOT NULL,
    status_operacional ENUM('normal','alerta','falha') NOT NULL DEFAULT 'normal',
    data_hora          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_leitura_sensor_data (sensor_id, data_hora),
    CONSTRAINT fk_leitura_sensor FOREIGN KEY (sensor_id)
        REFERENCES sensor(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE alerta (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    linha_id     INT    NULL,
    leitura_id   BIGINT NULL,
    tipo         VARCHAR(40) NOT NULL,
    severidade   ENUM('normal','atencao','critico') NOT NULL DEFAULT 'normal',
    tempo_espera VARCHAR(40),
    motivo       VARCHAR(200) NOT NULL,
    status       VARCHAR(40)  NOT NULL,
    tratado      BOOLEAN  NOT NULL DEFAULT FALSE,
    criado_em    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alerta_linha FOREIGN KEY (linha_id)
        REFERENCES linha(id) ON DELETE CASCADE,
    CONSTRAINT fk_alerta_leitura FOREIGN KEY (leitura_id)
        REFERENCES leitura_sensor(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE viagem (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    linha_id         INT NOT NULL,
    trem_id          INT NOT NULL,
    partida_prevista DATETIME NOT NULL,
    chegada_prevista DATETIME NOT NULL,
    status           ENUM('programada','em_andamento','concluida','cancelada','atrasada')
                     NOT NULL DEFAULT 'programada',
    criado_em        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_viagem_partida (partida_prevista),
    CONSTRAINT fk_viagem_linha FOREIGN KEY (linha_id)
        REFERENCES linha(id) ON DELETE RESTRICT,
    CONSTRAINT fk_viagem_trem FOREIGN KEY (trem_id)
        REFERENCES trem(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE carga (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    tipo          VARCHAR(80)  NOT NULL,
    peso_t        DECIMAL(6,2) NOT NULL,
    local_partida VARCHAR(120) NOT NULL,
    destino       VARCHAR(120) NOT NULL,
    vagao         VARCHAR(20),
    trem_id       INT NULL,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carga_trem FOREIGN KEY (trem_id)
        REFERENCES trem(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE relatorio (
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

INSERT INTO cargo (id, nome, nivel_acesso) VALUES
    ( 1, 'comum',               'cliente'),
    ( 2, 'admin',               'gestao'),
    ( 3, 'administracao',       'gestao'),
    ( 4, 'rh',                  'gestao'),
    ( 5, 'maquinista',          'operacional'),
    ( 6, 'auxiliar_maquinista', 'operacional'),
    ( 7, 'agente_trem',         'operacional'),
    ( 8, 'manutencao',          'operacional'),
    ( 9, 'engenharia_mecanica', 'operacional'),
    (10, 'eletricista',         'operacional');

INSERT INTO linha (numero, origem, destino, status, ativo) VALUES
    ('1778', 'Joinville',      'Sao Francisco do Sul', 'na_estacao',  TRUE),
    ('2645', 'Jaragua do Sul', 'Joinville',            'atraso',      TRUE),
    ('5463', 'Mafra',          'Porto Uniao',          'ja_partiu',   TRUE),
    ('9845', 'Itajai',         'Blumenau',             'fechado',     FALSE);

INSERT INTO trem (prefixo, modelo, ano, capacidade_t, status, ultima_inspecao, linha_id) VALUES
    ('TR-204', 'GE AC44i',       2018, 1800.00, 'ativo',      '2026-09-14',
        (SELECT id FROM linha WHERE numero = '1778')),
    ('TR-118', 'EMD SD70M',      2014, 1650.50, 'ativo',      '2026-08-02',
        (SELECT id FROM linha WHERE numero = '2645')),
    ('TR-301', 'GE Dash 9',      2021, 2100.00, 'manutencao', '2026-10-21',
        (SELECT id FROM linha WHERE numero = '5463')),
    ('TR-455', 'Villares V8 SD', 2009,  980.75, 'parado',     NULL, NULL);

INSERT INTO usuario (nome, email, senha_hash, cargo_id, trem_id, telefone, ativo) VALUES
    ('Ana Gestora',   'ana.admin@ferrovia.com',  '$argon2id$v=19$m=65536,t=3,p=4$ZxdvG3jAojafi0lnIjeQ7w$w+AQfE1eRIrj8S2sZf2UzhSjeFGgBq6TYzuC7mFohO0',
        2, NULL, '47999990001', TRUE),
    ('Carlos Souza',  'carlos.maq@ferrovia.com', '$argon2id$v=19$m=65536,t=3,p=4$ZxdvG3jAojafi0lnIjeQ7w$w+AQfE1eRIrj8S2sZf2UzhSjeFGgBq6TYzuC7mFohO0',
        5, (SELECT id FROM trem WHERE prefixo = 'TR-204'), '47999990002', TRUE),
    ('Bruna Lima',    'bruna.rh@ferrovia.com',   '$argon2id$v=19$m=65536,t=3,p=4$ZxdvG3jAojafi0lnIjeQ7w$w+AQfE1eRIrj8S2sZf2UzhSjeFGgBq6TYzuC7mFohO0',
        4, NULL, '47999990003', TRUE),
    ('Cliente Comum', 'cliente@email.com',       '$argon2id$v=19$m=65536,t=3,p=4$ZxdvG3jAojafi0lnIjeQ7w$w+AQfE1eRIrj8S2sZf2UzhSjeFGgBq6TYzuC7mFohO0',
        1, NULL, '47999990004', TRUE);

INSERT INTO sensor (codigo, nome, tipo_dado, localizacao, segmento, trem_id) VALUES
    ('S-VEL-001', 'Velocimetro dianteiro', 'velocidade',  'Cabine',         'Joinville - Araquari',
        (SELECT id FROM trem WHERE prefixo = 'TR-204')),
    ('S-TEMP-001', 'Temperatura do motor', 'temperatura', 'Motor',          'Joinville - Araquari',
        (SELECT id FROM trem WHERE prefixo = 'TR-204')),
    ('S-ENE-001', 'Consumo de energia',    'energia',     'Motor',          'Joinville - Araquari',
        (SELECT id FROM trem WHERE prefixo = 'TR-204')),
    ('S-VEL-002', 'Velocimetro dianteiro', 'velocidade',  'Cabine',         'Jaragua - Joinville',
        (SELECT id FROM trem WHERE prefixo = 'TR-118')),
    ('S-FAL-001', 'Falha de freio',        'falha',       'Eixo dianteiro', 'Jaragua - Joinville',
        (SELECT id FROM trem WHERE prefixo = 'TR-118')),
    ('S-LOC-001', 'Localizador GPS',       'localizacao', 'Teto da cabine', 'Mafra - Porto Uniao',
        (SELECT id FROM trem WHERE prefixo = 'TR-301')),
    ('S-ENE-002', 'Consumo de energia',    'energia',     'Motor',          'Jaragua - Joinville',
        (SELECT id FROM trem WHERE prefixo = 'TR-118'));

INSERT INTO leitura_sensor (sensor_id, valor, status_operacional, data_hora) VALUES
    ((SELECT id FROM sensor WHERE codigo = 'S-VEL-001'),  72.40, 'normal', CURRENT_TIMESTAMP - INTERVAL 20 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-VEL-001'),  81.10, 'normal', CURRENT_TIMESTAMP - INTERVAL 14 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-VEL-001'),  94.60, 'alerta', CURRENT_TIMESTAMP - INTERVAL  6 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-VEL-002'),  68.90, 'normal', CURRENT_TIMESTAMP - INTERVAL 18 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-VEL-002'),  75.30, 'normal', CURRENT_TIMESTAMP - INTERVAL  3 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-TEMP-001'), 86.00, 'normal', CURRENT_TIMESTAMP - INTERVAL 12 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-TEMP-001'),115.70, 'falha',  CURRENT_TIMESTAMP - INTERVAL  2 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-ENE-001'), 310.50, 'normal', CURRENT_TIMESTAMP - INTERVAL 16 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-ENE-001'), 428.20, 'alerta', CURRENT_TIMESTAMP - INTERVAL  4 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-FAL-001'),   1.00, 'falha',  CURRENT_TIMESTAMP - INTERVAL  1 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-ENE-002'), 287.40, 'normal', CURRENT_TIMESTAMP - INTERVAL 15 HOUR),
    ((SELECT id FROM sensor WHERE codigo = 'S-ENE-002'), 352.10, 'normal', CURRENT_TIMESTAMP - INTERVAL  5 HOUR);

INSERT INTO alerta (linha_id, leitura_id, tipo, severidade, tempo_espera, motivo, status, tratado) VALUES
    ((SELECT id FROM linha WHERE numero = '1778'), NULL,
        'manutencao', 'atencao', '15 a 30 min', 'Manutencao programada no trilho', 'Parado', FALSE),
    ((SELECT id FROM linha WHERE numero = '2645'), NULL,
        'atraso', 'normal', '5 a 10 min', 'Atraso operacional na plataforma', 'Atraso', TRUE),
    ((SELECT id FROM linha WHERE numero = '9845'), NULL,
        'obra', 'critico', NULL, 'Linha fechada para obras de recuperacao', 'Fechado', FALSE),
    (NULL, (SELECT id FROM leitura_sensor WHERE sensor_id =
                (SELECT id FROM sensor WHERE codigo = 'S-TEMP-001') ORDER BY data_hora DESC LIMIT 1),
        'temperatura', 'critico', NULL, 'Temperatura do motor acima do limite critico', 'Critico', FALSE),
    (NULL, (SELECT id FROM leitura_sensor WHERE sensor_id =
                (SELECT id FROM sensor WHERE codigo = 'S-FAL-001') ORDER BY data_hora DESC LIMIT 1),
        'falha', 'critico', NULL, 'Falha detectada no freio do eixo dianteiro', 'Critico', FALSE),
    (NULL, (SELECT id FROM leitura_sensor WHERE sensor_id =
                (SELECT id FROM sensor WHERE codigo = 'S-VEL-001')
              AND status_operacional = 'alerta' ORDER BY data_hora DESC LIMIT 1),
        'velocidade', 'atencao', NULL, 'Velocidade acima do limite de atencao', 'Atencao', FALSE),
    (NULL, (SELECT id FROM leitura_sensor WHERE sensor_id =
                (SELECT id FROM sensor WHERE codigo = 'S-ENE-001')
              AND status_operacional = 'alerta' ORDER BY data_hora DESC LIMIT 1),
        'energia', 'atencao', NULL, 'Consumo de energia acima do limite de atencao', 'Atencao', FALSE);

INSERT INTO viagem (linha_id, trem_id, partida_prevista, chegada_prevista, status) VALUES
    ((SELECT id FROM linha WHERE numero = '1778'), (SELECT id FROM trem WHERE prefixo = 'TR-204'),
        CURRENT_TIMESTAMP - INTERVAL 2 HOUR, CURRENT_TIMESTAMP + INTERVAL 1 HOUR,  'em_andamento'),
    ((SELECT id FROM linha WHERE numero = '2645'), (SELECT id FROM trem WHERE prefixo = 'TR-118'),
        CURRENT_TIMESTAMP - INTERVAL 1 HOUR, CURRENT_TIMESTAMP + INTERVAL 2 HOUR,  'atrasada'),
    ((SELECT id FROM linha WHERE numero = '5463'), (SELECT id FROM trem WHERE prefixo = 'TR-301'),
        CURRENT_TIMESTAMP + INTERVAL 6 HOUR, CURRENT_TIMESTAMP + INTERVAL 11 HOUR, 'programada'),
    ((SELECT id FROM linha WHERE numero = '1778'), (SELECT id FROM trem WHERE prefixo = 'TR-204'),
        CURRENT_TIMESTAMP - INTERVAL 3 DAY,  CURRENT_TIMESTAMP - INTERVAL 70 HOUR, 'concluida'),
    ((SELECT id FROM linha WHERE numero = '2645'), (SELECT id FROM trem WHERE prefixo = 'TR-118'),
        CURRENT_TIMESTAMP - INTERVAL 5 DAY,  CURRENT_TIMESTAMP - INTERVAL 118 HOUR,'concluida'),
    ((SELECT id FROM linha WHERE numero = '9845'), (SELECT id FROM trem WHERE prefixo = 'TR-455'),
        CURRENT_TIMESTAMP - INTERVAL 2 DAY,  CURRENT_TIMESTAMP - INTERVAL 44 HOUR, 'cancelada');

INSERT INTO carga (tipo, peso_t, local_partida, destino, vagao, trem_id) VALUES
    ('Minerio de ferro', 812.50, 'Joinville',      'Sao Francisco do Sul', 'A',
        (SELECT id FROM trem WHERE prefixo = 'TR-204')),
    ('Carvao mineral',   625.70, 'Jaragua do Sul', 'Joinville',            'B',
        (SELECT id FROM trem WHERE prefixo = 'TR-118')),
    ('Areia industrial', 431.20, 'Mafra',          'Porto Uniao',          'C', NULL);

INSERT INTO relatorio (usuario_id, tipo, periodo_inicio, periodo_fim, tipo_falha) VALUES
    ((SELECT id FROM usuario WHERE email = 'ana.admin@ferrovia.com'),
        'manutencao', '2026-10-01', '2026-10-31', 'falha'),
    ((SELECT id FROM usuario WHERE email = 'ana.admin@ferrovia.com'),
        'desempenho', '2026-10-01', '2026-10-31', NULL),
    ((SELECT id FROM usuario WHERE email = 'bruna.rh@ferrovia.com'),
        'eficiencia', '2026-09-01', '2026-09-30', 'alerta');
