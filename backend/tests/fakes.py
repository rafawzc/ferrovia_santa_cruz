from mysql.connector.errors import IntegrityError

from app.core.security import hash_senha

CARGOS = {1: ("comum", "cliente"), 2: ("admin", "gestao"), 5: ("maquinista", "operacional")}
SENHA = "ferrovia123"
GESTAO, OPERACIONAL, CLIENTE, INATIVO = 1, 2, 3, 4


def duplicado():
    return IntegrityError(msg="Duplicate entry", errno=1062)


def sem_referencia():
    return IntegrityError(msg="Cannot add or update a child row", errno=1452)


class UsuariosFake:
    def __init__(self):
        hash_ = hash_senha(SENHA)
        self.dados = {}
        for id_, nome, email, cargo_id, ativo in [
            (GESTAO, "Ana Gestora", "ana@ferrovia.com", 2, True),
            (OPERACIONAL, "Carlos Souza", "carlos@ferrovia.com", 5, True),
            (CLIENTE, "Cliente Comum", "cliente@email.com", 1, True),
            (INATIVO, "Ex Funcionario", "ex@ferrovia.com", 5, False),
        ]:
            self.dados[id_] = {
                "id": id_,
                "nome": nome,
                "email": email,
                "senha_hash": hash_,
                "cargo_id": cargo_id,
                "telefone": None,
                "foto_url": None,
                "ativo": ativo,
            }

    def _completo(self, usuario):
        cargo, papel = CARGOS[usuario["cargo_id"]]
        return {**usuario, "cargo": cargo, "papel": papel}

    def _valida(self, dados, ignorar_id=None):
        email = dados.get("email")
        if any(u["email"] == email and u["id"] != ignorar_id for u in self.dados.values()):
            raise duplicado()
        if dados.get("cargo_id") is not None and dados["cargo_id"] not in CARGOS:
            raise sem_referencia()

    def por_id(self, id_):
        usuario = self.dados.get(id_)
        return self._completo(usuario) if usuario else None

    def por_email(self, email):
        return next((self._completo(u) for u in self.dados.values() if u["email"] == email), None)

    def listar(self):
        return [self._completo(u) for u in self.dados.values()]

    def listar_cargos(self):
        return [{"id": id_, "nome": nome, "papel": papel} for id_, (nome, papel) in CARGOS.items()]

    def criar(self, dados):
        self._valida(dados)
        id_ = max(self.dados) + 1
        self.dados[id_] = {
            "id": id_,
            "telefone": None,
            "foto_url": None,
            "ativo": True,
            "cargo_id": 1,
            **{k: v for k, v in dados.items() if v is not None},
        }
        return id_

    def atualizar(self, id_, dados):
        self._valida(dados, ignorar_id=id_)
        self.dados[id_].update({k: v for k, v in dados.items() if v is not None})

    def desativar(self, id_):
        self.dados[id_]["ativo"] = False


AGORA = "2026-09-22T10:00:00"
LINHAS = [
    {"id": 1, "numero": "1778", "status": "manutencao", "ativo": True},
    {"id": 2, "numero": "2645", "status": "atraso", "ativo": True},
    {"id": 3, "numero": "9845", "status": "fechado", "ativo": False},
]
TRENS = {1, 2, 3}


class LinhasFake:
    def listar(self):
        return LINHAS


class CargasFake:
    def __init__(self):
        self.dados = [
            {
                "id": 1,
                "tipo": "Minerio de ferro",
                "peso_t": 12.5,
                "local_partida": "Genebra",
                "destino": "Zermatt",
                "vagao": "A",
                "trem_id": 1,
                "criado_em": AGORA,
            }
        ]

    def listar(self):
        return self.dados

    def criar(self, dados):
        if dados["trem_id"] is not None and dados["trem_id"] not in TRENS:
            raise sem_referencia()
        carga = {**dados, "id": len(self.dados) + 1, "criado_em": AGORA}
        self.dados.append(carga)
        return carga


class AlertasFake:
    def __init__(self):
        self.dados = [
            {
                "id": 1,
                "linha_id": 1,
                "linha_numero": "1778",
                "tempo_espera": "15 a 30 min",
                "motivo": "manutencao no trilho",
                "status": "Parado",
                "criado_em": AGORA,
            }
        ]

    def listar(self):
        return self.dados

    def criar(self, dados):
        linha = next((li for li in LINHAS if li["id"] == dados["linha_id"]), None)
        if linha is None:
            raise sem_referencia()
        alerta = {**dados, "id": len(self.dados) + 1, "linha_numero": linha["numero"]}
        alerta["criado_em"] = AGORA
        self.dados.insert(0, alerta)
        return alerta
