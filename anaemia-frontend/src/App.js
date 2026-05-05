import { useState, useRef, useEffect } from "react";
import axios from "axios";

// ── Circular Progress Ring ──────────────────────────────────────────────────
function RingProgress({ label, value, color, delay = 0 }) {
  const [displayed, setDisplayed] = useState(0);
  const radius = 70;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const pct = Math.round((value ?? 0) * 100);
  const offset = circumference - (displayed / 100) * circumference;

  useEffect(() => {
    let start = null;
    const duration = 1400;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(pct * ease));
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), delay);
    return () => clearTimeout(timer);
  }, [pct, delay]);

  const risk = pct >= 70 ? "High" : pct >= 40 ? "Moderate" : "Low";
  const riskColor = pct >= 70 ? "#ff4d4d" : pct >= 40 ? "#f5a623" : "#4ade80";

  return (
    <div className="ring-card">
      <div className="ring-label-top">{label}</div>
      <svg height={radius * 2} width={radius * 2} className="ring-svg">
        <circle
          stroke="rgba(255,255,255,0.06)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke-dashoffset 0.05s linear",
            filter: `drop-shadow(0 0 8px ${color}88)`,
          }}
        />
        <text
          x={radius}
          y={radius - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize="22"
          fontWeight="700"
          fontFamily="'DM Mono', monospace"
        >
          {displayed}%
        </text>
        <text
          x={radius}
          y={radius + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={riskColor}
          fontSize="10"
          fontWeight="600"
          fontFamily="'DM Sans', sans-serif"
          letterSpacing="2"
        >
          {risk.toUpperCase()} RISK
        </text>
      </svg>
    </div>
  );
}

