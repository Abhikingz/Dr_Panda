import { useState, useRef, useEffect, useCallback } from "react";

const URGENCY_CONFIG = [
  { level: 1, label: "Rest & Monitor", shortLabel: "REST", color: "#3B6D11", bg: "#EAF3DE", text: "#173404", border: "#97C459", icon: "moon-stars", desc: "Home care & rest recommended" },
  { level: 2, label: "Routine Visit", shortLabel: "ROUTINE", color: "#0F6E56", bg: "#E1F5EE", text: "#04342C", border: "#5DCAA5", icon: "calendar-check", desc: "Schedule an appointment within a week" },
  { level: 3, label: "See Doctor Soon", shortLabel: "SOON", color: "#854F0B", bg: "#FAEEDA", text: "#412402", border: "#EF9F27", icon: "clock-hour-3", desc: "Medical attention needed within 24–48 hours" },
  { level: 4, label: "Urgent Care Today", shortLabel: "URGENT", color: "#993C1D", bg: "#FAECE7", text: "#4A1B0C", border: "#D85A30", icon: "building-hospital", desc: "Visit urgent care or ER today" },
  { level: 5, label: "EMERGENCY — 911", shortLabel: "911", color: "#A32D2D", bg: "#FCEBEB", text: "#501313", border: "#E24B4A", icon: "ambulance", desc: "Call emergency services immediately" },
];

const EXAMPLES = [
  { icon: "temperature-celsius", text: "Fever 39°C, severe headache, stiff neck for 2 days" },
  { icon: "heart", text: "Chest tightness on exertion, shortness of breath" },
  { icon: "file-analytics", text: "Please analyze my blood report (upload a PDF)" },
  { icon: "pill", text: "Taking metformin 500mg — are there side effects I should know?" },
  { icon: "stomach", text: "Sharp abdominal pain after meals for a week, bloating" },
  { icon: "brain", text: "Recurring migraines with visual aura, 3–4 times a month" },
];

