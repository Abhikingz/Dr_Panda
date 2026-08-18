# Dr. Panda: AI Healthcare Diagnostic Chatbot

Dr. Panda is an AI powered healthcare diagnostic platform designed to perform medical symptom analysis and condition retrieval. The system evolves from classical machine learning classification to TF IDF similarity matching and BERT embeddings, delivering responses under 200 ms query latency.

## Key Features

* Rapid diagnostic retrieval with under 200 ms response latency
* Multi model similarity pipeline combining TF IDF and BERT embeddings
* Interactive FastAPI REST service with Swagger UI documentation
* Streamlit web interface for patient symptom input and clinical recommendations

## Project Structure

```
Dr_Panda/
├── app/
│   ├── main.py          # FastAPI application routes
│   ├── nlp_engine.py    # Symptom similarity matching engine
│   └── frontend.py      # Streamlit web application
├── requirements.txt     # Dependency specifications
└── README.md            # System documentation
```

## Quickstart Guide

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Start FastAPI Backend
```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Launch Web Interface
```bash
streamlit run app/frontend.py
```

## Performance Metrics

* Semantic Accuracy: 76.8% semantic similarity match on medical QA benchmarks
* Response Time: Sub 200 ms query processing time
* API Documentation: Accessible at `http://localhost:8000/docs`
