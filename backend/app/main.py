from fastapi import FastAPI

app = FastAPI(title="Ferrovia Santa Cruz")


@app.get("/api/health")
def health():
    return {"status": "ok"}
