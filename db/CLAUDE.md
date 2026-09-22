# db/ — banco MySQL

Scripts de inicialização do MySQL. O entrypoint do container `db` roda estes **uma vez só, com o volume vazio**, dentro do banco de `MYSQL_DATABASE` — por isso os scripts **não** têm `CREATE DATABASE`/`USE`. Editou schema/seed? Volume antigo ignora: reaplique com `./fsc db:reset` (apaga o dado de dev).

- **`schema.sql`** — criação das tabelas. Ordem segue dependências de FK (pai antes de filho). Sem `DROP` destrutivo (`CREATE ... IF NOT EXISTS`).
- **`seed.sql`** — população (≥3 registros/tabela), na mesma ordem de dependência.

**Fonte da verdade do modelo é [`../docs/banco/modelo-de-dados.md`](../docs/banco/modelo-de-dados.md)** — ERD, tipos, chaves e o *porquê* de cada `ON DELETE`. Mudou tabela aqui? Atualize lá também.

Gotchas:
- A regra "não exclui sensor com leituras" mora no schema: `leitura_sensor.sensor_id` é `ON DELETE RESTRICT`. O backend só traduz o erro do banco.
- `cargo` é **tabela** (não mais ENUM): `usuario.cargo_id` FK → `cargo(id)`, `DEFAULT 1`. O id 1 é `comum` e é seedado com **id explícito** justamente pra casar com esse default — não mexa na ordem/ids do seed de `cargo` sem ajustar o default. `cargo.nivel_acesso` (`cliente`/`operacional`/`gestao`) é a matriz de acesso no banco.
- `senha_hash` no seed é **argon2 real** (`pwdlib`, o mesmo que o backend verifica). Senha de dev de todos os usuários seedados: **`ferrovia123`**. Usuários: `ana.admin@ferrovia.com` (admin/gestao), `carlos.maq@ferrovia.com` (maquinista/operacional), `bruna.rh@ferrovia.com` (rh/gestao), `cliente@email.com` (comum/cliente). Pra gerar outro hash, use um container descartável: `docker run --rm python:3.13-slim sh -c "pip install -q 'pwdlib[argon2]' && python -c \"from pwdlib import PasswordHash; print(PasswordHash.recommended().hash('SENHA'))\""`.
