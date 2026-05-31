# Homi

**A collaborative household inventory and shopping list manager.**

Homi is a full-stack mobile application designed to help roommates and families keep track of their kitchen inventory, reduce food waste, and seamlessly manage a shared shopping list.

This project features a native mobile frontend built with React Native (Expo) and a robust, secure REST API backend powered by Node.js, Express, and MongoDB.

---

## Tech Stack

**Frontend:**

* React Native
* Expo
* Axios
* React Native Maps & WebView

**Backend:**

* Node.js & Express.js
* MongoDB & Mongoose
* JWT & Bcrypt.js
* Express Validator, Helmet, Express-Rate-Limit

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* Expo CLI (`npm install -g expo-cli`)
* Expo Go app installed on your physical device
* A MongoDB cluster

### 1. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend

```


2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the `backend` root and add the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_jwt_key

```


4. Start the server:
```bash
npm start

```



### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend

```


2. Install dependencies:
```bash
npm install

```


3. Create a `.env` file in the `frontend` root and point it to your backend:
```env
# Use your machine's local IP address
# Both devices must be connected to the same network
EXPO_PUBLIC_API_URL=http://your_ip_address:5000/api

```


4. Start the Expo server:
```bash
npx expo start

```


5. Scan the QR code with your phone's camera or the Expo Go app to launch Homi.
