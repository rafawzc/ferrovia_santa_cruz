from datetime import datetime

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


def duplicado():
    return IntegrityError(msg="Duplicate entry", errno=1062)


def sem_referencia():
    return IntegrityError(msg="Cannot add or update a child row", errno=1452)


def em_uso():
    return IntegrityError(msg="Cannot delete or update a parent row", errno=1451)


class UsuariosFake:
    def __init__(self):
        hash_ = hash_senha(SENHA)
        self.dados = {}
        for id_, nome, email, cargo_id, ativo in [
            (ID_GESTAO, "Ana Gestora", "ana@ferrovia.com", 2, True),
            (ID_OPERACIONAL, "Carlos Souza", "carlos@ferrovia.com", 5, True),
            (ID_CLIENTE, "Cliente Comum", "cliente@email.com", 1, True),
            (ID_INATIVO, "Ex Funcionario", "ex@ferrovia.com", 5, False),
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
    {
        "id": 1,
        "numero": "1778",
        "origem": "Genebra",
        "destino": "Zermatt",
        "status": "manutencao",
        "ativo": True,
    },
    {
        "id": 2,
        "numero": "2645",
        "origem": "Zurique",
        "destino": "Berna",
        "status": "atraso",
        "ativo": True,
    },
    {
        "id": 3,
        "numero": "9845",
        "origem": "Lucerna",
        "destino": "Basileia",
        "status": "fechado",
        "ativo": False,
    },
]
TRENS_INICIAIS = [
    {
        "id": 1,
        "prefixo": "TR-118",
        "modelo": "EMD SD70M",
        "ano": 2014,
        "capacidade_t": 1650.5,
        "status": "ativo",
        "ultima_inspecao": "2026-08-02",
        "linha_id": 2,
        "total_sensores": 2,
    },
    {
        "id": 2,
        "prefixo": "TR-204",
        "modelo": "GE AC44i",
        "ano": 2018,
        "capacidade_t": 1800.0,
        "status": "manutencao",
        "ultima_inspecao": "2026-09-14",
        "linha_id": 1,
        "total_sensores": 1,
    },
    {
        "id": 3,
        "prefixo": "TR-301",
        "modelo": "Villares V8 SD",
        "ano": 2009,
        "capacidade_t": 980.75,
        "status": "parado",
        "ultima_inspecao": None,
        "linha_id": None,
        "total_sensores": 0,
    },
]
TRENS = {trem["id"] for trem in TRENS_INICIAIS}
SENSORES_INICIAIS = [
    {
        "id": 1,
        "codigo": "S-VEL-001",
        "nome": "Velocimetro dianteiro",
        "tipo_dado": "velocidade",
        "localizacao": "Cabine",
        "segmento": "Jaragua - Joinville",
        "trem_id": 1,
        "ultima_leitura_status": "alerta",
        "ultima_leitura_valor": 94.6,
        "ultima_leitura_data": AGORA,
    },
    {
        "id": 2,
        "codigo": "S-TEMP-001",
        "nome": "Temperatura do motor",
        "tipo_dado": "temperatura",
        "localizacao": "Motor",
        "segmento": "Jaragua - Joinville",
        "trem_id": 1,
        "ultima_leitura_status": "falha",
        "ultima_leitura_valor": 115.7,
        "ultima_leitura_data": AGORA,
    },
    {
        "id": 3,
        "codigo": "S-LOC-001",
        "nome": "Localizador GPS",
        "tipo_dado": "localizacao",
        "localizacao": "Cabine",
        "segmento": None,
        "trem_id": 2,
        "ultima_leitura_status": None,
        "ultima_leitura_valor": None,
        "ultima_leitura_data": None,
    },
]


