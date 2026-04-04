<p align="center">
  <img src="https://cdn.worldvectorlogo.com/logos/shopify.svg" alt="Shopify Logo" width="120"/>
</p>

# 🛍️ Shopify Revenue Leak Detection System

A Shopify embedded app that detects hidden revenue loss using real order data and webhook-based event export.

🚀 Built to help merchants identify where they may be losing money — starting with high discount detection and expanding into a broader revenue intelligence system.

---

## 🔗 Live Project
👉 Portfolio Case Study:  
https://dc61g20ci9ox4.cloudfront.net/revenue-leak.html

---

## 💡 Problem

Shopify store owners often lose revenue without realizing it due to:
- Excessive discounting
- Refunds and cancellations
- Shipping mismatch
- Inventory issues
- App charges
- Low conversion despite store activity

Most dashboards show **what happened**, but not **where money is leaking**.

---

## 🧠 Solution

This app analyzes Shopify store data and flags potential **revenue leaks** using rule-based detection.

The current MVP focuses on **high discount detection** and also includes a working **Shopify webhook export pipeline to AWS S3** for external cloud storage and future processing.

It acts like a **revenue monitoring system for Shopify stores**.

---

## 🔥 Key Features (Current MVP)

### 1. 💸 High Discount Detection
- Identifies orders with unusually high discount percentages
- Severity levels:
  - Medium: > 30%
  - High: > 50%
- Uses real Shopify order data

---

### 2. ☁️ Shopify Webhook Export to AWS S3
- Captures Shopify order-related webhook events
- Exports webhook payloads to AWS S3
- Creates a cloud-based data pipeline for future reporting and processing

---

### 3. 📊 Revenue Leak Dashboard
- Displays revenue leak findings in a dashboard UI
- Surfaces current MVP findings in a clear, readable format
- Built to support future leak detection modules

---

## 🏗️ Tech Stack

**Frontend**
- React
- React Router
- Shopify embedded app UI patterns

**Backend**
- Node.js
- Shopify Admin API
- Shopify webhook handlers

**Cloud / Infrastructure**
- AWS S3
- AWS CloudFront

---

## ⚙️ How It Works

1. Authenticates Shopify admin session
2. Pulls Shopify order data for analysis
3. Applies rule-based detection logic
4. Generates structured leak findings
5. Receives Shopify webhook events
6. Exports webhook payloads to AWS S3
7. Displays findings in a dashboard UI

---

## 🧪 Current Status

🚧 MVP (Minimum Viable Product)

- ✔️ Real Shopify data integration  
- ✔️ High discount detection implemented  
- ✔️ Revenue leak dashboard built  
- ✔️ Shopify webhook export to AWS S3 working  
- ⏳ More leak detection rules planned  

---

## 🛠️ Issues Faced / Troubleshooting Done

During development, I worked through several real implementation issues, including:

- TypeScript file casing/import conflicts
- Route and module resolution errors
- Dashboard initially showing zero findings
- Webhook subscriptions missing in app setup
- Incorrect webhook route path configuration
- Shopify order events not initially appearing in AWS S3
- Portfolio deployment issues such as missing files / 404 errors

Troubleshooting included:
- Fixing file naming and import consistency
- Correcting Shopify route and webhook path configuration
- Testing with real Shopify orders
- Reviewing and redeploying webhook subscriptions
- Verifying successful order-related entries in AWS S3

---

## 🚀 Planned Features

- Refund and cancellation detection
- Chargeback monitoring
- Abandoned checkout detection
- Shipping cost vs revenue mismatch
- Inventory / out-of-stock alerts
- App subscription cost analysis
- Real-time alerts / notifications

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](./images/img_1.png)

### Findings List
![Findings](./images/img_2.png)

---

## 👨‍💻 Author

**Jayveersinh Vihol**

- Application Support / Technical Support background
- Building SaaS-style analytics tools
- Interested in Shopify apps, cloud workflows, and product-focused engineering

---

## 📬 Connect With Me

- LinkedIn: https://linkedin.com/in/jayveersinh-vihol-4855a31b7
- GitHub: https://github.com/Vjayveersinh

---

## ⭐ Why This Project Matters

This project demonstrates:
- Real-world Shopify API integration
- Shopify webhook handling
- AWS S3 export workflow
- Backend + frontend system design
- Data-driven problem solving
- Product thinking, not just coding

---

## ⚠️ Disclaimer

This is an independent project built for learning and portfolio purposes.  
Not affiliated with Shopify.

---
