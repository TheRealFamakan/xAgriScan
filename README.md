# xAgriScan

Appli web pour détecter les maladies sur les feuilles de pommier à partir d'une simple photo.

Le principe : tu upload une image de feuille, un modèle ResNet-50 fine-tuné classe la maladie parmi 6 catégories, et Gemini AI te donne des conseils de traitement.

## Stack

**Backend** : Python, Flask, PyTorch, Pillow, Gemini API  
**Frontend** : React 18, Vite, Tailwind CSS  
**Data/ML** : Pandas, Matplotlib, Seaborn, Jupyter

## Ce que ça fait

- Détection sur une image ou en lot (plusieurs images d'un coup)
- Affichage des probabilités pour chaque maladie
- Niveau de sévérité (aucune, faible, modérée, élevée)
- Conseils agronomiques via Gemini (description, symptômes, traitement, prévention)
- Labels en français

## Structure

```
xAgriScan/
├── backend/
│   ├── app.py                 # API Flask
│   ├── advice_service.py      # Appel Gemini pour les conseils
│   └── .env                   # Clé API Gemini
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── UploadZone.jsx
│   │       ├── ResultCard.jsx
│   │       ├── PredictionResult.jsx
│   │       └── BatchResults.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── models/
│   └── resnet50_xagriscan.pth  # ~90 Mo
├── notebooks/
│   ├── data_analysis.ipynb
│   └── resnet50_finetuning.ipynb
├── data/
│   ├── train/
│   ├── val/
│   └── test/
├── requirements.txt
└── .gitignore
```

## Installation

### Ce qu'il faut

- Python 3.10+
- Node.js 18+
- Une clé API Gemini ([Google AI Studio](https://aistudio.google.com/))

### Backend

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux / Mac
source .venv/bin/activate

pip install -r requirements.txt
pip install google-generativeai python-dotenv
```

Créer un fichier `backend/.env` :

```
GEMINI_API_KEY=ta_clé_ici
```

Lancer :

```bash
cd backend
python app.py
```

Tourne sur `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Tourne sur `http://localhost:5173`.

## API

**GET /api/health** — Check si le serveur tourne.

**POST /api/predict** — Envoyer une image (champ `image`), retourne la prédiction avec confiance, sévérité et conseils.

**POST /api/predict/batch** — Envoyer plusieurs images (champ `images`), retourne les résultats + stats globales.

Exemple de réponse (`/api/predict`) :

```json
{
  "predicted_class": "apple_rust_leaf",
  "predicted_label": "Rouille (Apple Rust)",
  "confidence": 97.52,
  "severity": "moderate",
  "is_healthy": false,
  "advice": {
    "description": "...",
    "symptomes": "...",
    "traitement": "...",
    "prevention": "..."
  }
}
```

## Les 6 classes

| Classe | Nom | Sévérité |
|---|---|---|
| `apple_frogeye_leaf_spot` | Tache oculaire | Modérée |
| `apple_leaf_healthy` | Feuille saine | Aucune |
| `apple_mosaic_leaf` | Mosaïque | Faible |
| `apple_powdery_mildew_leaf` | Oïdium | Élevée |
| `apple_rust_leaf` | Rouille | Modérée |
| `apple_scab_leaf` | Tavelure | Élevée |

Dataset organisé en `train/`, `val/`, `test/` — compatible `ImageFolder` de PyTorch.

## Le modèle

ResNet-50 pré-entraîné sur ImageNet, fine-tuné sur le dataset. La dernière couche FC est remplacée par `Dropout(0.5) + Linear(2048, 6)`. Les poids sont dans `models/resnet50_xagriscan.pth`.

Preprocessing : Resize(256), CenterCrop(224), normalisation ImageNet.

Les notebooks dans `notebooks/` contiennent l'analyse des données et le code d'entraînement.

## Auteur

**Camara Famakan**