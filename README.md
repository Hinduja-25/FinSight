# FinSight — AI-Powered Personal Expense Intelligence

FinSight is a modern personal finance management platform that transforms raw financial data into actionable intelligence. Unlike traditional trackers, FinSight utilizes a hybrid rule-based and AI approach to identify spending patterns, categorize financial personalities, and provide predictive expense forecasting.

## Project Overview
Managing personal finances is often overwhelming due to a lack of context. FinSight solves this by acting as an automated financial advisor. 
*   **The Problem:** Users log data but fail to see the "why" behind their spending habits.
*   **The Solution:** A centralized studio that combines traditional CRUD operations with an AI-driven "Intelligence Studio" for pattern recognition and future projections.

## Features
*   **Secure Authentication:** JWT-based login/signup with stateful session management.
*   **Financial Command Center:** Real-time dashboard tracking total balance, liquid income, and categorical spending.
*   **Income Workflow:** Discrete tracking for 'Pending' vs 'Received' cash flow.
*   **AI Intelligence Studio:** 
    *   **Spending Personalities:** AI-driven classification (e.g., Saver, Overspender).
    *   **Automatic Insights:** Smart tips generated based on week-over-week trend analysis.
    *   **Expense Prediction:** Predictive burn-rate modeling to estimate next month's liability.
*   **Interactive Visuals:** Dynamic charting using Recharts for categorical and temporal data.
*   **Professional Reporting:** One-click export of data to formatted Excel spreadsheets.
*   **Responsive UI:** Premium design system optimized for all devices.

## 🛠 Tech Stack
*   **Frontend:** React (Vite), React Router v7, Recharts, Custom CSS Design System.
*   **Backend:** Python Flask (Blueprint Architecture), SQLAlchemy (ORM).
*   **Database:** MySQL / SQLite.
*   **Authentication:** PyJWT (JSON Web Tokens).
*   **AI Engine:** OpenAI.

## System Architecture
The system follows a standard **Client-Server-AI** tri-tier architecture:
1.  **Frontend (React):** Manages user state and renders financial visualizations. Communicates via a RESTful API.
2.  **Backend (Flask):** Handles core business logic, database transactions, and data sanitization. It acts as the "Source of Truth" for calculations.
3.  **Database (MySQL):** Persistent storage for relational financial data.
4.  **AI Layer (OpenAI):** An asynchronous endpoint that receives sanitized financial metrics to generate natural language insights.

## Project Structure
```text
├── backend/
│   ├── app/
│   │   ├── api/             # Modular Feature Blueprints (Auth, Transactions, AI)
│   │   ├── utils/           # Shared Security & Auth Utilities
│   │   └── models.py        # Relational Schema Definitions
│   └── tests/               # Automated Pytest Suite
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Layout & Global Features
│   │   ├── pages/           # Feature Views (Dashboard, Intelligence)
│   │   └── context/         # Auth & Global State Management
└── README.md
```

## Technical Decisions
*   **Why Flask?** Provides a lightweight, high-performance foundation that allowed for a clean implementation of the modular Blueprint pattern.
*   **Why React?** Enables a highly interactive, state-driven UI where financial charts update immediately upon data changes without page refreshes.
*   **Why JWT?** Allows for a stateless, scalable authentication system that avoids server-side session overhead while maintaining strict security boundaries.
*   **Why Hybrid AI?** Mathematical correctness is critical in finance. We use Python to handle the precise calculations and the AI only to explain patterns and suggest improvements.

## AI Usage & Intelligence
FinSight does not rely on "black-box" AI for its core ledger. 
*   **Data Pre-processing:** Before an AI request is made, the backend aggregates transaction history into specific metrics: total change %, category swings, and income-to-expense ratios.
*   **Predictive Logic:** We provide the AI with the user's "burn rate" (current spending over time). The AI then analyzes this variance to project a future total.
*   **Insight Prompting:** We use structured system prompts to constrain the AI's output to valid JSON, ensuring the UI remains stable and predictive.

## Risks & Limitations
*   **AI Variability:** LLM responses can vary slightly; we mitigate this by using strict JSON parsing and fallback tips.
*   **Manual Entry:** Currently relies on user-inputted data rather than direct bank synchronization.
*   **Data Density:** Predictions are most accurate with at least 14 days of transaction history.

## Future Enhancements
*   **Plaid/Bank Integration:** Direct real-time synchronization with financial institutions.
*   **Multi-Currency Support:** Intelligent conversion and localized spending analysis.
*   **Mobile-First PWA:** A dedicated mobile experience with push-notifications for spending spikes.

## Setup Instructions

**Backend:**
1. Navigate to `/backend`.
2. Create a virtual environment: `python -m venv venv`.
3. Install dependencies: `pip install -r requirements.txt`.
4. Configure `.env` with your `SECRET_KEY` and `OPENAI_API_KEY`.
5. Run: `python run.py`.

**Frontend:**
1. Navigate to `/frontend`.
2. Install dependencies: `npm install`.
3. Configure the proxy in `vite.config.js` to point to `localhost:5000`.
4. Run: `npm run dev`.
