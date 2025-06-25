# 🍱 Spare A Bite – Backend API

## 🚀 Purpose

This is the backend server for the Spare A Bite web application, a platform that helps connect food donors with people in need. It handles food listings, food requests, reviews, and authentication using Firebase and MongoDB.

## 🌐 Live URL

🔗 [Spare A Bite API - Live Demo](https://spare-a-bite-server.vercel.app)

## ✨ Key Features

- **Authentication**: Uses Firebase Admin SDK to verify Firebase-issued JWT tokens
- **Middleware**: Includes `verifyToken` and `verifyEmail` for secure access control
- **Food Management**: Full CRUD operations for food listings
- **Request System**: Handle food requests between users
- **Review System**: Submit and view reviews
- **CORS Support**: Secure cross-origin requests

## 🔒 Authentication

- Uses Firebase Admin SDK to verify Firebase-issued JWT tokens.
- `verifyToken` middleware checks for valid Bearer token.
- `verifyEmail` middleware ensures the user can only access their own data.
---

## 📦 npm Packages Used

- [`express`](https://www.npmjs.com/package/express)
- [`mongodb`](https://www.npmjs.com/package/mongodb)
- [`firebase-admin`](https://www.npmjs.com/package/firebase-admin)
- [`dotenv`](https://www.npmjs.com/package/dotenv)
- [`cors`](https://www.npmjs.com/package/cors)

## 🛠️ How to Run Locally

Follow these steps to run the **Spare A Bite API** on your local machine:

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/spare-a-bite-server.git
cd spare-a-bite-server
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

### Step 4: Run the Server

```bash
npm start
# or
yarn start
```

The API will be available at [http://localhost:5000](http://localhost:5000)

## 📄 API Endpoints

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
  
