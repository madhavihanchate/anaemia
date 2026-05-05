from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid

from ENSEMBLE.final import ensemble_predict

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_DIR = os.path.join(BASE_DIR, "temp_uploads")
os.makedirs(TEMP_DIR, exist_ok=True)

ALLOWED_TYPES = ["image/jpeg", "image/png"]


def validate_file(file: UploadFile):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")


def save_temp_file(upload_file: UploadFile):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_DIR, file_id + "_" + upload_file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/predict")
async def predict_api(
    conjunctiva: UploadFile = File(...),
    palm: UploadFile = File(...),
    nails: UploadFile = File(...)
):
    conj_path = palm_path = nails_path = None

    try:
        validate_file(conjunctiva)
        validate_file(palm)
        validate_file(nails)

        conj_path = save_temp_file(conjunctiva)
        palm_path = save_temp_file(palm)
        nails_path = save_temp_file(nails)

        result = ensemble_predict(
            conj_path=conj_path,
            palm_path=palm_path,
            nails_path=nails_path
        )

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        for path in [conj_path, palm_path, nails_path]:
            if path and os.path.exists(path):
                os.remove(path)