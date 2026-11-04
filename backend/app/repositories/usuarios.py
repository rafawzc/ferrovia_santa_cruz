from app.db import cursor

SELECT_USUARIO = """
    SELECT u.id, u.nome, u.email, u.senha_hash, u.cargo_id, u.telefone, u.foto_url, u.ativo,
           u.trem_id, c.nome AS cargo, c.nivel_acesso AS papel
    FROM usuario u
    JOIN cargo c ON c.id = u.cargo_id
"""


class UsuariosMySQL:
    def por_id(self, usuario_id):
        with cursor() as cur:
            cur.execute(SELECT_USUARIO + " WHERE u.id = %s", (usuario_id,))
            return cur.fetchone()

    def por_email(self, email):
        with cursor() as cur:
            cur.execute(SELECT_USUARIO + " WHERE u.email = %s", (email,))
            return cur.fetchone()

    def criar(self, usuario):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO usuario (nome, email, senha_hash, cargo_id, telefone)
                VALUES (%(nome)s, %(email)s, %(senha_hash)s,
                        COALESCE(%(cargo_id)s, DEFAULT(cargo_id)), %(telefone)s)
                """,
                usuario,
            )
            return cur.lastrowid

    def listar(self, busca, papel, ativo):
        condicoes, params = [], {}
        if busca is not None:
            condicoes.append("(u.nome LIKE %(busca)s OR u.email LIKE %(busca)s)")
            params["busca"] = f"%{busca}%"
        if papel is not None:
            condicoes.append("c.nivel_acesso = %(papel)s")
            params["papel"] = papel
        if ativo is not None:
            condicoes.append("u.ativo = %(ativo)s")
            params["ativo"] = ativo
        onde = " WHERE " + " AND ".join(condicoes) if condicoes else ""
        with cursor() as cur:
            cur.execute(SELECT_USUARIO + onde + " ORDER BY u.nome", params)
            return cur.fetchall()

    def listar_cargos(self):
        with cursor() as cur:
            cur.execute("SELECT id, nome, nivel_acesso AS papel FROM cargo ORDER BY id")
            return cur.fetchall()

    def atualizar(self, usuario_id, usuario):
        with cursor() as cur:
            cur.execute(
                """
                UPDATE usuario SET
                    nome = COALESCE(%(nome)s, nome),
                    email = COALESCE(%(email)s, email),
                    senha_hash = COALESCE(%(senha_hash)s, senha_hash),
                    cargo_id = COALESCE(%(cargo_id)s, cargo_id),
                    telefone = COALESCE(%(telefone)s, telefone),
                    ativo = COALESCE(%(ativo)s, ativo)
                WHERE id = %(id)s
                """,
                {**usuario, "id": usuario_id},
            )

    def desativar(self, usuario_id):
        with cursor() as cur:
            cur.execute("UPDATE usuario SET ativo = FALSE WHERE id = %s", (usuario_id,))

    def trocar_senha(self, usuario_id, senha_hash):
        with cursor() as cur:
            cur.execute(
                "UPDATE usuario SET senha_hash = %s WHERE id = %s", (senha_hash, usuario_id)
            )

    def contar_administradores_ativos(self):
        with cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) AS quantidade
                  FROM usuario u
                  JOIN cargo c ON c.id = u.cargo_id
                 WHERE u.ativo AND c.nivel_acesso = 'gestao'
                """
            )
            return cur.fetchone()["quantidade"]
