# contains FASTAPI code for the project

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid

from ENSEMBLE.final import ensemble_predict   # adjust if path differs

app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)


def save_temp_file(upload_file: UploadFile):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(TEMP_DIR, file_id + "_" + upload_file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path


@app.post("/predict")
async def predict_api(
    conjunctiva: UploadFile = File(...),
    palm: UploadFile = File(...),
    nails: UploadFile = File(...)
):
    try:
        # Save files temporarily
        conj_path = save_temp_file(conjunctiva)
        palm_path = save_temp_file(palm)
        nails_path = save_temp_file(nails)

        # Call your existing function (UNCHANGED)
        result = ensemble_predict(
            conj_path=conj_path,
            palm_path=palm_path,
            nails_path=nails_path
        )

        return result

    finally:
        # Clean up temp files
        for path in [conj_path, palm_path, nails_path]:
            if os.path.exists(path):
                os.remove(path)