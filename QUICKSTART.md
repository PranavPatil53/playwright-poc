# 🚀 Quick Start Guide — Playwright WebApp PoC

Welcome! This package is configured for **fully automated 1-click execution**.

---

## ⚡ 1-Click Setup & Run

1. Download & **Extract** the ZIP folder on your PC.
2. Double-click **`run-poc.bat`** (or run `.\run-poc.bat` in CMD / VS Code terminal).
3. The script will automatically:
   - Check for Node.js (and auto-install Node.js via `winget` if missing)
   - Install required npm packages (`npm install`)
   - Download the Chromium browser binary
   - Launch the **Playwright Interactive UI** dashboard

4. Inside the Playwright UI dashboard:
   - Click the **Play ▶️ icon** next to `01-shoecheckout.spec.js` (or any test) to run the test visually!

---

## 🎯 Run via VS Code (Optional)

1. Open this folder in **VS Code**.
2. Open Extensions (`Ctrl+Shift+X`) and install **Playwright Test** (by Microsoft).
3. Open any `.spec.js` file under `tests/webapp-poc/` and click the **Play ▶️ icon** next to line numbers to execute tests directly!

---

## 📊 View Test Reports

To view full HTML reports after running tests:
```cmd
npm run test:report
```
