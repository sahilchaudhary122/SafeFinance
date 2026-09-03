# SafeFinance Backend

SafeFinance uses n8n Cloud as its backend automation layer.

## Backend Flow

React Frontend → n8n Cloud Webhook → Google Sheets → Google Gemini → Risk Assessment → React Frontend

## Webhook

POST https://safefinance.app.n8n.cloud/webhook/evaluate

## Technologies

- n8n Cloud
- Google Sheets
- Google Gemini
- React

## Security

API keys and OAuth credentials are stored in n8n and are not committed to GitHub.