class LinhasFake:
    def __init__(self):
        self.dados = [dict(linha) for linha in LINHAS]

    def _valida(self, dados, ignorar_id=None):
        numero = dados["numero"]
        repetido = any(
            linha["numero"] == numero and linha["id"] != ignorar_id for linha in self.dados
        )
        if repetido:
            raise duplicado()

    def listar(self, filtros):
        status = filtros["status"]
        return [linha for linha in self.dados if status in (None, linha["status"])]

    def por_id(self, linha_id):
        return next((linha for linha in self.dados if linha["id"] == linha_id), None)

    def criar(self, dados):
        self._valida(dados)
        linha = {**dados, "id": max(linha["id"] for linha in self.dados) + 1}
        self.dados.append(linha)
        return linha

    def atualizar(self, linha_id, dados):
        self._valida(dados, ignorar_id=linha_id)
        self.por_id(linha_id).update({k: v for k, v in dados.items() if v is not None})

    def remover(self, linha_id):
        self.dados = [linha for linha in self.dados if linha["id"] != linha_id]


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
                "id": 2,
                "linha_id": None,
                "linha_numero": None,
                "leitura_id": 7,
                "tipo": "temperatura",
                "severidade": "critico",
                "tempo_espera": None,
                "motivo": "temperatura acima do limite",
                "status": "Falha",
                "tratado": False,
                "criado_em": AGORA,
            },
            {
                "id": 1,
                "linha_id": 1,
                "linha_numero": "1778",
                "leitura_id": None,
                "tipo": "manual",
                "severidade": "atencao",
                "tempo_espera": "15 a 30 min",
                "motivo": "manutencao no trilho",
                "status": "Parado",
                "tratado": True,
                "criado_em": AGORA,
            },
        ]

    def listar(self, filtros):
        campos = ("severidade", "tipo", "tratado")
        return [
            alerta
            for alerta in self.dados
            if all(filtros[campo] in (None, alerta[campo]) for campo in campos)
        ]

    def por_id(self, alerta_id):
        return next((alerta for alerta in self.dados if alerta["id"] == alerta_id), None)

    def marcar_tratado(self, alerta_id, tratado):
        self.por_id(alerta_id)["tratado"] = tratado

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
            "leitura_id": None,
            "tratado": False,
            "criado_em": AGORA,
        }
        self.dados.insert(0, alerta)
        return alerta


class DashboardFake:
    def metricas(self):
        return {
            "linhas_ativas": 3,
            "linhas_em_manutencao": 1,
            "sensores": 4,
            "velocidade_media": 90.4,
        }


def _numero_da_linha(linha_id):
    return next((linha["numero"] for linha in LINHAS if linha["id"] == linha_id), None)


def _com_trem(sensor):
    trem = _trem_por_id(sensor["trem_id"])
    return {**sensor, "trem_prefixo": trem["prefixo"], "trem_modelo": trem["modelo"]}


def _trem_por_id(trem_id):
    return next((trem for trem in TRENS_INICIAIS if trem["id"] == trem_id), None)


class TrensFake:
    def __init__(self):
        self.dados = [
            {**trem, "linha_numero": _numero_da_linha(trem["linha_id"])} for trem in TRENS_INICIAIS
        ]

    def listar(self, busca, status):
        alvo = (busca or "").lower()
        achados = [
            trem
            for trem in self.dados
            if alvo in trem["prefixo"].lower() or alvo in trem["modelo"].lower()
        ]
        if status is not None:
            achados = [trem for trem in achados if trem["status"] == status]
        return sorted(achados, key=lambda trem: trem["prefixo"])

    def por_id(self, trem_id):
        return next((trem for trem in self.dados if trem["id"] == trem_id), None)

    def criar(self, trem):
        self._valida(trem)
        novo = {
            **trem,
            "id": max(existente["id"] for existente in self.dados) + 1,
            "linha_numero": _numero_da_linha(trem["linha_id"]),
            "total_sensores": 0,
        }
        self.dados.append(novo)
        return novo

    def atualizar(self, trem_id, trem):
        enviados = {campo: valor for campo, valor in trem.items() if valor is not None}
        self._valida(enviados, ignorar_id=trem_id)
        alvo = self.por_id(trem_id)
        alvo.update(enviados)
        alvo["linha_numero"] = _numero_da_linha(alvo["linha_id"])

    def excluir(self, trem_id):
        alvo = self.por_id(trem_id)
        if alvo["total_sensores"]:
            raise em_uso()
        self.dados.remove(alvo)

    def _valida(self, trem, ignorar_id=None):
        prefixo = trem.get("prefixo")
        repetido = any(
            existente["prefixo"] == prefixo and existente["id"] != ignorar_id
            for existente in self.dados
        )
        if repetido:
            raise duplicado()
        linha_id = trem.get("linha_id")
        if linha_id is not None and _numero_da_linha(linha_id) is None:
            raise sem_referencia()


