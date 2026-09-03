import { useState } from "react";
import "./App.css";

const API_URL =
  "https://safefinance.app.n8n.cloud/webhook/evaluate";

export default function App() {
  const [studentId, setStudentId] = useState("SF001");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: studentId,
          income: 30000,
          expenses: 18000,
          savings: 12000,
          loan_amount: 50000,
          loan_tenure: 24,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();

      const assessment =
        typeof data.text === "string"
          ? JSON.parse(data.text)
          : data;

      setResult(assessment);
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the SafeFinance AI service."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">🛡️ SafeFinance</div>
        <div>AI Financial Risk Assessment</div>
      </nav>

      <main>
        <section className="hero">
          <div className="tag">STUDENT FINANCE • AI POWERED</div>

          <h1>
            Make smarter
            <br />
            financial decisions.
          </h1>

          <p>
            SafeFinance analyzes student income, expenses,
            savings and loans to provide an easy-to-understand
            financial risk assessment.
          </p>
        </section>

        <div className="dashboard">
          <section className="card">
            <h2>Student Assessment</h2>
            <p className="muted">
              Enter a student ID to run the AI assessment.
            </p>

            <label>Student ID</label>

            <input
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="SF001"
            />

            <div className="demo">
              <strong>Demo financial profile</strong>

              <div>Monthly Income — ₹30,000</div>
              <div>Monthly Expenses — ₹18,000</div>
              <div>Monthly Savings — ₹12,000</div>
              <div>Loan Amount — ₹50,000</div>
              <div>Loan Tenure — 24 months</div>
            </div>

            <button onClick={analyze} disabled={loading}>
              {loading
                ? "Analyzing..."
                : "Analyze Financial Risk →"}
            </button>
          </section>

          <section className="card result-card">
            {!result && !loading && !error && (
              <div className="empty">
                <div className="icon">🛡️</div>
                <h2>Assessment Result</h2>
                <p>
                  Your AI-powered financial assessment
                  will appear here.
                </p>
              </div>
            )}

            {loading && (
              <div className="empty">
                <div className="loading">⟳</div>
                <h2>Analyzing financial profile...</h2>
                <p>
                  SafeFinance is processing the assessment.
                </p>
              </div>
            )}

            {error && (
              <div className="error">
                <h2>Connection Error</h2>
                <p>{error}</p>
              </div>
            )}

            {result && (
              <>
                <div className="result-header">
                  <div>
                    <small>STUDENT</small>
                    <h2>{result.student_id}</h2>
                  </div>

                  <span
                    className={`risk ${result.risk_level?.toLowerCase()}`}
                  >
                    {result.risk_level} RISK
                  </span>
                </div>

                <div
                  className={`score ${result.risk_level?.toLowerCase()}`}
                >
                  <strong>{result.risk_score}</strong>
                  <span>/100</span>
                  <p>Financial Risk Score</p>
                </div>

                <div className="section">
                  <h3>Summary</h3>
                  <p>{result.summary}</p>
                </div>

                <div className="section">
                  <h3>Key Insights</h3>

                  {result.insights?.map((insight, index) => (
                    <div className="insight" key={index}>
                      <span>{index + 1}</span>
                      <p>{insight}</p>
                    </div>
                  ))}
                </div>

                <div className="recommendation">
                  <h3>💡 Recommendation</h3>
                  <p>{result.recommendation}</p>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <footer>
        SafeFinance • Educational financial-risk assessment
      </footer>
    </div>
  );
}