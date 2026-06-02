-- =============================================================
-- Ferrovia Santa Cruz - Script de populacao (seed)
-- =============================================================
-- Insere pelo menos 3 registros em cada tabela, respeitando
-- tipos, chaves primarias e estrangeiras (atividade DB, item 1).
--
-- A ordem de insercao respeita as dependencias de FK: os "pais"
-- entram antes dos "filhos" (usuario/linha -> trem -> sensor ->
-- leitura -> carga/alerta/relatorio), senao o FK falha.
--
-- senha_hash usa um hash de exemplo (placeholder) - em producao
-- vem do hash real gerado pelo backend.
-- =============================================================

USE ferrovia_santa_cruz;

-- usuario (cargo ENUM; quem nao e 'comum' e equipe) ----------
INSERT INTO usuario (nome, email, senha_hash, cargo, telefone, ativo) VALUES
    ('Ana Gestora',     'ana.admin@ferrovia.com',  '$2b$12$exemploHashDeSenhaParaSeedXxxxxxxxxxxxxxxxxxxxxxx', 'admin',      '47999990001', TRUE),
    ('Carlos Souza',    'carlos.maq@ferrovia.com', '$2b$12$exemploHashDeSenhaParaSeedXxxxxxxxxxxxxxxxxxxxxxx', 'maquinista', '47999990002', TRUE),
    ('Bruna Lima',      'bruna.rh@ferrovia.com',   '$2b$12$exemploHashDeSenhaParaSeedXxxxxxxxxxxxxxxxxxxxxxx', 'rh',         '47999990003', TRUE),
    ('Cliente Comum',   'cliente@email.com',       '$2b$12$exemploHashDeSenhaParaSeedXxxxxxxxxxxxxxxxxxxxxxx', 'comum',      '47999990004', TRUE);

-- linha (numero unico, status ENUM) --------------------------
INSERT INTO linha (numero, status, ativo) VALUES
    ('1778', 'manutencao', TRUE),
    ('2645', 'atraso',     TRUE),
    ('9845', 'fechado',    FALSE),
    ('5463', 'na_estacao', TRUE);

-- trem (linha_id FK; LOC-003 sem linha atribuida) ------------
INSERT INTO trem (identificador, status, linha_id) VALUES
    ('LOC-001', 'ativo',      1),
    ('LOC-002', 'manutencao', 1),
    ('LOC-003', 'parado',     NULL);

-- sensor (trem_id FK obrigatorio; tipo_dado ENUM) ------------
INSERT INTO sensor (nome, localizacao, tipo_dado, trem_id) VALUES
    ('Sensor Velocidade Dianteiro', 'Locomotiva LOC-001', 'velocidade',  1),
    ('Sensor Temperatura Motor',    'Locomotiva LOC-001', 'temperatura', 1),
    ('Sensor Falha Freio',          'Trilho KM 12',       'falha',       2),
    ('Sensor Energia',              'Locomotiva LOC-002', 'energia',     2);

-- leitura_sensor (sensor_id FK; status_operacional ENUM) -----
-- O sensor 1 e 2 tem leituras -> nao poderao ser excluidos.
INSERT INTO leitura_sensor (sensor_id, valor, status_operacional) VALUES
    (1,  78.50, 'normal'),
    (1, 102.30, 'alerta'),
    (2,  95.00, 'normal'),
    (3,   1.00, 'falha');

-- carga (trem_id FK opcional) --------------------------------
INSERT INTO carga (tipo, peso_t, local_partida, destino, vagao, trem_id) VALUES
    ('Minerio de ferro', 12.50, 'Genebra', 'Zermatt', 'A', 1),
    ('Carvao mineral',   25.70, 'Genebra', 'Zermatt', 'B', 1),
    ('Areia',            31.20, 'Genebra', 'Zermatt', 'C', NULL);

-- alerta (linha_id FK obrigatorio) ---------------------------
INSERT INTO alerta (linha_id, tempo_espera, motivo, status) VALUES
    (1, '15 a 30 min', 'manutencao no trilho',      'Parado'),
    (2, '5 a 10 min',  'atraso operacional',        'Atraso'),
    (3, NULL,          'linha fechada para obras',  'Fechado');

-- relatorio (usuario_id FK; tipo_falha ENUM opcional) --------
INSERT INTO relatorio (usuario_id, tipo, periodo_inicio, periodo_fim, tipo_falha) VALUES
    (1, 'Falhas por periodo', '2026-05-01', '2026-05-31', 'falha'),
    (1, 'Desempenho geral',   '2026-05-01', '2026-05-31', NULL),
    (3, 'Alertas do mes',     '2026-04-01', '2026-04-30', 'alerta');
