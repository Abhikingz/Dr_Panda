import streamlit as st
import requests

st.set_page_config(page_title="Dr. Panda AI Diagnostic Assistant", page_icon="🩺", layout="centered")

st.title("🩺 Dr. Panda: Healthcare Diagnostic Assistant")
st.write("Enter patient symptoms below to receive rapid AI assisted condition screening and recommendations.")

query = st.text_area("Patient Symptoms / Query", placeholder="e.g. sharp headache with nausea and light sensitivity...")

if st.button("Analyze Symptoms", type="primary"):
    if not query.strip():
        st.warning("Please enter symptoms before submitting.")
    else:
        with st.spinner("Processing medical similarity match..."):
            try:
                res = requests.post("http://localhost:8000/api/v1/diagnose", json={"query": query, "top_k": 3})
                if res.status_code == 200:
                    data = res.json()
                    st.success(f"Analysis completed in {data['latency_ms']} ms")
                    
                    for match in data["matches"]:
                        with st.expander(f"{match['condition']} (Confidence: {int(match['confidence']*100)}%)"):
                            st.write(f"**Recommendation:** {match['recommendation']}")
                else:
                    st.error("API returned an error during diagnosis.")
            except Exception as e:
                st.info("FastAPI backend offline. Displaying local fallback engine result.")
                from app.nlp_engine import DiagnosticEngine
                engine = DiagnosticEngine()
                matches = engine.predict(query)
                for match in matches:
                    with st.expander(f"{match['condition']} (Confidence: {int(match['confidence']*100)}%)"):
                        st.write(f"**Recommendation:** {match['recommendation']}")
