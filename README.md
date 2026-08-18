# Dr. Panda: AI Healthcare Diagnostic Chatbot

Dr. Panda is an AI powered healthcare diagnostic platform designed to perform medical symptom analysis and condition retrieval. The system evolves from classical machine learning classification to TF IDF similarity matching and BERT embeddings, delivering responses under 200 ms query latency.

## Project Documentation & Technical Report

* **Download Technical PDF Report**: [Technical_Report_Dr_Panda.pdf](Technical_Report_Dr_Panda.pdf)
* **Primary Dataset**: [Kaggle Medical Question Answering Dataset](https://www.kaggle.com/datasets/tboyle10/medicalquestionsandanswers)
* **Local Sample Data**: Included in `data/medical_qa_dataset.csv`

## Key Features

* Rapid diagnostic retrieval with under 200 ms response latency
* Multi model similarity pipeline combining TF IDF and BERT embeddings
* Interactive FastAPI REST service with Swagger UI documentation
* Streamlit web interface for patient symptom input and clinical recommendations

## Quickstart Guide

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
streamlit run app/frontend.py
```
