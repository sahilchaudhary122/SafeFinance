const http = require("http");

const PORT = 3001;

const students = {
  SF001: {
    student_id: "SF001",
    name: "Rahul",
    income: 30000,
    expenses: 18000,
    savings: 12000,
    loan_amount: 50000,
    loan_tenure: 24
  },
  SF002: {
    student_id: "SF002",
    name: "Priya",
    income: 45000,
    expenses: 20000,
    savings: 25000,
    loan_amount: 80000,
    loan_tenure: 36
  },
  SF003: {
    student_id: "SF003",
    name: "Arjun",
    income: 25000,
    expenses: 22000,
    savings: 3000,
    loan_amount: 100000,
    loan_tenure: 24
  },
  SF004: {
    student_id: "SF004",
    name: "Ananya",
    income: 60000,
    expenses: 25000,
    savings: 35000,
    loan_amount: 70000,
    loan_tenure: 36
  },
  SF005: {
    student_id: "SF005",
    name: "Vikram",
    income: 28000,
    expenses: 25000,
    savings: 2000,
    loan_amount: 120000,
    loan_tenure: 24
  }
};

function calculateRisk(student) {
  const expenseRatio = student.expenses / student.income;
  const savingsRate = student.savings / student.income;
  const loanBurden = student.loan_amount / student.income;

  let score = 20;

  if (expenseRatio > 0.8) score += 30;
  else if (expenseRatio > 0.65) score += 15;

  if (savingsRate < 0.1) score += 25;
  else if (savingsRate < 0.2) score += 12;

  if (loanBurden > 4) score += 25;
  else if (loanBurden > 2.5) score += 12;

  score = Math.max(0, Math.min(100, Math.round(score)));

  let risk_level = "LOW";

  if (score >= 60) risk_level = "HIGH";
  else if (score >= 35) risk_level = "MEDIUM";

  return {
    student_id: student.student_id,
    risk_level,
    risk_score: score,
    summary:
      risk_level === "LOW"
        ? `${student.name} has a relatively healthy financial profile with manageable expenses and positive savings.`
        : risk_level === "MEDIUM"
        ? `${student.name} shows moderate financial pressure and should monitor spending and debt.`
        : `${student.name} shows higher financial pressure and should carefully manage expenses and borrowing.`,
    insights: [
      `Expense ratio: ${Math.round(expenseRatio * 100)}% of monthly income.`,
      `Savings rate: ${Math.round(savingsRate * 100)}% of monthly income.`,
      `Loan amount: ₹${student.loan_amount.toLocaleString("en-IN")}.`
    ],
    recommendation:
      risk_level === "LOW"
        ? "Continue maintaining healthy savings and make loan repayments consistently."
        : risk_level === "MEDIUM"
        ? "Reduce unnecessary expenses, increase savings and maintain disciplined repayments."
        : "Prioritize essential expenses, build savings and avoid unnecessary additional borrowing."
  };
}

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200);
    res.end(JSON.stringify({
      service: "SafeFinance Backend",
      status: "running"
    }));
    return;
  }

  if (req.method === "POST" && req.url === "/api/evaluate") {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const input = JSON.parse(body);

        const studentId = String(input.student_id || "SF001")
          .trim()
          .toUpperCase();

        const student = students[studentId];

        if (!student) {
          res.writeHead(404);
          res.end(JSON.stringify({
            error: "Student not found",
            available_students: Object.keys(students)
          }));
          return;
        }

        const result = calculateRisk(student);

        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({
          error: "Invalid JSON request"
        }));
      }
    });

    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({
    error: "Route not found"
  }));
});

server.listen(PORT, () => {
  console.log(`SafeFinance backend running on http://localhost:${PORT}`);
});
