# 🍱 Spare A Bite – Backend API

This is the **backend server** for the Spare A Bite web application, a platform that helps connect food donors with people in need. It handles food listings, food requests, reviews, and authentication using Firebase and MongoDB.

**🔗 Live API:** [https://spare-a-bite-server.vercel.app](https://spare-a-bite-server.vercel.app)

---

## 🔧 Tech Stack

- **Express.js** – Web framework
- **MongoDB** – Database
- **Firebase Admin SDK** – Auth token verification
- **dotenv** – Environment variable management
- **CORS** – Middleware for cross-origin requests

---

## 🔒 Authentication

- Uses Firebase Admin SDK to verify Firebase-issued JWT tokens.
- `verifyToken` middleware checks for valid Bearer token.
- `verifyEmail` middleware ensures the user can only access their own data.

---

## 📦 Endpoints Overview

### 🔹 Food Endpoints

- `GET /allFoods` – All food data
- `GET /featuredFoods` – Top 6 by quantity
- `GET /foods?search=&sort=` – Filtered/search food
- `GET /food/:id` – Food by ID
- `POST /food` – Add food (auth required)
- `POST /food/:id` – Edit food (auth required)
- `DELETE /food/:id` – Delete food (auth required)

### 🔹 Requests

- `POST /foodRequets` – Make a request (auth required)
- `GET /foodRequests?email=` – See requests by user (auth + email match)
- `DELETE /foodRequests/:id` – Cancel a request
- `PATCH /foodRequests/:id` – Edit request note (auth + email match)

### 🔹 My Foods

- `GET /myManagedFoods?email=` – View foods by donor (auth + email match)

### 🔹 Reviews

- `GET /reviews` – All reviews
- `POST /reviews` – Add review (auth required)
