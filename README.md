# 💸 PayFlow – A Fintech Digital Wallet API

PayFlow is a RESTful API built with Node.js, Express, and MongoDB that simulates a digital wallet system. It supports user registration and authentication, wallet creation and funding, transfers between users, and transaction history.

---

## 🚀 Live Demo

- 🌐 Base URL: [https://payflow-fintech.onrender.com](https://payflow-fintech.onrender.com)
- 📄 API Documentation: [Postman Docs](https://documenter.getpostman.com/view/36820009/2sB2qgeJiF)

---

## 🧰 Features

- ✅ User Sign Up and Login (with JWT authentication)
- ✉️ Email verification (toggleable via `.env`)
- 🔐 Forgot Password + Reset Password via email (Nodemailer)
- 👤 Get user profile
- ✏️ Update or delete account
- 💰 Auto wallet creation for new users
- ➕ Fund wallet
- 🔄 Peer-to-peer money transfers
- 📜 View transaction history (credit/debit separation)
- 📂 Modular route/controller structure for scalability

---

## 📦 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT, Bcrypt, Nodemailer
- **Hosting:** Render
- **Documentation:** Postman

---

## 🛠️ Getting Started Locally

### 1. Clone the Repository

```bash
git clone https://github.com/iygeal/payflow.git
cd payflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create a `.env` File

```bash
PORT=5000
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret-key
REFRESH_TOKEN_SECRET=your-refresh-token-secret
EMAIL_USER=your-email-address
EMAIL_PASS=your-email-password-for-apps
REQUIRE_EMAIL_VERIFICATION=true
BASE_URL=http://localhost:5000
```

### 4. Start the Server

```bash
npm start
```
The app will be running at [http://localhost:5000](http://localhost:5000)

### API Testing
Use the provided Postman Docs for API testing.

### Developer
Name: [Iygeal Anozie](https://www.linkedin.com/in/iygeal/)(LinkedIn)

Twitter: [https://twitter.com/iygeal](https://twitter.com/iygeal)

GitHub: [https://github.com/iygeal](https://github.com/iygeal)

### License
This project is licensed under the MIT License – feel free to use, fork, and contribute.


### Acknowledgments
-- Thanks to [Nodemailer](https://nodemailer.com/) for the email verification and password reset features.

-- Special thanks to [Render](https://render.com/) for providing the free deployment service and [Postman](https://www.getpostman.com/) for the API documentation platform.

-- In a special way, I thank the CareerEx Tutor [David Sampson](https://www.linkedin.com/in/david-sampson/) for his invaluable guidance and support. He's a great tutor of Software Development in general, and I'm grateful for his expertise.