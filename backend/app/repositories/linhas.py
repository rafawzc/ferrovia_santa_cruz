from app.db import cursor


class LinhasMySQL:
    def listar(self):
        with cursor() as cur:
            cur.execute("SELECT id, numero, status, ativo FROM linha ORDER BY numero")
            return cur.fetchall()
