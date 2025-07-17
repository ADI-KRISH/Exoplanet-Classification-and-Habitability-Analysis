from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import joblib
import numpy as np
import os
import google.generativeai as genai
from google.auth.exceptions import DefaultCredentialsError
from langchain_google_genai import GoogleGenerativeAI

# === Load Environment Variables Early ===
load_dotenv()
GOOGLE_API_KEY = os.getenv("apikey")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY environment variable is required")

# === Load Models ===
exo_model = joblib.load('rf_model.pkl')
scaler1 = joblib.load('sc_model.pkl')
habitability_model = joblib.load('xgboost_model.pkl')
scaler2 = joblib.load('scaler_continuous.pkl')

# === FastAPI App Setup ===
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === Input Schemas ===
class Exoplanet_input(BaseModel):
    features: list  # 19 features

class Habitability_input(BaseModel):
    features: list  # 15 features

class GeminiExplanationRequest(BaseModel):
    message: str

# === Feature Indexing ===
continuous_indices = [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
binary_flag_indices = [4, 5, 6, 7]
c_i = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
b_i = [0, 3]

# === Exoplanet Prediction Endpoint ===
@app.post("/predict")
def predict(input_data: Exoplanet_input):
    try:
        features = np.array(input_data.features)
        if len(features) != 19:
            raise ValueError("Exactly 19 features are required.")

        continuous_features = features[continuous_indices].reshape(1, -1)
        flag_features = features[binary_flag_indices].reshape(1, -1)
        scaled_continuous = scaler1.transform(continuous_features)

        final_input = []
        scaled_iter = iter(scaled_continuous.flatten())
        flag_iter = iter(flag_features.flatten())

        for i in range(19):
            if i in binary_flag_indices:
                final_input.append(next(flag_iter))
            else:
                final_input.append(next(scaled_iter))

        final_input = np.array(final_input).reshape(1, -1)

        prediction = exo_model.predict(final_input)[0]
        class_index = list(exo_model.classes_).index(prediction)
        confidence = exo_model.predict_proba(final_input)[0][class_index]

        return {
            "prediction": prediction,
            "label": prediction.lower(),
            "confidence": float(confidence)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === Habitability Prediction Endpoint ===
@app.post("/habitability-predict")
def habitability_predict(input_data: Habitability_input):
    try:
        features = np.array(input_data.features)
        if len(features) != 15:
            raise ValueError("Exactly 15 features are required.")

        continuous_features = features[c_i].reshape(1, -1)
        flag_features = features[b_i].reshape(1, -1)
        scaled_continuous = scaler2.transform(continuous_features)

        final_input = []
        scaled_iter = iter(scaled_continuous.flatten())
        flag_iter = iter(flag_features.flatten())

        for i in range(15):
            if i in b_i:
                final_input.append(next(flag_iter))
            else:
                final_input.append(next(scaled_iter))

        final_input = np.array(final_input).reshape(1, -1)
        prediction = habitability_model.predict(final_input)[0]
        confidence = habitability_model.predict_proba(final_input)[0][int(prediction)]

        return {
            "status": "habitable" if prediction == 1 else "not habitable",
            "confidence": float(confidence)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# === Gemini LLM Initialization ===
try:
    genai.configure(api_key=GOOGLE_API_KEY)
    llm = GoogleGenerativeAI(
        model='gemini-2.0-flash',
        temperature=0.5,
        google_api_key=GOOGLE_API_KEY
    )
except DefaultCredentialsError as e:
    raise RuntimeError("Google Cloud credentials not found.") from e
except Exception as e:
    raise RuntimeError(f"Failed to initialize Gemini: {str(e)}")

# === Gemini Explanation Endpoint ===
@app.post("/gemini-explanation")
async def generate_explanation(input_data: GeminiExplanationRequest):
    try:
        response = await llm.ainvoke(input_data.message.strip())
        return {"explanation": response}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini Error: {str(e)}"
        )
