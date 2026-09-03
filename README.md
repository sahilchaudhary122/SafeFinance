# SafeFinance

SafeFinance is a local demo UPI app for testing balances, payment history, delayed person-to-person settlement, and transaction-freeze requests. It does not move real money or use an external API.

## Run locally

```bash
npm install
npm run dev
```

Build the production bundle with `npm run build`.

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Sender | `sahilchaudhary` | `sahil1122` |
| Receiver | `tilak` | `tilak1122` |

The demo UPI PIN is `2580`.

## Test flow

1. Sign in as `sahilchaudhary`, then enter any valid UPI ID/mobile number or use **Scan & pay** to fetch payee information from a UPI QR code.
2. The sender balance is deducted immediately and the transaction receives a stored ID.
3. For a payment to Tilak, sign out and sign in as `tilak`. The received transaction is marked successful while the balance remains pending for 10 minutes.
4. After settlement, Tilak's balance and history reflect the credit. The sender can request a freeze only from an outgoing person-to-person transaction in history.

For payments up to Rs. 50,000, choose either UPI PIN or face/fingerprint approval. Payments above Rs. 50,000 require both. After more than three person-to-person payments to the same payee, the local database labels the contact as **Family / frequent contact**; one to three payments are labeled **Known contact**. Light/dark themes and English, Hindi, and Tamil are available from the header.

## Configuration

[.env](.env) holds non-secret local-demo configuration: app name, settlement delay, high-value MFA threshold, and demo UPI PIN. Transaction/account data is stored in browser `localStorage` under `safefinance_local_db_v1`; clearing that key resets the demo data.
