# 🧠 Revenue Leak Detection System (Shopify App)

A Shopify app designed to identify hidden revenue leaks caused by discount misuse and pricing inconsistencies.

---

## 🔍 Overview

This project analyzes Shopify orders and detects discrepancies between:

* Expected order value
* Applied discounts
* Final paid amount

⚠️ **Current Stage:** MVP (Minimum Viable Product)

At this stage, the app focuses on **discount-related revenue leak detection**.

Built as part of an ongoing effort to develop a production-ready Shopify analytics tool.

---

## 💡 Problem

Many Shopify stores lose revenue due to:

* Incorrect discount calculations
* Misconfigured discount rules
* Unexpected checkout behavior

These issues often go unnoticed and directly impact profits.

---

## ⚙️ Current MVP (What Works Today)

✅ Fetches Shopify order data
✅ Analyzes subtotal, discount, and final paid amount
✅ Detects mismatches in discount calculations
✅ Displays identified issues in a basic dashboard

### 📊 Example

| Subtotal | Discount | Paid | Status                   |
| -------- | -------- | ---- | ------------------------ |
| $100     | $30      | $70  | ✅ Correct                |
| $100     | $30      | $65  | ❌ Potential Revenue Leak |

---

## 🚧 Work in Progress

Planned improvements:

* Advanced anomaly detection logic
* Support for tax & shipping discrepancies
* Real-time monitoring
* Improved dashboard UI
* Automated alerts for merchants

---

## 🛠️ Tech Stack

* **Frontend:** React / Polaris
* **Backend:** Node.js
* **Platform:** Shopify App (CLI)
* **Cloud:** AWS (S3 / Lambda)

---

## 🚀 How It Works

1. Shopify provides order data via API
2. App processes pricing & discount logic
3. Compares expected vs actual payment
4. Flags inconsistencies
5. Displays findings

---

## 🔐 Security

* Environment variables stored securely using `.env`
* No sensitive credentials exposed
* Follows secure API handling practices

---

## 🌐 Portfolio

👉 https://dc61g20ci9ox4.cloudfront.net/

---

## 👤 Author

**Jayveersinh Vihol**

* LinkedIn: https://linkedin.com/in/YOUR-LINKEDIN
* Portfolio: https://dc61g20ci9ox4.cloudfront.net/

---

## ⭐ Why This Project Matters

This project demonstrates:

* Real-world problem solving
* Shopify app development
* Backend + API integration
* Building a product from MVP to scalable system

---

## 📌 Note

This project is actively being developed.
Current implementation focuses on **discount-related revenue leaks**, with more features planned.
