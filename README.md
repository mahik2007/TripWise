# ✈️ TripWise — Split Your Expenses Wisely!

> **A simple and smart web application for managing and splitting group travel expenses.**

TripWise Logo:

<p>
  <img src="image/logo.png" alt="TripWise Logo" width="150">
</p>

TripWise is a web-based travel expense management application designed to make it easier for friends, families, and groups to **track shared expenses, split costs, and understand who owes whom** during a trip.

Instead of manually calculating expenses or using complicated spreadsheets, TripWise provides a clean and intuitive interface for managing trip finances in one place.

---

## 🌐 Live Website

🔗 https://mahik2007.github.io/TripWise.github.io/

---

## 🌟 Features

* 🧳 **Create & Manage Trips** — Create a trip and organize its details in one place.
* 👥 **Group Members** — Add and manage travelers for each trip.
* 💰 **Add Expenses** — Record shared expenses such as food, travel, accommodation, shopping, and activities.
* 👥 **Expense Splitting** — Split expenses among multiple travelers.
* 📊 **Expense Summary** — Get a clear overview of total spending and who owes whom, with one-click settlement.
* 🧮 **Automatic Calculations** — Reduce manual calculations while determining balances.
* 🤖 **AI Chatbot Assistant** — Gemini-powered helper for expense questions.
* 🌗 **Dark & Light Themes** — Animated backgrounds in both themes.
* 📱 **Responsive Interface** — Designed to work across desktop and mobile screen sizes.

---

## 🖥️ Pages

| Page                  | Purpose                                    |
| --------------------- | ------------------------------------------ |
| 🏠 Home               | Introduction and overview of TripWise      |
| 🔐 Login / Register   | User authentication                        |
| ✈️ Create Trip        | Create and organize a new trip             |
| 💸 Add Expense        | Add and categorize shared expenses         |
| 📊 Summary            | View expenses, contributions, and balances |
| 📩 Contact / Feedback | Submit feedback and suggestions            |

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend / Logic

* Python (Django REST API)
* Google Gemini API (AI chatbot, optional)

### Tools

* Git
* GitHub
* VS Code

---

## 🎯 Problem Statement

Group trips often involve multiple shared expenses. Keeping track of who paid for what and calculating how much each person owes can become confusing, especially when there are several people and transactions involved.

**TripWise aims to simplify this problem** by bringing trip expense tracking and splitting into a single, easy-to-use web application.

---

## 💡 How It Works

```text
Create a Trip
     ↓
Add Travelers
     ↓
Record Expenses
     ↓
Choose Participants
     ↓
Calculate Individual Shares
     ↓
View Expense Summary
     ↓
Settle Balances
```

---

## 🚀 Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/mahik2007/TripWise.git
cd TripWise
```

### 2. Frontend

```bash
python -m http.server 5500
```

Then open http://localhost:5500

### 3. Backend (Django API)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The API runs at http://127.0.0.1:8000

### 4. AI Chatbot (optional)

Set a `GEMINI_API_KEY` environment variable to enable the Gemini-powered assistant.

---

## 📂 Project Structure

```text
TripWise/
│
├── index.html            # Home page
├── login.html            # Login
├── create_acc.html       # Create account
├── create_trip.html      # Create trip
├── add_expense.html      # Add expenses
├── summary.html          # Expense summary & settlements
├── contact.html          # Contact / feedback
├── forgotpasslogin.html  # Password reset
│
├── css/
│   ├── theme.css         # Dark/light theme system
│   └── responsive.css    # Layout & shared component styles
│
├── js/
│   └── script.js         # Frontend logic, themes & animations
│
├── image/                # Logo, illustrations & destination images
│
├── backend/              # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── api/              # Models, views, URLs, migrations
│   └── tripwise_backend/ # Project settings
│
├── ai_chatbot/           # Gemini-powered chatbot
│
└── README.md
```

---

## 👀 No backend? No problem.

The frontend falls back to browser localStorage when the Django API isn't running, so you can try the full UI immediately.

---

## 🔮 Future Improvements

Some planned improvements include:

* ☁️ Cloud database integration
* 🤝 Real-time expense synchronization
* 📱 Progressive Web App support
* 📈 Advanced expense analytics
* 💳 Multiple payment methods
* 🌍 Multi-currency support
* 🤖 AI-powered spending insights

---

---

## 🎓 Project Purpose

TripWise was developed as a **BS AICS IIT Patna Semester 2 Capstone Project** to explore web development, frontend design, JavaScript logic, and expense-management workflows.

© 2026 TripWise Team