// ── Upload Zone ─────────────────────────────────────────────────────────────
function UploadZone({ label, icon, file, onChange }) {
  const inputRef = useRef();
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div
      className={`upload-zone ${file ? "has-file" : ""}`}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => onChange(e.target.files[0])}
      />
      {preview ? (
        <>
          <img src={preview} alt={label} className="upload-preview" />
          <div className="upload-overlay">
            <span className="upload-check">✓</span>
            <span className="upload-reupload">Click to replace</span>
          </div>
        </>
      ) : (
        <>
          <div className="upload-icon">{icon}</div>
          <div className="upload-title">{label}</div>
          <div className="upload-hint">Click or drag image here</div>
        </>
      )}
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [conj, setConj] = useState(null);
  const [palm, setPalm] = useState(null);
  const [nails, setNails] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const resultRef = useRef();

  const handleSubmit = async () => {
    if (!conj || !palm || !nails) {
      alert("Please upload all 3 images.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("conjunctiva", conj);
    formData.append("palm", palm);
    formData.append("nails", nails);
    try {
      const res = await axios.post("https://anaemia-detection-1.onrender.com", formData);
      setResult(res.data);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Prediction failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const isAnaemic =
    result?.final_decision?.toLowerCase().includes("anaem") ||
    result?.final_decision?.toLowerCase().includes("anemi");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0d0d0e;
          --surface: #141416;
          --border: rgba(255,255,255,0.07);
          --text: #f0ede8;
          --muted: rgba(240,237,232,0.45);
          --accent: #c8f04b;
          --accent-dim: rgba(200,240,75,0.12);
          --ring-conj: #a78bfa;
          --ring-palm: #38bdf8;
          --ring-nails: #fb923c;
        }

        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .hero-grain {
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 0; opacity: 0.5;
        }

        .hero-glow {
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.18) 0%, transparent 70%);
          top: -100px; right: -100px;
          pointer-events: none; z-index: 0;
        }
        .hero-glow-2 {
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,240,75,0.08) 0%, transparent 70%);
          bottom: 60px; left: 80px;
          pointer-events: none; z-index: 0;
        }

        /* NAV */
        nav {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 48px;
          border-bottom: 1px solid var(--border);
        }
        .nav-logo {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 4px; color: var(--text);
        }
        .nav-links {
          display: flex; gap: 32px; list-style: none;
        }
        .nav-links a {
          font-size: 13px; letter-spacing: 1px; color: var(--muted);
          text-decoration: none; text-transform: uppercase;
          transition: color .2s;
        }
        .nav-links a:hover { color: var(--text); }
        .nav-menu {
          font-size: 12px; letter-spacing: 3px; color: var(--muted);
          text-transform: uppercase; cursor: pointer;
        }

        /* HERO CONTENT */
        .hero-body {
          position: relative; z-index: 5;
          flex: 1; display: flex; flex-direction: column;
          justify-content: flex-end;
          padding: 0 48px 52px;
        }
        .hero-orb {
          position: absolute;
          right: 5%; top: 50%;
          transform: translateY(-52%);
          width: min(520px, 48vw);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(ellipse at 40% 30%,
            rgba(167,139,250,0.55) 0%,
            rgba(56,189,248,0.35) 35%,
            rgba(251,146,60,0.25) 60%,
            transparent 80%);
          filter: blur(1px);
          animation: orbFloat 8s ease-in-out infinite;
        }
        .hero-orb::after {
          content: '';
          position: absolute; inset: 10%;
          border-radius: 50%;
          background: radial-gradient(ellipse at 60% 60%,
            rgba(74,222,128,0.3) 0%,
            rgba(167,139,250,0.2) 40%,
            transparent 70%);
          animation: orbFloat 12s ease-in-out infinite reverse;
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(-52%) scale(1); }
          50% { transform: translateY(-55%) scale(1.04); }
        }

        .hero-tag {
          font-size: 11px; letter-spacing: 3px; text-transform: uppercase;
          color: var(--accent); margin-bottom: 20px;
          font-family: 'DM Mono', monospace;
        }
        .hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 9vw, 130px);
          line-height: 0.92;
          letter-spacing: 1px;
          color: var(--text);
          max-width: 680px;
        }
        .hero-sub {
          font-size: 14px; color: var(--muted); line-height: 1.7;
          max-width: 340px; margin-top: 24px; margin-bottom: 40px;
        }
        .hero-bottom {
          display: flex; align-items: center; gap: 32px;
        }
        .btn-get-started {
          display: flex; align-items: center; gap: 10px;
          background: var(--accent); color: #0d0d0e;
          font-family: 'DM Mono', monospace;
          font-size: 12px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase;
          padding: 16px 32px;
          border: none; cursor: pointer;
          transition: all .25s;
        }
        .btn-get-started:hover {
          background: #d4f55e;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(200,240,75,0.3);
        }
        .btn-arrow { font-size: 18px; }
        .hero-footnote {
          font-size: 11px; color: var(--muted); letter-spacing: 0.5px;
          max-width: 280px; line-height: 1.6;
        }

        /* crosshair decoration */
        .crosshair {
          position: absolute; z-index: 6;
          color: rgba(255,255,255,0.2); font-size: 20px;
          font-weight: 100; line-height: 1;
          top: 52px; right: 48px;
        }

        /* ── UPLOAD SECTION ── */
        .upload-section {
          background: var(--surface);
          border-top: 1px solid var(--border);
          padding: 80px 48px;
          animation: fadeUp 0.5s ease forwards;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .section-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: var(--accent); margin-bottom: 12px;
        }
        .section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(36px, 5vw, 60px);
          line-height: 1; letter-spacing: 1px;
          color: var(--text); margin-bottom: 48px;
        }

        .upload-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .upload-zone {
          position: relative;
          aspect-ratio: 1;
          border: 1px solid var(--border);
          background: rgba(255,255,255,0.02);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          cursor: pointer; overflow: hidden;
          transition: border-color .2s, background .2s;
        }
        .upload-zone:hover {
          border-color: rgba(200,240,75,0.4);
          background: var(--accent-dim);
        }
        .upload-zone.has-file {
          border-color: var(--accent);
        }
        .upload-preview {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; filter: brightness(0.7);
        }
        .upload-overlay {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; gap: 8px;
        }
        .upload-check {
          font-size: 32px; color: var(--accent);
          filter: drop-shadow(0 0 12px rgba(200,240,75,0.8));
        }
        .upload-reupload {
          font-size: 11px; color: rgba(255,255,255,0.6);
          letter-spacing: 1px;
        }
        .upload-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.5; }
        .upload-title {
          font-size: 13px; font-weight: 600; letter-spacing: 1px;
          text-transform: uppercase; color: var(--text);
        }
        .upload-hint {
          font-size: 11px; color: var(--muted); margin-top: 4px;
        }

        .btn-predict {
          display: flex; align-items: center; gap: 12px;
          background: transparent;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: 'DM Mono', monospace;
          font-size: 12px; font-weight: 600; letter-spacing: 2px;
          text-transform: uppercase;
          padding: 18px 44px;
          cursor: pointer; transition: all .25s;
        }
        .btn-predict:hover:not(:disabled) {
          background: var(--accent); color: #0d0d0e;
          box-shadow: 0 8px 32px rgba(200,240,75,0.25);
        }
        .btn-predict:disabled { opacity: 0.4; cursor: not-allowed; }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── RESULT SECTION ── */
        .result-section {
          padding: 80px 48px 120px;
          background: var(--bg);
          border-top: 1px solid var(--border);
          animation: fadeUp 0.6s ease forwards;
        }

        .rings-row {
          display: flex;
          gap: 40px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 48px;
        }

        .ring-card {
          display: flex; flex-direction: column;
          align-items: center; gap: 12px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          padding: 32px 28px;
          min-width: 180px;
          transition: border-color .2s;
        }
        .ring-card:hover { border-color: rgba(255,255,255,0.15); }
        .ring-label-top {
          font-size: 10px; letter-spacing: 3px; text-transform: uppercase;
          color: var(--muted); font-family: 'DM Mono', monospace;
        }
        .ring-svg { overflow: visible; }

        /* final verdict */
        .verdict-wrapper {
          margin-top: 60px;
          display: flex; flex-direction: column;
          align-items: center; gap: 16px;
        }
        .verdict-divider {
          width: 60px; height: 1px;
          background: linear-gradient(to right, transparent, var(--border), transparent);
        }
        .verdict-label {
          font-size: 10px; letter-spacing: 4px; text-transform: uppercase;
          color: var(--muted); font-family: 'DM Mono', monospace;
        }
        .verdict-badge {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(40px, 6vw, 80px);
          letter-spacing: 4px;
          line-height: 1;
        }
        .verdict-badge.anaemic { color: #ff4d4d; text-shadow: 0 0 40px rgba(255,77,77,0.4); }
        .verdict-badge.non-anaemic { color: var(--accent); text-shadow: 0 0 40px rgba(200,240,75,0.35); }
        .verdict-score {
          font-family: 'DM Mono', monospace;
          font-size: 12px; color: var(--muted);
        }

        @media (max-width: 768px) {
          nav { padding: 20px 24px; }
          .nav-links { display: none; }
          .hero-body { padding: 0 24px 40px; }
          .hero-orb { display: none; }
          .upload-section, .result-section { padding: 48px 24px; }
          .upload-grid { grid-template-columns: 1fr; }
          .rings-row { flex-direction: column; align-items: center; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-grain" />
        <div className="hero-glow" />
        <div className="hero-glow-2" />

        <nav>
          <div className="nav-logo">HAEMOSCAN</div>
          <ul className="nav-links">
            <li><a href="#">Home</a></li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Research</a></li>
          </ul>
          <div className="nav-menu">⋮⋮ Menu</div>
        </nav>

        <div className="crosshair">+</div>

        <div className="hero-orb" />

        <div className="hero-body">
          <div className="hero-tag">AI-Powered Clinical Screening</div>
          <h1 className="hero-title">
            Detect<br />Anaemia.<br />Instantly.
          </h1>
          <p className="hero-sub">
            Upload images of conjunctiva, palm, and nails for non-invasive,
            AI-driven anaemia risk prediction in seconds.
          </p>
          <div className="hero-bottom">
            <button
              className="btn-get-started"
              onClick={() => {
                setShowUpload(true);
                setTimeout(() => {
                  document.getElementById("upload-anchor")?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
            >
              Get Started <span className="btn-arrow">↗</span>
            </button>
            <p className="hero-footnote">
              AI platform for anaemia screening via conjunctiva, palm, and nail image analysis.
            </p>
          </div>
        </div>
      </section>

      {/* ── UPLOAD SECTION ── */}
      {showUpload && (
        <section className="upload-section" id="upload-anchor">
          <div className="section-eyebrow">Step 01 — Image Input</div>
          <h2 className="section-title">Upload Your<br />Three Images</h2>

          <div className="upload-grid">
            <UploadZone
              label="Conjunctiva"
              icon="👁"
              file={conj}
              onChange={setConj}
            />
            <UploadZone
              label="Palm"
              icon="🖐"
              file={palm}
              onChange={setPalm}
            />
            <UploadZone
              label="Fingernails"
              icon="💅"
              file={nails}
              onChange={setNails}
            />
          </div>

          <button
            className="btn-predict"
            onClick={handleSubmit}
            disabled={loading || !conj || !palm || !nails}
          >
            {loading ? (
              <><span className="spinner" /> Analysing…</>
            ) : (
              <>Run Prediction ↗</>
            )}
          </button>
        </section>
      )}

      {/* ── RESULT SECTION ── */}
      {result && (
        <section className="result-section" ref={resultRef}>
          <div className="section-eyebrow">Step 02 — Risk Assessment</div>
          <h2 className="section-title">Individual<br />Risk Scores</h2>

          <div className="rings-row">
            <RingProgress
              label="Conjunctiva"
              value={result.conjunctiva_probability}
              color="var(--ring-conj)"
              delay={0}
            />
            <RingProgress
              label="Palm"
              value={result.palm_probability}
              color="var(--ring-palm)"
              delay={200}
            />
            <RingProgress
              label="Fingernails"
              value={result.nails_probability}
              color="var(--ring-nails)"
              delay={400}
            />
          </div>

          <div className="verdict-wrapper">
            <div className="verdict-divider" />
            <div className="verdict-label">Final Diagnosis</div>
            <div className={`verdict-badge ${isAnaemic ? "anaemic" : "non-anaemic"}`}>
              {result.final_decision || (isAnaemic ? "Anaemic" : "Non-Anaemic")}
            </div>
            {result.risk_score !== undefined && (
              <div className="verdict-score">
                Overall Risk Score: {Math.round(result.risk_score * 100)}%
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
