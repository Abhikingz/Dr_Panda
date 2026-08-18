import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class DiagnosticEngine:
    def __init__(self):
        # Sample medical QA database for similarity retrieval
        self.medical_kb = [
            {
                "symptoms": "persistent cough shortness of breath fever chest discomfort",
                "condition": "Acute Bronchitis or Respiratory Infection",
                "recommendation": "Consult a physician for a chest evaluation. Rest and stay hydrated."
            },
            {
                "symptoms": "sharp headache nausea light sensitivity vision blurring",
                "condition": "Migraine Headache",
                "recommendation": "Rest in a dark quiet room. Hydrate and consider over the counter pain relief."
            },
            {
                "symptoms": "abdominal pain bloating nausea diarrhea fever after eating",
                "condition": "Gastroenteritis",
                "recommendation": "Maintain electrolyte balance with fluid replacement. Seek care if symptoms escalate."
            },
            {
                "symptoms": "joint stiffness swelling fatigue low grade fever morning tightness",
                "condition": "Inflammatory Arthritis",
                "recommendation": "Schedule an appointment with a rheumatologist for joint evaluation."
            },
            {
                "symptoms": "frequent urination excessive thirst unexplained weight loss fatigue",
                "condition": "Elevated Blood Glucose Indicator",
                "recommendation": "Consult an endocrinologist or general practitioner for HbA1c testing."
            }
        ]
        
        self.corpus = [item["symptoms"] for item in self.medical_kb]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        self.tfidf_matrix = self.vectorizer.fit_transform(self.corpus)

    def predict(self, query: str, top_k: int = 3):
        query_vec = self.vectorizer.transform([query.lower()])
        scores = cosine_similarity(query_vec, self.tfidf_matrix).flatten()
        
        top_indices = np.argsort(scores)[::-1][:top_k]
        results = []
        
        for idx in top_indices:
            score = float(scores[idx])
            # Normalize confidence score
            conf = max(0.55, min(0.96, score + 0.50)) if score > 0 else 0.45
            results.append({
                "condition": self.medical_kb[idx]["condition"],
                "confidence": round(conf, 4),
                "recommendation": self.medical_kb[idx]["recommendation"]
            })
            
        return results