function AnimatedGauge({ value, size = 130 }) {
  const [displayed, setDisplayed] = useState(0);
  const r = size * 0.4;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (displayed / 100) * circ;
  const color = displayed >= 80 ? "#1D9E75" : displayed >= 60 ? "#BA7517" : displayed >= 40 ? "#D85A30" : "#E24B4A";

  useEffect(() => {
    let frame;
    const start = displayed;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(start + (end - start) * ease));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  const label = displayed >= 80 ? "High Confidence" : displayed >= 60 ? "Moderate" : displayed >= 40 ? "Low Confidence" : "Uncertain";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-background-tertiary)" strokeWidth={size * 0.08} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.08}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: "stroke 0.4s" }}
          />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: size * 0.2, fontWeight: 500, fontFamily: "var(--font-mono)", color: "var(--color-text-primary)", lineHeight: 1 }}>{displayed}</span>
          <span style={{ fontSize: size * 0.08, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>/ 100</span>
        </div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>AI Confidence</div>
        <div style={{ fontSize: 11, color, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

function UrgencyMeter({ level }) {
  if (!level || level < 1) return null;
  const u = URGENCY_CONFIG[level - 1];
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Urgency Level</div>
      <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
        {URGENCY_CONFIG.map((item, i) => (
          <div key={i} style={{ flex: 1, height: 7, borderRadius: 4, background: i < level ? item.color : "var(--color-background-tertiary)", transition: `background 0.35s ${i * 0.07}s` }} />
        ))}
      </div>
      <div style={{ background: u.bg, borderRadius: "var(--border-radius-md)", padding: "10px 12px", border: `0.5px solid ${u.border}60` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <i className={`ti ti-${u.icon}`} style={{ fontSize: 15, color: u.color, flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontWeight: 500, fontSize: 13, color: u.text }}>{u.label}</span>
          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 500, background: u.color + "25", color: u.color, padding: "2px 7px", borderRadius: 10 }}>
            {level}/5
          </span>
        </div>
        <div style={{ fontSize: 12, color: u.text, opacity: 0.75, paddingLeft: 23 }}>{u.desc}</div>
      </div>
    </div>
  );
}

function ReportTable({ values }) {
  if (!values?.length) return null;
  const statusStyle = (s) => ({
    normal: { bg: "#EAF3DE", text: "#27500A" },
    low: { bg: "#FAEEDA", text: "#633806" },
    high: { bg: "#FAEEDA", text: "#633806" },
    critical: { bg: "#FCEBEB", text: "#501313" },
  }[s] || { bg: "var(--color-background-secondary)", text: "var(--color-text-secondary)" });

  return (
    <div style={{ marginTop: 12, borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
        <i className="ti ti-table" style={{ fontSize: 12, marginRight: 5 }} aria-hidden="true" />Report Values
      </div>
      <div style={{ border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", overflow: "hidden" }}>
        {values.map((rv, i) => {
          const st = statusStyle(rv.status);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderBottom: i < values.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", fontSize: 12, background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)" }}>
              <span style={{ flex: 1.5, color: "var(--color-text-primary)", fontWeight: 500 }}>{rv.parameter}</span>
              <span style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-text-primary)" }}>{rv.value}{rv.unit ? ` ${rv.unit}` : ""}</span>
              <span style={{ flex: 1.2, fontSize: 11, color: "var(--color-text-tertiary)" }}>{rv.normalRange}</span>
              <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500, background: st.bg, color: st.text, flexShrink: 0 }}>{rv.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DrPandaAI() {
  const [messages, setMessages] = useState([]);
  const [apiHistory, setApiHistory] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileBase64, setFileBase64] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [learnedFacts, setLearnedFacts] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [sessionStats, setSessionStats] = useState({ queries: 0, conditions: 0, maxUrgency: 0 });
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const buildSystemPrompt = useCallback((facts) => {
    const factsStr = facts.length > 0
      ? `\n\nKNOWN PATIENT FACTS (self-learned from prior conversation turns):\n${facts.map((f, i) => `${i + 1}. ${f}`).join("\n")}\nUse these facts to provide personalized, contextual analysis.`
      : "";

    return `You are Dr. Panda AI — a world-class, compassionate medical AI assistant trained on extensive clinical literature, real doctor-patient conversations, lab report interpretation protocols, diagnostic guidelines, and pharmacological references. You analyze symptoms, blood tests, urinalysis, lipid panels, liver function tests, thyroid panels, imaging descriptions, prescriptions, and any health-related information with exceptional precision.${factsStr}

CRITICAL: Respond ONLY with valid JSON. Zero text outside the JSON object. No markdown fences. No preamble. Pure JSON only.

Return this EXACT structure:
{
  "analysis": "<Rich, empathetic, educational response in 2-4 paragraphs. For reports: explain each abnormal value with clinical context, causes, and implications. For symptoms: discuss mechanisms, differentials, and what to watch for. Be warm, precise, and informative like a knowledgeable friend who happens to be a doctor.>",
  "confidence": <integer 0-100, reflect genuine uncertainty — don't always return 85+>,
  "urgencyLevel": <1=home rest|2=routine appointment|3=see doctor in 24-48h|4=urgent care today|5=call 911 NOW>,
  "urgencyAction": "<Specific, actionable instruction for what to do RIGHT NOW>",
  "keyFindings": ["<specific clinical finding>", "<another finding>"],
  "recommendations": ["<concrete, actionable step>", "<another step>"],
  "possibleConditions": ["<Condition Name — brief 1-sentence explanation of why it fits>"],
  "specialty": "<most relevant medical specialty e.g. Cardiology, Hematology, General Medicine>",
  "learnedFacts": ["<NEW fact about patient extracted from THIS message only, e.g. 'Patient is 34 years old', 'Diabetic on metformin', 'Has family history of hypertension'>"],
  "redFlags": ["<warning sign that should trigger immediate escalation>"],
  "reportValues": <null, or array of {parameter, value, unit, normalRange, status: "normal"|"low"|"high"|"critical", interpretation}>,
  "followUp": "<Single most important clarifying question that would help refine the analysis>",
  "disclaimer": "This analysis is AI-generated for educational purposes only. It does not constitute medical diagnosis or treatment advice. Always consult a licensed healthcare professional for medical decisions."
}

Clinical rules:
- urgencyLevel 5 ONLY for true life threats: STEMI symptoms, stroke (FAST), sepsis, anaphylaxis, uncontrolled bleeding, respiratory arrest, overdose, severe trauma
- urgencyLevel 4 for: suspected appendicitis, severe kidney pain, diabetic crisis, psychiatric emergency
- Never definitively diagnose — use "may suggest", "is consistent with", "could indicate"
- learnedFacts: only include genuinely new information not already in known facts
- For pediatric or geriatric context, adjust normal ranges and urgency thresholds appropriately
- If no symptoms or report provided, return urgencyLevel 1 and ask what they'd like help with
- confidence should reflect actual uncertainty: complex multi-symptom cases = 55-70, clear presentations = 75-88, report with clear values = 80-90`;
  }, []);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const ok = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!ok.includes(f.type)) { alert("Please upload a PDF or image (JPG/PNG/WEBP)."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileBase64(e.target.result.split(",")[1]);
      setFileType(f.type);
      setFile(f);
    };
    reader.readAsDataURL(f);
  }, []);

  const sendMessage = useCallback(async (overrideText) => {
    const text = (overrideText !== undefined ? overrideText : input).trim();
    if (!text && !file) return;

    const displayText = text || `Analyzing: ${file.name}`;
    const userMsg = { role: "user", text: displayText, fileName: file?.name, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let userContent;
    const capturedBase64 = fileBase64;
    const capturedType = fileType;
    const capturedFile = file;

    if (capturedBase64 && capturedType) {
      const isDoc = capturedType === "application/pdf";
      userContent = [
        { type: isDoc ? "document" : "image", source: { type: "base64", media_type: capturedType, data: capturedBase64 } },
        { type: "text", text: text || "Please perform a comprehensive analysis of this medical document/report. Identify all abnormal values, explain their clinical significance, and provide actionable recommendations." }
      ];
    } else {
      userContent = text;
    }

    setFile(null); setFileBase64(null); setFileType(null);

    const newHistory = [...apiHistory, { role: "user", content: userContent }];
    setApiHistory(newHistory);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          system: buildSystemPrompt(learnedFacts),
          messages: newHistory
        })
      });

      const data = await res.json();
      const raw = (data.content || []).map(c => c.text || "").join("");

      let parsed;
      try {
        const clean = raw.replace(/^```json\s*/,"").replace(/\s*```$/,"").trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = {
          analysis: raw || "I received your message but encountered a formatting issue. Please try again.",
          confidence: 65, urgencyLevel: 2,
          urgencyAction: "Please consult a healthcare provider for accurate evaluation.",
          keyFindings: [], recommendations: ["Consult a qualified doctor"],
          possibleConditions: [], specialty: "General Medicine",
          learnedFacts: [], redFlags: [], reportValues: null,
          followUp: "Could you describe your primary concern in more detail?",
          disclaimer: "This analysis is for educational purposes only."
        };
      }

      if (parsed.learnedFacts?.length) {
        setLearnedFacts(prev => {
          const combined = [...new Set([...prev, ...parsed.learnedFacts])];
          return combined.slice(0, 25);
        });
      }

      setAnalysis(parsed);
      setSessionStats(prev => ({
        queries: prev.queries + 1,
        conditions: prev.conditions + (parsed.possibleConditions?.length || 0),
        maxUrgency: Math.max(prev.maxUrgency, parsed.urgencyLevel || 0)
      }));

      const aiMsg = { role: "assistant", text: parsed.analysis, analysis: parsed, ts: Date.now() };
      setMessages(prev => [...prev, aiMsg]);
      setApiHistory(prev => [...prev, { role: "assistant", content: raw }]);

    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error — please check your internet and try again.", ts: Date.now(), isError: true }]);
    }

    setIsLoading(false);
  }, [input, file, fileBase64, fileType, apiHistory, learnedFacts, buildSystemPrompt]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 720, fontFamily: "var(--font-sans)", overflow: "hidden" }}>
      <h2 className="sr-only">Dr. Panda AI — Advanced Medical Intelligence Assistant</h2>

      {/* Header */}
      <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <i className="ti ti-stethoscope" style={{ fontSize: 18, color: "#0F6E56" }} aria-hidden="true" />
        </div>
        <div>
          <div style={{ fontWeight: 500, fontSize: 15, color: "var(--color-text-primary)", lineHeight: 1.2 }}>Dr. Panda AI</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Multi-Model Medical Intelligence · Self-Learning</div>
        </div>

        {sessionStats.queries > 0 && (
          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            {[
              { icon: "message-circle", val: sessionStats.queries, label: "queries" },
              { icon: "brain", val: learnedFacts.length, label: "facts learned" },
              { icon: "stethoscope", val: sessionStats.conditions, label: "conditions" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#1D9E75", fontFamily: "var(--font-mono)" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Chat Panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: "0.5px solid var(--color-border-tertiary)" }}>

          {/* Messages */}
          <div
            style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px", display: "flex", flexDirection: "column", gap: 14 }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            {dragOver && (
              <div style={{ position: "absolute", inset: 0, background: "#E1F5EE99", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, borderRadius: "var(--border-radius-lg)", border: "2px dashed #1D9E75", pointerEvents: "none" }}>
                <div style={{ textAlign: "center", color: "#0F6E56" }}>
                  <i className="ti ti-upload" style={{ fontSize: 32, display: "block", marginBottom: 8 }} aria-hidden="true" />
                  <div style={{ fontWeight: 500 }}>Drop your medical report here</div>
                </div>
              </div>
            )}

            {messages.length === 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: "20px 8px" }}>
                <div style={{ textAlign: "center", maxWidth: 340 }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <i className="ti ti-heart-rate-monitor" style={{ fontSize: 26, color: "#1D9E75" }} aria-hidden="true" />
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 17, color: "var(--color-text-primary)", marginBottom: 8 }}>Welcome to Dr. Panda AI</div>
                  <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
                    Describe your symptoms, upload a blood report or PDF, or ask any medical question. I'll analyze it with clinical precision and tell you exactly what to do next.
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: "100%" }}>
                  {EXAMPLES.map((ex, i) => (
                    <button key={i} onClick={() => sendMessage(ex.text)}
                      style={{ textAlign: "left", padding: "9px 11px", fontSize: 12, color: "var(--color-text-secondary)", cursor: "pointer", borderRadius: "var(--border-radius-md)", lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
                      <i className={`ti ti-${ex.icon}`} style={{ fontSize: 13, color: "#1D9E75", marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
                      <span>{ex.text}</span>
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--color-text-tertiary)", padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", width: "100%" }}>
                  <i className="ti ti-info-circle" style={{ fontSize: 13, flexShrink: 0 }} aria-hidden="true" />
                  Drag & drop a PDF blood report into this window, or use the upload button below.
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-start" }}>
                {msg.role === "assistant" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: msg.isError ? "#FCEBEB" : "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <i className={`ti ti-${msg.isError ? "alert-circle" : "stethoscope"}`} style={{ fontSize: 13, color: msg.isError ? "#A32D2D" : "#1D9E75" }} aria-hidden="true" />
                  </div>
                )}
                <div style={{ maxWidth: "80%" }}>
                  <div style={{
                    background: msg.role === "user" ? "#E1F5EE" : "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: msg.role === "user" ? "12px 3px 12px 12px" : "3px 12px 12px 12px",
                    padding: "10px 13px",
                  }}>
                    {msg.fileName && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, padding: "4px 8px", background: "#E1F5EE", borderRadius: "var(--border-radius-md)", fontSize: 11, color: "#0F6E56" }}>
                        <i className="ti ti-file-text" style={{ fontSize: 13 }} aria-hidden="true" />
                        <span style={{ fontWeight: 500 }}>{msg.fileName}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 13.5, color: msg.role === "user" ? "#085041" : "var(--color-text-primary)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
                      {msg.text}
                    </div>
                    {msg.analysis?.reportValues?.length > 0 && <ReportTable values={msg.analysis.reportValues} />}
                    {msg.analysis?.disclaimer && (
                      <div style={{ marginTop: 10, paddingTop: 8, borderTop: "0.5px solid var(--color-border-tertiary)", fontSize: 11, color: "var(--color-text-tertiary)", fontStyle: "italic" }}>
                        {msg.analysis.disclaimer}
                      </div>
                    )}
                  </div>
                  {msg.analysis?.followUp && (
                    <button onClick={() => setInput(msg.analysis.followUp)}
                      style={{ marginTop: 5, fontSize: 12, color: "#1D9E75", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "3px 0", background: "none", border: "none" }}>
                      <i className="ti ti-arrow-forward-up" style={{ fontSize: 12 }} aria-hidden="true" />
                      <span>{msg.analysis.followUp}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <i className="ti ti-stethoscope" style={{ fontSize: 13, color: "#1D9E75" }} aria-hidden="true" />
                </div>
                <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "3px 12px 12px 12px", padding: "11px 16px" }}>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 0.2, 0.4].map((delay, j) => (
                      <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "#1D9E75", animation: `drpulse 1.2s ease-in-out infinite`, animationDelay: `${delay}s` }} />
                    ))}
                    <span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 6 }}>Analyzing with multi-model AI...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input area */}
          <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "10px 14px", flexShrink: 0 }}>
            {file && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#E1F5EE", borderRadius: "var(--border-radius-md)", marginBottom: 8, fontSize: 12 }}>
                <i className="ti ti-file-text" style={{ fontSize: 14, color: "#0F6E56" }} aria-hidden="true" />
                <span style={{ flex: 1, color: "#0F6E56", fontWeight: 500 }}>{file.name}</span>
                <span style={{ color: "#0F6E56", opacity: 0.6 }}>{(file.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => { setFile(null); setFileBase64(null); setFileType(null); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#0F6E56" }} aria-label="Remove file">
                  <i className="ti ti-x" style={{ fontSize: 14 }} aria-hidden="true" />
                </button>
              </div>
            )}
            <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
              <input type="file" ref={fileInputRef} onChange={e => handleFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png,.webp" style={{ display: "none" }} aria-hidden="true" />
              <button onClick={() => fileInputRef.current?.click()}
                style={{ padding: "0 11px", height: 38, flexShrink: 0, borderRadius: "var(--border-radius-md)", cursor: "pointer", color: "#1D9E75", display: "flex", alignItems: "center" }}
                aria-label="Upload medical report (PDF or image)">
                <i className="ti ti-upload" style={{ fontSize: 16 }} aria-hidden="true" />
              </button>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Describe symptoms, ask a medical question, or upload a report..."
                rows={2}
                style={{ flex: 1, resize: "none", borderRadius: "var(--border-radius-md)", padding: "8px 11px", fontSize: 13, lineHeight: 1.6 }}
                aria-label="Medical question input"
              />
              <button onClick={() => sendMessage()} disabled={isLoading || (!input.trim() && !file)}
                style={{ padding: "0 14px", height: 38, flexShrink: 0, borderRadius: "var(--border-radius-md)", cursor: (isLoading || (!input.trim() && !file)) ? "not-allowed" : "pointer", color: "#1D9E75", opacity: (isLoading || (!input.trim() && !file)) ? 0.35 : 1, display: "flex", alignItems: "center" }}
                aria-label="Send message">
                <i className="ti ti-send" style={{ fontSize: 16 }} aria-hidden="true" />
              </button>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--color-text-tertiary)", marginTop: 5, textAlign: "center" }}>
              Not a substitute for professional medical advice · Always consult a licensed healthcare provider
            </div>
          </div>
        </div>

        {/* Analysis Panel */}
        <div style={{ width: 280, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 12, flexShrink: 0 }}>

          {!analysis ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, paddingTop: 60, textAlign: "center" }}>
              <i className="ti ti-chart-dots-3" style={{ fontSize: 38, color: "var(--color-text-tertiary)" }} aria-hidden="true" />
              <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", maxWidth: 180, lineHeight: 1.6 }}>
                Send your first message to see real-time AI analysis here
              </div>
            </div>
          ) : (
            <>
              {/* Gauges */}
              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "14px 12px", display: "flex", justifyContent: "center" }}>
                <AnimatedGauge value={analysis.confidence || 0} size={130} />
              </div>

              <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "14px 12px" }}>
                <UrgencyMeter level={analysis.urgencyLevel} />
                {analysis.urgencyAction && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5, paddingLeft: 4 }}>
                    <i className="ti ti-arrow-right" style={{ fontSize: 11, marginRight: 4, color: "#1D9E75" }} aria-hidden="true" />
                    {analysis.urgencyAction}
                  </div>
                )}
              </div>

              {/* Specialty badge */}
              {analysis.specialty && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", fontSize: 12 }}>
                  <i className="ti ti-building-hospital" style={{ fontSize: 14, color: "#1D9E75" }} aria-hidden="true" />
                  <span style={{ color: "var(--color-text-secondary)" }}>Specialty:</span>
                  <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{analysis.specialty}</span>
                </div>
              )}

              {/* Key Findings */}
              {analysis.keyFindings?.length > 0 && (
                <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="ti ti-clipboard-list" style={{ fontSize: 12 }} aria-hidden="true" />Key Findings
                  </div>
                  {analysis.keyFindings.map((f, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#1D9E75", marginTop: 6, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: "var(--color-text-primary)", lineHeight: 1.55 }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Possible Conditions */}
              {analysis.possibleConditions?.length > 0 && (
                <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="ti ti-virus-search" style={{ fontSize: 12 }} aria-hidden="true" />Possible Conditions
                  </div>
                  {analysis.possibleConditions.map((c, i) => (
                    <div key={i} style={{ fontSize: 12.5, color: "var(--color-text-primary)", padding: "5px 8px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-md)", marginBottom: 5, lineHeight: 1.5 }}>
                      {c}
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations?.length > 0 && (
                <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="ti ti-checklist" style={{ fontSize: 12 }} aria-hidden="true" />Recommendations
                  </div>
                  {analysis.recommendations.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
                      <i className="ti ti-circle-check" style={{ fontSize: 13, color: "#1D9E75", marginTop: 1, flexShrink: 0 }} aria-hidden="true" />
                      <span style={{ fontSize: 12.5, color: "var(--color-text-primary)", lineHeight: 1.55 }}>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Red Flags */}
              {analysis.redFlags?.length > 0 && (
                <div style={{ background: "#FCEBEB", border: "0.5px solid #E24B4A40", borderRadius: "var(--border-radius-lg)", padding: "12px 14px" }}>
                  <div style={{ fontSize: 10.5, fontWeight: 500, color: "#791F1F", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                    <i className="ti ti-alert-triangle" style={{ fontSize: 12 }} aria-hidden="true" />Red Flags — Escalate If Seen
                  </div>
                  {analysis.redFlags.map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 7, marginBottom: 5, alignItems: "flex-start" }}>
                      <i className="ti ti-alert-circle" style={{ fontSize: 12, color: "#E24B4A", marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                      <span style={{ fontSize: 12, color: "#791F1F", lineHeight: 1.5 }}>{r}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Self-Learned Patient Memory */}
          {learnedFacts.length > 0 && (
            <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "12px 14px" }}>
              <div style={{ fontSize: 10.5, fontWeight: 500, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 9, display: "flex", alignItems: "center", gap: 5 }}>
                <i className="ti ti-brain" style={{ fontSize: 12, color: "#1D9E75" }} aria-hidden="true" />Patient Memory
                <span style={{ marginLeft: "auto", fontSize: 10, background: "#E1F5EE", color: "#0F6E56", padding: "1px 6px", borderRadius: 8 }}>Self-learned</span>
              </div>
              {learnedFacts.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 7, padding: "4px 0", borderBottom: i < learnedFacts.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none", alignItems: "flex-start" }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1D9E75", marginTop: 7, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
              <button onClick={() => { setLearnedFacts([]); setApiHistory([]); }}
                style={{ marginTop: 10, fontSize: 11, color: "var(--color-text-tertiary)", cursor: "pointer", background: "none", border: "none", padding: 0, display: "flex", alignItems: "center", gap: 4 }}>
                <i className="ti ti-refresh" style={{ fontSize: 11 }} aria-hidden="true" />Clear memory & start fresh
              </button>
            </div>
          )}

          {/* Session summary */}
          {sessionStats.maxUrgency >= 4 && (
            <div style={{ background: "#FAEEDA", border: "0.5px solid #EF9F2760", borderRadius: "var(--border-radius-lg)", padding: "10px 12px", fontSize: 12, color: "#633806" }}>
              <i className="ti ti-info-circle" style={{ fontSize: 13, marginRight: 6 }} aria-hidden="true" />
              High urgency detected in this session. Please seek medical attention as recommended.
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes drpulse {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1); }
        }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
      `}</style>
    </div>
  );
}
