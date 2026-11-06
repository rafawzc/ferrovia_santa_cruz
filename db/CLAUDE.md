# db/ — banco MySQL

Um arquivo só: **`script.sql`**. Ele cria o banco inteiro do zero — `DROP TABLE IF EXISTS` em ordem reversa de FK, `CREATE TABLE` em ordem de dependência, e os `INSERT` de carga. Pode ser importado quantas vezes for necessário: a importação é destrutiva e idempotente, sempre deixando o banco no mesmo estado.

Não tem `CREATE DATABASE` nem `USE`: o entrypoint do container `db` roda os arquivos de `/docker-entrypoint-initdb.d` **uma vez só, com o volume vazio**, já dentro do banco de `MYSQL_DATABASE`. Importando à mão (phpMyAdmin, `mysql <`), selecione o banco antes.

Editou o `script.sql`? O volume antigo ignora — reaplique com `./fsc db:reset` (apaga o dado de dev).

## Por que um arquivo e não `schema.sql` + `seed.sql`

O Fechamento da SA exige "um arquivo só, que cria tudo do zero com dados de exemplo", e o nível Avançado exige que ele possa ser reimportado quantas vezes for preciso. Dois arquivos com `CREATE TABLE IF NOT EXISTS` não atendiam: reimportar não recriava nada e os `INSERT` duplicavam.

## As dez tabelas

Ordem de criação = ordem de dependência: `cargo` → `linha` → `trem` → `usuario` → `sensor` → `leitura_sensor` → `alerta` → `viagem` → `carga` → `relatorio`.

| Tabela | O que guarda |
|--------|--------------|
| `cargo` | Função do usuário. `nivel_acesso` (`cliente`/`operacional`/`gestao`) é a matriz de acesso no banco. |
| `linha` | A rota da malha: número, `origem`, `destino` e status operacional. O trajeto exibido na tela é `origem → destino`. |
| `trem` | A composição: `prefixo` (padrão `TR-204`, único), `modelo`, `ano`, `capacidade_t`, `status`, `ultima_inspecao`. |
| `usuario` | Quem acessa. `cargo_id` dá o papel; `trem_id` é o vínculo do maquinista com o trem que opera. |
| `sensor` | Sensor IoT de um trem: `codigo` (padrão `S-TEMP-001`, único), `tipo_dado`, `localizacao`, `segmento`. |
| `leitura_sensor` | Cada medição. `status_operacional` (`normal`/`alerta`/`falha`) é derivado do valor pelos limites do tipo. |
| `alerta` | Alerta manual (sobre uma `linha`) **ou** automático (sobre uma `leitura_id`). `severidade` + `tratado`. |
| `viagem` | A viagem de um trem numa linha, com horários previstos e `status`. É daqui que sai "viagens em andamento". |
| `carga` | Carga transportada, opcionalmente num trem. |
| `relatorio` | Histórico dos pedidos de relatório. A geração em si não persiste (é `GET`). |

## Decisões que moram neste schema

- **`trem.prefixo` é `UNIQUE` no banco**, não só verificado na aplicação: prefixo repetido é erro de integridade, e o backend traduz o `1062` em 409. Uma trava em código se esquece num caminho novo; a do banco não.
- **`sensor` não tem coluna `ultima_leitura`.** O indicador é derivado por consulta (a leitura mais recente daquele sensor). Coluna denormalizada aqui envelheceria a cada leitura nova.
- **`alerta.linha_id` aceita `NULL`** porque o alerta automático não nasce de uma linha, e sim de uma leitura. Alerta manual tem `linha_id`; automático tem `leitura_id`. Nunca os dois.
- **"Alerta ativo" é `tratado = FALSE`.** É o que o painel conta por severidade.
- **Sem tabela `notificacoes`** (supera a decisão L2 de `docs/decisoes/uniformizacao-telas.md`): `alerta` com `tipo` + `severidade` + `tratado` cobre a tela de notificações e alertas inteira, e uma segunda tabela não teria consumidor.

## Mapa de `ON DELETE` (e o porquê de cada um)

| FK | Regra | Porquê |
|----|-------|--------|
| `leitura_sensor.sensor_id` | `RESTRICT` | Não se apaga um sensor que já mediu: o histórico é o produto do sistema. |
| `sensor.trem_id` | `RESTRICT` | Trem não desaparece deixando sensores órfãos. Excluir trem com sensor dá 409 com mensagem. |
| `viagem.linha_id`, `viagem.trem_id` | `RESTRICT` | Viagem é registro histórico; perder a referência inutilizaria o relatório de eficiência. |
| `trem.linha_id` | `SET NULL` | O trem sobrevive à linha: ele é realocado, não descartado. |
| `usuario.trem_id` | `SET NULL` | O maquinista continua existindo se o trem sair de operação. |
| `carga.trem_id` | `SET NULL` | A carga histórica sobrevive ao trem. |
| `alerta.linha_id` | `CASCADE` | Alerta manual não faz sentido sem a linha de que ele fala. |
| `alerta.leitura_id` | `SET NULL` | O alerta continua valendo como histórico mesmo sem a leitura de origem. |
| `usuario.cargo_id`, `relatorio.usuario_id` | `RESTRICT` | Não se apaga cargo em uso nem autor de relatório. |

## Gotchas

- `cargo` é semeado com **id explícito** porque `usuario.cargo_id` tem `DEFAULT 1` e o id 1 precisa ser `comum` (cadastro público nasce cliente). Não mexa na ordem nem nos ids do seed de `cargo` sem ajustar o default.
- As FKs do seed são resolvidas por **subconsulta pelo campo único** (`(SELECT id FROM trem WHERE prefixo = 'TR-204')`), não por id mágico. Reordenar um `INSERT` não quebra mais nada.
- As datas do seed são **relativas a `CURRENT_TIMESTAMP`** (`- INTERVAL 6 HOUR`), não fixas. É o que mantém a janela de tempo do painel (velocidade média) e as viagens em andamento com dado dentro delas em qualquer dia que o projeto for importado.
- `senha_hash` no seed é **argon2 real** (`pwdlib`, o mesmo que o backend verifica). Senha de dev de todos: **`ferrovia123`**. Usuários: `ana.admin@ferrovia.com` (admin/gestao), `carlos.maq@ferrovia.com` (maquinista/operacional, opera o `TR-204`), `bruna.rh@ferrovia.com` (rh/gestao), `cliente@email.com` (comum/cliente). Pra gerar outro hash, use um container descartável: `docker run --rm python:3.13-slim sh -c "pip install -q 'pwdlib[argon2]' && python -c \"from pwdlib import PasswordHash; print(PasswordHash.recommended().hash('SENHA'))\""`.
- `BOOLEAN` volta `0/1` e `DECIMAL` volta `Decimal` pro driver — quem converte é o model Pydantic.

**Fonte da verdade do modelo é [`../docs/banco/modelo-de-dados.md`](../docs/banco/modelo-de-dados.md)** (ERD e tipos). Mudou tabela aqui? Atualize lá também.
