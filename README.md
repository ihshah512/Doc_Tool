# 🛠️ DocTools

A full-stack web application for document and image conversion with Stripe payments.

## Features

| Feature | Price |
|---|---|
| PDF → Word | 1st page free, $1/page after |
| Word → PDF | 1st page free, $1/page after |
| PDF Merge | $1 per 5 pages |
| Image Resize | $1 per file |

## Tech Stack

- **Frontend:** React, Stripe.js, react-dropzone
- **Backend:** Node.js, Express, LibreOffice, pdf-lib, sharp, Stripe

---

## Prerequisites

- Node.js 18+
- LibreOffice (for PDF/Word conversion)
- A Stripe account (free at stripe.com)

### Install LibreOffice on Mac

1. Download from https://www.libreoffice.org/download/download-libreoffice/
2. Open the `.dmg` → drag LibreOffice to Applications
3. Right-click LibreOffice in Applications → Open (to bypass Gatekeeper)

---

## Setup

### 1. Run the setup script

```bash
chmod +x setup.sh
./setup.sh
```

This installs all npm dependencies in both `backend/` and `frontend/`.

### 2. Configure Stripe keys

**backend/.env**
```
PORT=5000
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
FRONTEND_URL=http://localhost:3000
LIBREOFFICE_PATH=/Applications/LibreOffice.app/Contents/MacOS/soffice
```

**frontend/.env**
```
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
REACT_APP_API_URL=http://localhost:5000
```

Get your Stripe keys from: https://dashboard.stripe.com/apikeys

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend (new terminal)

```bash
cd frontend
npm start
```

Open http://localhost:3000 in your browser.

---

## Stripe Test Cards

| Card Number | Result |
|---|---|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 9995 | ❌ Declined |

Use any future expiry date and any 3-digit CVC.

---

## Project Structure

```
doctools/
├── backend/
│   ├── src/
│   │   ├── index.js            # Express server entry point
│   │   ├── routes/
│   │   │   ├── conversion.js   # PDF↔Word routes
│   │   │   ├── merge.js        # PDF merge route
│   │   │   ├── image.js        # Image resize route
│   │   │   └── payment.js      # Stripe payment routes
│   │   ├── middleware/
│   │   │   └── upload.js       # Multer file upload config
│   │   └── services/
│   │       ├── libreoffice.js  # LibreOffice conversion wrapper
│   │       └── pricing.js      # Pricing calculation logic
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js              # Main app with tab navigation
│   │   ├── index.js
│   │   ├── utils.js            # Blob download helper
│   │   ├── services/
│   │   │   └── api.js          # Axios API calls
│   │   ├── components/
│   │   │   ├── Dropzone.js     # Reusable file dropzone
│   │   │   └── PaymentModal.js # Stripe card payment modal
│   │   └── pages/
│   │       ├── PdfToWord.js
│   │       ├── WordToPdf.js
│   │       ├── MergePdf.js
│   │       └── ImageResize.js
│   ├── .env.example
│   └── package.json
│
├── setup.sh
└── README.md
```
