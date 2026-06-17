import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash-lite")

ADVICE_HEALTHY = {
    "description": "La feuille de pommier est saine, aucune maladie detectee.",
    "symptomes": "Aucun symptome visible.",
    "traitement": "Aucun traitement necessaire.",
    "prevention": "Continuez la surveillance reguliere de votre verger.",
}

FALLBACK_ERROR = {
    "description": "Conseil indisponible pour le moment.",
    "symptomes": "-",
    "traitement": "-",
    "prevention": "-",
}


def get_disease_advice(predicted_class: str, predicted_label: str, severity: str) -> dict:
    if predicted_class == "apple_leaf_healthy":
        return ADVICE_HEALTHY

    prompt = f"""Tu es un expert en agronomie specialise dans les maladies du POMMIER (Malus domestica), arbre fruitier.

Une feuille de POMMIER a ete analysee et presente la maladie suivante : {predicted_label}
Severite : {severity}

IMPORTANT : le contexte est exclusivement le POMMIER (arbre fruitier produisant des pommes). Ne mentionne aucune autre plante (pas de soja, pas de cultures annuelles, etc.).

Reponds UNIQUEMENT avec un objet JSON valide (pas de markdown, pas de texte autour), avec exactement ces 4 cles en francais, chaque valeur tres courte (max 15 mots), specifique au pommier :
{{"description": "...", "symptomes": "...", "traitement": "...", "prevention": "..."}}"""

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=200,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
        return json.loads(response.text)
    except Exception:
        return FALLBACK_ERROR