import argparse
import json
import os
import random
import time
import urllib.request

FAIXAS = {
    "velocidade": (40.0, 85.0, 95.0, 125.0),
    "temperatura": (60.0, 90.0, 100.0, 125.0),
    "energia": (150.0, 380.0, 420.0, 560.0),
    "falha": (0.0, 0.4, 0.6, 1.0),
    "localizacao": (0.0, 100.0, 0.0, 100.0),
}
CHANCE_DE_ESTOURO = 0.25


def sortear(tipo_dado):
    normal_min, normal_max, estouro_min, estouro_max = FAIXAS[tipo_dado]
    if random.random() < CHANCE_DE_ESTOURO:
        return round(random.uniform(estouro_min, estouro_max), 2)
    return round(random.uniform(normal_min, normal_max), 2)


def chamar(url, chave, caminho, corpo=None):
    pedido = urllib.request.Request(
        url + caminho,
        data=json.dumps(corpo).encode() if corpo else None,
        headers={"X-API-Key": chave, "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(pedido, timeout=10) as resposta:
        return json.load(resposta)


def main():
    analisador = argparse.ArgumentParser(description="Gera leituras via POST /api/leituras")
    analisador.add_argument("--rodadas", type=int, default=1)
    analisador.add_argument("--intervalo", type=float, default=1.0)
    argumentos = analisador.parse_args()

    url = os.environ.get("SIM_URL", "http://backend:8000")
    chave = os.environ["SENSOR_API_KEY"]
    sensores = chamar(url, chave, "/api/leituras/sensores")
    print(f"{len(sensores)} sensores em {url}")

    for rodada in range(argumentos.rodadas):
        if rodada:
            time.sleep(argumentos.intervalo)
        for sensor in sensores:
            valor = sortear(sensor["tipo_dado"])
            corpo = {"sensor_id": sensor["id"], "valor": valor}
            leitura = chamar(url, chave, "/api/leituras", corpo)
            print(
                f"sensor {sensor['id']} ({sensor['tipo_dado']}) valor={valor} "
                f"status={leitura['status_operacional']} alerta={leitura['alerta_id']}"
            )


if __name__ == "__main__":
    main()
