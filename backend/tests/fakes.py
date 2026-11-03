from mysql.connector.errors import IntegrityError

from app.core.security import hash_senha

CARGO_CLIENTE = 1
CARGOS = {
    CARGO_CLIENTE: ("comum", "cliente"),
    2: ("admin", "gestao"),
    5: ("maquinista", "operacional"),
}
SENHA = "ferrovia123"
ID_GESTAO, ID_OPERACIONAL, ID_CLIENTE, ID_INATIVO = 1, 2, 3, 4
ID_OPERACIONAL_SEM_TREM, ID_OPERACIONAL_SEM_LEITURA, ID_GESTAO_SUPLENTE = 5, 6, 7


def duplicado():
    return IntegrityError(msg="Duplicate entry", errno=1062)


def sem_referencia():
    return IntegrityError(msg="Cannot add or update a child row", errno=1452)


class UsuariosFake:
    def __init__(self):
        hash_ = hash_senha(SENHA)
        self.dados = {}
        for id_, nome, email, cargo_id, ativo, trem_id in [
            (ID_GESTAO, "Ana Gestora", "ana@ferrovia.com", 2, True, None),
            (ID_OPERACIONAL, "Carlos Souza", "carlos@ferrovia.com", 5, True, TREM_COM_LEITURA),
            (ID_CLIENTE, "Cliente Comum", "cliente@email.com", 1, True, None),
            (ID_INATIVO, "Ex Funcionario", "ex@ferrovia.com", 5, False, None),
            (ID_OPERACIONAL_SEM_TREM, "Davi Sem Trem", "davi@ferrovia.com", 5, True, None),
            (
                ID_OPERACIONAL_SEM_LEITURA,
                "Elisa Parada",
                "elisa@ferrovia.com",
                5,
                True,
                TREM_SEM_LEITURA,
            ),
            (ID_GESTAO_SUPLENTE, "Bruna Lima", "bruna@ferrovia.com", 2, True, None),
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
                "trem_id": trem_id,
            }

    def _completo(self, usuario):
        cargo, papel = CARGOS[usuario["cargo_id"]]
        return {**usuario, "cargo": cargo, "papel": papel}

    def _valida(self, dados, ignorar_id=None):
        email = dados.get("email")
        email_em_uso = any(
            u["email"] == email and u["id"] != ignorar_id for u in self.dados.values()
        )
        if email_em_uso:
            raise duplicado()
        cargo_id = dados.get("cargo_id")
        cargo_inexistente = cargo_id is not None and cargo_id not in CARGOS
        if cargo_inexistente:
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
            "cargo_id": CARGO_CLIENTE,
            "trem_id": None,
            **{k: v for k, v in dados.items() if v is not None},
        }
        return id_

    def atualizar(self, id_, dados):
        self._valida(dados, ignorar_id=id_)
        self.dados[id_].update({k: v for k, v in dados.items() if v is not None})

    def desativar(self, id_):
        self.dados[id_]["ativo"] = False

    def trocar_senha(self, id_, senha_hash):
        self.dados[id_]["senha_hash"] = senha_hash

    def contar_administradores_ativos(self):
        return sum(
            1 for u in self.dados.values() if u["ativo"] and CARGOS[u["cargo_id"]][1] == "gestao"
        )


AGORA = "2026-09-22T10:00:00"
LINHAS = [
    {"id": 1, "numero": "1778", "status": "manutencao", "ativo": True},
    {"id": 2, "numero": "2645", "status": "atraso", "ativo": True},
    {"id": 3, "numero": "9845", "status": "fechado", "ativo": False},
]
TRENS = {1, 2, 3}
TREM_COM_LEITURA, TREM_SEM_LEITURA = 1, 2
INDICADORES = {
    None: {
        "trens_por_status": [
            {"status": "ativo", "quantidade": 2},
            {"status": "manutencao", "quantidade": 1},
        ],
        "alertas_ativos_por_severidade": [
            {"severidade": "atencao", "quantidade": 1},
            {"severidade": "critico", "quantidade": 3},
        ],
        "sensores_criticos": 2,
        "viagens_em_andamento": 4,
        "velocidade_media": 72.5,
    },
    TREM_COM_LEITURA: {
        "trens_por_status": [{"status": "ativo", "quantidade": 1}],
        "alertas_ativos_por_severidade": [{"severidade": "critico", "quantidade": 1}],
        "sensores_criticos": 1,
        "viagens_em_andamento": 2,
        "velocidade_media": 68.0,
    },
    TREM_SEM_LEITURA: {
        "trens_por_status": [{"status": "parado", "quantidade": 1}],
        "alertas_ativos_por_severidade": [],
        "sensores_criticos": 0,
        "viagens_em_andamento": 0,
        "velocidade_media": None,
    },
}


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
        trem_id = dados["trem_id"]
        trem_inexistente = trem_id is not None and trem_id not in TRENS
        if trem_inexistente:
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
        linha_encontrada = next(
            (linha for linha in LINHAS if linha["id"] == dados["linha_id"]), None
        )
        if linha_encontrada is None:
            raise sem_referencia()
        alerta = {
            **dados,
            "id": len(self.dados) + 1,
            "linha_numero": linha_encontrada["numero"],
        }
        alerta["criado_em"] = AGORA
        self.dados.insert(0, alerta)
        return alerta


class DashboardFake:
    def trens_por_status(self, trem_id):
        return INDICADORES[trem_id]["trens_por_status"]

    def alertas_ativos_por_severidade(self, trem_id):
        return INDICADORES[trem_id]["alertas_ativos_por_severidade"]

    def sensores_criticos(self, trem_id):
        return INDICADORES[trem_id]["sensores_criticos"]

    def viagens_em_andamento(self, trem_id):
        return INDICADORES[trem_id]["viagens_em_andamento"]

    def velocidade_media(self, trem_id):
        return INDICADORES[trem_id]["velocidade_media"]
