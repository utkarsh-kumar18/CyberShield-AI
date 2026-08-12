# 🛡️ CyberShield AI

## National Citizen Safety & Fraud Intelligence Platform

CyberShield AI is a web-based citizen safety platform designed to help users identify potential cyber threats, detect scam messages, report fraud incidents, and view security intelligence.

The platform combines a React frontend, Flask REST API, MySQL database, machine-learning based message analysis, and external security services to provide a centralized cyber-safety solution.

---

## 🚀 Key Features

### 🔐 Authentication & Security
- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Forgot password functionality
- Secure password reset
- Role-based access control for administrators

### 🌐 Website Scanner
- Scan suspicious URLs
- VirusTotal analysis
- Google Safe Browsing verification
- Displays malicious, suspicious, harmless and undetected results
- Saves scan history for authenticated users

### 💬 Scam Message Detector
- Analyze SMS, WhatsApp and email messages
- Machine-learning based scam detection
- Rule-based security indicators
- Confidence/risk analysis
- Detects common scam and phishing patterns
- Saves message scan history

### 🚨 Fraud Reporting
- Citizens can report cyber-fraud incidents
- Fraud categories include:
  - UPI Fraud
  - OTP Scam
  - Online Shopping Scam
- Report description and amount
- Report status tracking

### 📊 Threat Analytics
- Total fraud reports
- Pending reports
- Resolved reports
- Total reported amount
- Fraud reports by type
- Recent reports

### 👤 Personal Security Dashboard
- Total scans
- Threats detected
- Submitted reports
- Current security status
- Security tools
- Scan history
- Personal fraud reports

### 👨‍💻 Admin Panel
- View citizen fraud reports
- View scan records
- Search and filter reports
- Monitor report statistics
- Update report status
- Admin-only access using role-based authorization

---

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Python
- Flask
- Flask-CORS
- Flask-JWT-Extended
- Flask-Bcrypt
- SQLAlchemy

### Database
- MySQL

### Machine Learning
- Python
- Scikit-learn
- NLP-based text analysis

### External Security APIs
- VirusTotal API
- Google Safe Browsing API

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Chrome DevTools

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │       Citizen        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │      (Vite)          │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Flask Backend     │
                    ├──────────────────────┤
                    │ Authentication/JWT   │
                    │ Website Scanner      │
                    │ Message Scanner      │
                    │ Fraud Reports        │
                    │ Threat Analytics     │
                    │ Admin API            │
                    └───────┬───────┬──────┘
                            │       │
                 ┌──────────┘       └──────────┐
                 ▼                             ▼
        ┌─────────────────┐          ┌──────────────────┐
        │     MySQL       │          │ Security APIs    │
        │    Database     │          ├──────────────────┤
        └─────────────────┘          │ VirusTotal       │
                                     │ Google Safe      │
                                     │ Browsing         │
                                     └──────────────────┘


## 📁 Project Structure

CyberShield AI/
│
├── backend/
│   ├── models/
│   │   ├── user.py
│   │   ├── scan.py
│   │   └── fraud_report.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── scanner.py
│   │   ├── message_scanner.py
│   │   ├── fraud_reports.py
│   │   ├── analytics.py
│   │   └── admin.py
│   │
│   ├── app.py
│   ├── config.py
│   ├── extensions.py
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md                                 