class SensoresFake:
    def __init__(self):
        self.dados = [_com_trem(sensor) for sensor in SENSORES_INICIAIS]

    def listar(self, tipo, trem_id):
        achados = [
            sensor
            for sensor in self.dados
            if (tipo is None or sensor["tipo_dado"] == tipo)
            and (trem_id is None or sensor["trem_id"] == trem_id)
        ]
        return sorted(achados, key=lambda sensor: (sensor["trem_prefixo"], sensor["codigo"]))

    def por_id(self, sensor_id):
        return next((sensor for sensor in self.dados if sensor["id"] == sensor_id), None)

    def criar(self, sensor):
        self._valida(sensor)
        novo = _com_trem(
            {
                **sensor,
                "id": max(existente["id"] for existente in self.dados) + 1,
                "ultima_leitura_status": None,
                "ultima_leitura_valor": None,
                "ultima_leitura_data": None,
            }
        )
        self.dados.append(novo)
        return novo

    def atualizar(self, sensor_id, sensor):
        enviados = {campo: valor for campo, valor in sensor.items() if valor is not None}
        self._valida(enviados, ignorar_id=sensor_id)
        alvo = self.por_id(sensor_id)
        alvo.update(_com_trem({**alvo, **enviados}))

    def excluir(self, sensor_id):
        alvo = self.por_id(sensor_id)
        if alvo["ultima_leitura_data"] is not None:
            raise em_uso()
        self.dados.remove(alvo)

    def _valida(self, sensor, ignorar_id=None):
        codigo = sensor.get("codigo")
        repetido = any(
            existente["codigo"] == codigo and existente["id"] != ignorar_id
            for existente in self.dados
        )
        if repetido:
            raise duplicado()
        trem_id = sensor.get("trem_id")
        if trem_id is not None and _trem_por_id(trem_id) is None:
            raise sem_referencia()


PREFIXOS = {trem["id"]: trem["prefixo"] for trem in TRENS_INICIAIS}
VIAGENS = [
    {
        "id": 1,
        "linha_id": 1,
        "trem_id": 1,
        "partida_prevista": datetime(2026, 9, 22, 6, 0),
        "chegada_prevista": datetime(2026, 9, 22, 9, 0),
        "status": "programada",
        "criado_em": AGORA,
    },
    {
        "id": 2,
        "linha_id": 2,
        "trem_id": 2,
        "partida_prevista": datetime(2026, 9, 23, 9, 0),
        "chegada_prevista": datetime(2026, 9, 23, 12, 0),
        "status": "em_andamento",
        "criado_em": AGORA,
    },
    {
        "id": 3,
        "linha_id": 1,
        "trem_id": 3,
        "partida_prevista": datetime(2026, 9, 22, 18, 0),
        "chegada_prevista": datetime(2026, 9, 22, 21, 0),
        "status": "concluida",
        "criado_em": AGORA,
    },
]


class ViagensFake:
    def __init__(self):
        self.dados = [dict(viagem) for viagem in VIAGENS]

    def _completo(self, viagem):
        linha = next(linha for linha in LINHAS if linha["id"] == viagem["linha_id"])
        return {
            **viagem,
            "linha_numero": linha["numero"],
            "origem": linha["origem"],
            "destino": linha["destino"],
            "trem_prefixo": PREFIXOS[viagem["trem_id"]],
        }

    def _valida(self, dados):
        linha_id, trem_id = dados["linha_id"], dados["trem_id"]
        sem_linha = linha_id is not None and all(linha["id"] != linha_id for linha in LINHAS)
        sem_trem = trem_id is not None and trem_id not in PREFIXOS
        if sem_linha or sem_trem:
            raise sem_referencia()

    def _combina(self, viagem, filtros):
        data = filtros["data"]
        iguais = all(
            filtros[campo] in (None, viagem[campo]) for campo in ("status", "trem_id", "linha_id")
        )
        return iguais and data in (None, viagem["partida_prevista"].date())

    def listar(self, filtros):
        achadas = [viagem for viagem in self.dados if self._combina(viagem, filtros)]
        achadas.sort(key=lambda viagem: viagem["partida_prevista"], reverse=True)
        return [self._completo(viagem) for viagem in achadas]

    def por_id(self, viagem_id):
        viagem = next((v for v in self.dados if v["id"] == viagem_id), None)
        return self._completo(viagem) if viagem else None

    def criar(self, dados):
        self._valida(dados)
        viagem = {
            **dados,
            "id": max(viagem["id"] for viagem in self.dados) + 1,
            "criado_em": AGORA,
        }
        self.dados.append(viagem)
        return self._completo(viagem)

    def atualizar(self, viagem_id, dados):
        self._valida(dados)
        viagem = next(v for v in self.dados if v["id"] == viagem_id)
        viagem.update({k: v for k, v in dados.items() if v is not None})

    def remover(self, viagem_id):
        self.dados = [viagem for viagem in self.dados if viagem["id"] != viagem_id]
