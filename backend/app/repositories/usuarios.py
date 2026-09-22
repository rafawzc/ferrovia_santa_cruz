from app.db import cursor

SELECT_USUARIO = """
    SELECT u.id, u.nome, u.email, u.senha_hash, u.cargo_id, u.telefone, u.foto_url, u.ativo,
           c.nome AS cargo, c.nivel_acesso AS papel
    FROM usuario u
    JOIN cargo c ON c.id = u.cargo_id
"""


class UsuariosMySQL:
    def por_id(self, id_):
        with cursor() as cur:
            cur.execute(SELECT_USUARIO + " WHERE u.id = %s", (id_,))
            return cur.fetchone()

    def por_email(self, email):
        with cursor() as cur:
            cur.execute(SELECT_USUARIO + " WHERE u.email = %s", (email,))
            return cur.fetchone()

    def criar(self, dados):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO usuario (nome, email, senha_hash, cargo_id, telefone)
                VALUES (%(nome)s, %(email)s, %(senha_hash)s,
                        COALESCE(%(cargo_id)s, DEFAULT(cargo_id)), %(telefone)s)
                """,
                dados,
            )
            return cur.lastrowid
