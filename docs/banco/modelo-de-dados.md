# Modelo de dados — Ferrovia Santa Cruz

> Modelo relacional do banco (MySQL 8, SQL puro). Reúne **o que o mockup da SA exige** (usuários, linhas, carga, alertas) com **o que a Avaliação Prática de Banco de Dados pede** (trens, sensores IoT, leituras em tempo real, relatórios). Um schema só, sem duplicação.
>
> Referenciado pelo [`PLANO_IMPLEMENTACAO.md`](../PLANO_IMPLEMENTACAO.md) (Seção 2). Fonte da verdade para o `db/schema.sql` + `db/seed.sql` quando forem escritos.

## Diagrama Entidade-Relacionamento

```mermaid
erDiagram
    USUARIO   ||--o{ RELATORIO      : gera
    LINHA     ||--o{ TREM           : "opera"
    LINHA     ||--o{ ALERTA         : recebe
    TREM      ||--o{ SENSOR         : possui
    TREM      ||--o{ CARGA          : transporta
    SENSOR    ||--o{ LEITURA_SENSOR : registra

    USUARIO {
        int id PK
        varchar nome
        varchar email UK
        varchar senha_hash
        enum cargo "default comum"
        varchar telefone
        varchar foto_url
        boolean ativo
        datetime criado_em
    }
    LINHA {
        int id PK
        varchar numero UK
        enum status
        boolean ativo
    }
    TREM {
        int id PK
        varchar identificador UK
        enum status
        int linha_id FK
        datetime criado_em
    }
    SENSOR {
        int id PK
        varchar nome
        varchar localizacao
        enum tipo_dado
        int trem_id FK
        datetime criado_em
    }
    LEITURA_SENSOR {
        bigint id PK
        int sensor_id FK
        decimal valor
        enum status_operacional
        datetime data_hora
    }
    CARGA {
        int id PK
        varchar tipo
        decimal peso_t
        varchar local_partida
        varchar destino
        varchar vagao
        int trem_id FK
        datetime criado_em
    }
    ALERTA {
        int id PK
        int linha_id FK
        varchar tempo_espera
        varchar motivo
        varchar status
        datetime criado_em
    }
    RELATORIO {
        int id PK
        int usuario_id FK
        varchar tipo
        date periodo_inicio
        date periodo_fim
        enum tipo_falha
        datetime criado_em
    }
```

## Entidades e relacionamentos

| Entidade | O que é | Relacionamentos | Vem de |
|----------|---------|-----------------|--------|
| **usuario** | Quem acessa o sistema (login). Cargo num único ENUM, default `comum`. | gera N `relatorio` | Mockup (login, funcionários, perfil) + atividade DB (login/admin) |
| **linha** | Rota da ferrovia, com status operacional. | opera N `trem`; recebe N `alerta` | Mockup (Gestão de Rotas) |
| **trem** | Locomotiva/composição. Roda numa linha. | tem N `sensor`; transporta N `carga` | Atividade DB (monitoramento) + mockup (campo "Trem") |
| **sensor** | Sensor IoT vinculado a um trem. Tipo de dado monitorado. | tem N `leitura_sensor` | Atividade DB (cadastro de sensores) |
| **leitura_sensor** | Cada medição enviada por um sensor (velocidade, temperatura, falha…) com status operacional. | pertence a 1 `sensor` | Atividade DB (monitoramento em tempo real) |
| **carga** | Carga/passageiros transportados, com peso, partida e destino. | vai em 1 `trem` (opcional) | Mockup (Monitoramento de Carga) |
| **alerta** | Notificação manual sobre uma linha (tempo de espera, motivo, status). | pertence a 1 `linha` | Mockup (Alertas) |
| **relatorio** | Relatório operacional gerado por um usuário, filtrável por período e tipo de falha. | pertence a 1 `usuario` | Atividade DB (cadastro/visualização de relatórios) |

## Detalhe das tabelas

