# Revenue Leak Detection System

A Shopify app project focused on helping merchants identify possible revenue leaks caused by discount inconsistencies.

## Project Status

This project is currently **in progress**.

So far, I have built the **first MVP**, which focuses on checking the **discount part** of an order and identifying cases where the expected amount and final paid amount do not match correctly.

This is not the final version of the product. More detection logic and features are planned.

---

## Detailed Case Study

For a complete breakdown of the idea, logic, and implementation:

👉 https://dc61g20ci9ox4.cloudfront.net/revenue-leak.html

(This page reflects the current state of the project in detail.)
---

## Current MVP

The current MVP checks:

- Order subtotal
- Applied discount
- Final paid amount
- Potential mismatch in discount calculation

### Example

If an order subtotal is **$100** and a **$30 discount** is applied, the expected final amount should be **$70**.

If the paid amount does not align with that calculation, the app flags it as a possible finding.

---

## What This Project Does

The idea behind this project is to help detect revenue leaks in Shopify stores by reviewing order pricing logic and surfacing inconsistencies.

At the current stage, the focus is limited to:

- Discount validation
- Basic revenue leak findings
- Dashboard-based visibility for detected cases

---

## Work in Progress

Planned future improvements include:

- Broader revenue leak detection rules
- Tax and shipping validation
- More advanced order anomaly checks
- Better dashboard experience
- Improved reporting and alerts

---

## Tech Stack

- Shopify App
- Node.js
- React
- Shopify APIs
- AWS

---

## Why I Built This

I wanted to work on a real-world Shopify app idea that solves a meaningful business problem.

Revenue leaks can happen quietly through discount errors or pricing inconsistencies, and this project is an attempt to build a tool that can help merchants catch those issues earlier.

---

## Author

**Jayveersinh Vihol**

LinkedIn: add-your-linkedin-here

Portfolio: https://dc61g20ci9ox4.cloudfront.net/
