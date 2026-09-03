# SafeFinance Backend

SafeFinance uses a backend risk-assessment engine for the hackathon prototype.

## Architecture

React Frontend
→ Backend API
→ Financial Risk Engine
→ Risk Score + Insights + Recommendation

The complete AI workflow uses:

React → n8n Cloud → Google Sheets → Google Gemini

## API

### POST /api/evaluate

Example request:

```json
{
  "student_id": "SF001"
}