### `usuario`
| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nome` | VARCHAR(120) | NOT NULL |
| `email` | VARCHAR(160) | NOT NULL, **UNIQUE** |
| `senha_hash` | VARCHAR(255) | NOT NULL (senha sempre com hash, nunca texto puro) |
| `cargo` | ENUM(`comum`,`admin`,`rh`,`maquinista`,`auxiliar_maquinista`,`agente_trem`,`manutencao`,`administracao`,`engenharia_mecanica`,`eletricista`) | NOT NULL, **DEFAULT `comum`** |
| `telefone` | VARCHAR(20) | NULL |
| `foto_url` | VARCHAR(255) | NULL |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT TRUE |
| `criado_em` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Cargo num único ENUM (decisão do grupo):** sem tabela separada de cargos/papéis. Todo registro novo nasce `comum`; só um admin promove. O acesso é derivado do cargo (ver matriz de acesso no plano, Seção 5):
- `comum` → **Cliente**: só o próprio perfil.
- `admin`, `administracao`, `rh` → **gestão completa** (inclui gerir usuários).
- demais cargos operacionais → **painel operacional** (monitoramento), sem gerir usuários.

### `linha`
| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `numero` | VARCHAR(20) | NOT NULL, UNIQUE (ex: "1778") |
| `status` | ENUM(`manutencao`,`atraso`,`fechado`,`na_estacao`,`ja_partiu`) | NOT NULL |
| `ativo` | BOOLEAN | NOT NULL, DEFAULT TRUE |

### `trem`
| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `identificador` | VARCHAR(40) | NOT NULL, UNIQUE |
| `status` | ENUM(`ativo`,`manutencao`,`parado`) | NOT NULL, DEFAULT `ativo` |
| `linha_id` | INT | NULL, **FK → linha(id)** |
| `criado_em` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### `sensor`
| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nome` | VARCHAR(80) | NOT NULL |
| `localizacao` | VARCHAR(120) | NOT NULL |
| `tipo_dado` | ENUM(`velocidade`,`temperatura`,`falha`,`energia`,`localizacao`) | NOT NULL |
| `trem_id` | INT | NOT NULL, **FK → trem(id)** (todo sensor pertence a um trem) |
| `criado_em` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### `leitura_sensor`
| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | BIGINT | PK, AUTO_INCREMENT (volume alto de medições) |
| `sensor_id` | INT | NOT NULL, **FK → sensor(id) ON DELETE RESTRICT** |
| `valor` | DECIMAL(10,2) | NOT NULL |
| `status_operacional` | ENUM(`normal`,`alerta`,`falha`) | NOT NULL, DEFAULT `normal` |
| `data_hora` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

**Regra de negócio crítica (atividade DB, item 6):** o FK usa **`ON DELETE RESTRICT`**. É isso que impede excluir um sensor que tenha leituras registradas — o banco rejeita o DELETE e a API devolve a mensagem *"Não é possível excluir sensores com dados registrados"*. A regra mora no schema, não só no código.

### `carga`
| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `tipo` | VARCHAR(80) | NOT NULL |
| `peso_t` | DECIMAL(6,2) | NOT NULL (toneladas) |
| `local_partida` | VARCHAR(120) | NOT NULL |
| `destino` | VARCHAR(120) | NOT NULL |
| `vagao` | VARCHAR(20) | NULL |
| `trem_id` | INT | NULL, **FK → trem(id)** |
| `criado_em` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### `alerta`
| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `linha_id` | INT | NOT NULL, **FK → linha(id)** |
| `tempo_espera` | VARCHAR(40) | NULL (ex: "15 a 30 min") |
| `motivo` | VARCHAR(200) | NOT NULL |
| `status` | VARCHAR(40) | NOT NULL (ex: "Parado") |
| `criado_em` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

### `relatorio`
| Coluna | Tipo | Restrições |
|--------|------|------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `usuario_id` | INT | NOT NULL, **FK → usuario(id)** |
| `tipo` | VARCHAR(80) | NOT NULL |
| `periodo_inicio` | DATE | NOT NULL |
| `periodo_fim` | DATE | NOT NULL |
| `tipo_falha` | ENUM(`normal`,`alerta`,`falha`) | NULL (filtro por tipo de falha) |
| `criado_em` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

## Integridade referencial (resumo)

| FK | Aponta para | ON DELETE | Por quê |
|----|-------------|-----------|---------|
| `trem.linha_id` | `linha` | SET NULL | trem pode existir sem linha atribuída |
| `sensor.trem_id` | `trem` | RESTRICT | não soltar sensor órfão |
| `leitura_sensor.sensor_id` | `sensor` | **RESTRICT** | **regra do item 6 — sensor com dados não some** |
| `carga.trem_id` | `trem` | SET NULL | carga histórica sobrevive ao trem |
| `alerta.linha_id` | `linha` | CASCADE | alerta não faz sentido sem a linha |
| `relatorio.usuario_id` | `usuario` | RESTRICT | preservar autoria do relatório |

## População (seed)

A atividade DB exige **≥3 registros por tabela**, respeitando tipos, PKs e FKs. Ordem de inserção (respeita as dependências): `usuario` → `linha` → `trem` → `sensor` → `leitura_sensor` → `carga` → `alerta` → `relatorio`. Inserir os pais antes dos filhos, senão o FK falha.
