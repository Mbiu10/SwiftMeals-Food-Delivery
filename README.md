## SwiftMeals-Food-Delivery
SwiftMeals is a modern food delivery web application built to provide a seamless online ordering experience. Users can browse a variety of food items, add them to their cart, choose between M-Pesa or Cash on Delivery payment methods, and manage their orders. The app includes user authentication, a forgot password feature with Gmail integration, and a responsive UI for an intuitive experience.

## Features

- **User Authentication**: Secure login and registration with role-based access (user/admin).
- **Food Browsing**: Explore food items with search and category filtering.
- **Cart Management**: Add, remove, and view items in the cart, synced with the backend.
- **Payment Options**:
  - M-Pesa: Integrated STK Push for seamless mobile payments.
  - Cash on Delivery: Option for offline payment on delivery.
- **Order Management**: View order history with details like amount (in KSh), payment status, and method.
- **Forgot Password**: Request a password reset link via Gmail and update passwords securely.
- **Responsive Design**: Optimized for desktop and mobile devices.

## Tech Stack

### Frontend
- **React**: For building a dynamic and responsive UI.
- **Vite**: Fast build tool and development server.
- **Axios**: For API requests to the backend.
- **React Router**: For client-side routing.
- **CSS**: Custom styles for a polished look.

### Backend
- **Node.js & Express**: For building a RESTful API.
- **MongoDB & Mongoose**: NoSQL database for storing users, orders, and food items.
- **JWT**: For secure authentication and password reset tokens.
- **Bcrypt**: For password hashing.
- **Nodemailer**: For sending password reset emails via Gmail.
- **Validator**: For input validation (e.g., email format).

### Payment Integration
- **M-Pesa Daraja API**: For STK Push payments (requires Safaricom API credentials).

## Prerequisites

- **Node.js**: v16 or higher.
- **MongoDB**: Local or cloud instance (e.g., MongoDB Atlas).
- **Gmail Account**: With 2-Step Verification and an App Password for email sending.
- **Safaricom Daraja API**: Credentials for M-Pesa integration (optional for testing).
