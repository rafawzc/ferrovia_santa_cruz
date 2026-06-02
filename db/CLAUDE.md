# db/ — banco MySQL

Scripts de inicialização do MySQL. O container `db` roda estes na primeira subida.

- **`schema.sql`** — criação do banco + tabelas. Ordem segue dependências de FK (pai antes de filho). Sem `DROP` destrutivo (`CREATE ... IF NOT EXISTS`).
- **`seed.sql`** — população (≥3 registros/tabela), na mesma ordem de dependência.

**Fonte da verdade do modelo é [`../docs/banco/modelo-de-dados.md`](../docs/banco/modelo-de-dados.md)** — ERD, tipos, chaves e o *porquê* de cada `ON DELETE`. Mudou tabela aqui? Atualize lá também.

Gotchas:
- A regra "não exclui sensor com leituras" mora no schema: `leitura_sensor.sensor_id` é `ON DELETE RESTRICT`. O backend só traduz o erro do banco.
- `cargo` é ENUM único em `usuario`, default `comum`. Não existe tabela de cargos.
- `senha_hash` no seed é placeholder — o hash real vem do backend.
