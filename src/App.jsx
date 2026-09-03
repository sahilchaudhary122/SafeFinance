import { useState } from "react";
import "./App.css";

const API_URL =
  "https://safefinance.app.n8n.cloud/webhook/evaluate";

// Demo student profiles
const students = {
  SF001: {
    income: 30000,
    expenses: 18000,
    savings: 12000,
    loan_amount: 50000,
    loan_tenure: 24,
  },
  SF002: {
    income: 45000,
    expenses: 20000,
    savings: 25000,
    loan_amount: 80000,
    loan_tenure: 36,
  },
  SF003: {
    income: 25000,
    expenses: 22000,
    savings: 3000,
    loan_amount: 100000,
    loan_tenure: 24,
  },
  SF004: {
    income: 60000,
    expenses: 25000,
    savings: 35000,
    loan_amount: 70000,
    loan_tenure: 36,
  },
  SF005: {
    income: 28000,
    expenses: 25000,
    savings: 2000,
    loan_amount: 120000,
    loan_tenure: 24,
  },
};

function App() {
  const [studentId, setStudentId] = useState("SF001");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const normalizedId = studentId.trim().toUpperCase();

      // Use demo profile if the ID exists, otherwise use SF001
      const profile = students[normalizedId] || students.SF001;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: normalizedId || "SF001",
          ...profile,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // n8n/Gemini currently returns the AI JSON inside "text"
      let assessment;

      if (typeof data.text === "string") {
        assessment = JSON.parse(data.text);
      } else {
        assessment = data;
      }

      setResult(assessment);
    } catch (err) {
      console.error("SafeFinance error:", err);

      setError(
        "Unable to generate the assessment. Please check the n8n connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      analyze();
    }
  }

  const riskLevel =
    result?.risk_level?.toLowerCase() || "";

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="brand">🛡️ SafeFinance</div>

        <div className="nav-subtitle">
          AI Financial Risk Assessment
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="tag">
            STUDENT FINANCE • AI POWERED
          </div>

          <h1>
            Make smarter
            <br />
            <span>financial decisions.</span>
          </h1>

          <p>
            SafeFinance analyzes student income, expenses,
            savings and loans to provide an easy-to-understand
            financial risk assessment using AI.
          </p>
        </section>

        {/* Main Dashboard */}
        <div className="dashboard">
          {/* Input Panel */}
          <section className="card">
            <h2>Student Assessment</h2>

            <p className="muted">
              Enter a student ID to run the AI assessment.
            </p>

            <label htmlFor="studentId">
              Student ID
            </label>

            <input
              id="studentId"
              type="text"
              value={studentId}
              onChange={(e) =>
                setStudentId(e.target.value)
              }
              onKeyDown={handleKeyDown}
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

            <button
              onClick={analyze}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Financial Risk →"}
            </button>

            <div className="student-hint">
              Demo IDs: SF001 • SF002 • SF003 • SF004 • SF005
            </div>
          </section>

          {/* Result Panel */}
          <section className="card result-card">
            {/* Empty State */}
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

            {/* Loading */}
            {loading && (
              <div className="empty">
                <div className="loading">⟳</div>

                <h2>
                  Analyzing financial profile...
                </h2>

                <p>
                  SafeFinance is processing the
                  financial assessment.
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="error">
                <div className="error-icon">
                  ⚠️
                </div>

                <h2>Connection Error</h2>

                <p>{error}</p>

                <button
                  onClick={analyze}
                  className="retry-btn"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <>
                {/* Result Header */}
                <div className="result-header">
                  <div>
                    <small>STUDENT</small>
                    <h2>
                      {result.student_id || studentId}
                    </h2>
                  </div>

                  <span
                    className={`risk ${riskLevel}`}
                  >
                    {result.risk_level || "UNKNOWN"} RISK
                  </span>
                </div>

                {/* Risk Score */}
                <div
                  className={`score ${riskLevel}`}
                >
                  <strong>
                    {result.risk_score ?? "--"}
                  </strong>

                  <span>/100</span>

                  <p>Financial Risk Score</p>
                </div>

                {/* Summary */}
                <div className="section">
                  <h3>Summary</h3>

                  <p>
                    {result.summary ||
                      "No summary available."}
                  </p>
                </div>

                {/* Insights */}
                <div className="section">
                  <h3>Key Insights</h3>

                  {Array.isArray(result.insights) &&
                  result.insights.length > 0 ? (
                    result.insights.map(
                      (insight, index) => (
                        <div
                          className="insight"
                          key={index}
                        >
                          <span>{index + 1}</span>

                          <p>{insight}</p>
                        </div>
                      )
                    )
                  ) : (
                    <p>
                      No additional insights
                      available.
                    </p>
                  )}
                </div>

                {/* Recommendation */}
                <div className="recommendation">
                  <h3>
                    💡 Recommendation
                  </h3>

                  <p>
                    {result.recommendation ||
                      "Maintain responsible spending and savings habits."}
                  </p>
                </div>

                {/* Disclaimer */}
                <div className="disclaimer">
                  Educational assessment only.
                  This result is not professional
                  financial advice.
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <footer>
        SafeFinance • Educational AI-powered financial
        risk assessment
      </footer>
    </div>
  );
}

export default App;