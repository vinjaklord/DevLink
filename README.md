# 💻 DevLink

> **A Specialized Social Media Platform for Developers**
> A full-stack networking environment built to bridge the gap between social interaction and technical collaboration.

## 🚀 Live Demo & Access

**Experience the platform live:** [DevLink - Live App](https://dev-link-ruby.vercel.app/login)

### **Recruiter / Guest Access**

To explore the platform without creating an account, please use the following demonstration credentials:

* **Username:** `aronpozsar`
* **Password:** `123123`

---

## 🎯 Project Overview

DevLink is a dedicated space where developers can move beyond simple networking. It addresses the need for a platform that understands technical content, allowing users to share code snippets as easily as text or images, fostering a community focused on peer support and professional growth.

---

## ✨ Key Features

* **Developer-Centric Posting**: Support for sharing text, high-quality images (via ImageKit CDN), and **syntax-highlighted code snippets** with full social interaction (Likes, Comments, Shares).
* **Networking System**: A robust friendship and search engine allowing users to find and connect with other developers based on tech stacks or interests.
* **Real-Time Interaction Engine**: Instant updates for social feeds and profile interactions to ensure a seamless "live" experience.
* **Secure Session Management**: Bulletproof authentication flow using **JWT (JSON Web Tokens)** and secure cookie/header handling.
* **Automated Mailing**: Integrated email system for notifications and user onboarding.

---

## 🏗️ Technical Architecture

### **Frontend**

* **State Management**: **Zustand** for lightweight, high-performance global state (Auth, User Feed, and UI notifications).
* **Responsive UI**: Built with **Tailwind CSS** and **ShadCn-UI** for a modern, mobile-first developer aesthetic.
* **Optimization**: Efficient rendering logic to handle dynamic feeds and real-time social updates without performance lag.

### **Backend**

* **Engine**: Node.js & Express.js implementing a scalable RESTful API architecture.
* **Security**: Bcrypt for industrial-grade password hashing and JWT for protected route middleware.
* **Data Strategy**: **MongoDB** for flexible, document-based storage of complex social graphs (friends, likes, and nested comments).
* **Media Handling**: Integration with **ImageKit API** for optimized image transformation and fast global delivery.

---

## 🧪 Quality Assurance & Testing

The project prioritizes data integrity and security through a multi-layered testing approach.

### **Test Coverage**

* **Security Testing**: Rigorous validation of protected routes to ensure sensitive user data and social actions are strictly accessible to authorized users.
* **API Validation**: **Jest** suites for backend logic, ensuring that social interactions (like friending or commenting) follow business rules and database constraints.
* **Integration Testing**: Verifying the end-to-end flow from frontend actions to MongoDB persistence, ensuring real-time updates reflect accurately for all users.

### **Running Tests**

```bash
# Run Backend Unit Tests (Jest)
npm test

```

---

## 🚀 Installation & Setup

1. **Clone & Install**:

```bash
git clone https://github.com/vinjaklord/devlink.git
# Install dependencies in both /frontend and /backend
npm install

```

2. **Environment Setup**:
Create a `.env` file in the `/backend` directory using the following template:

```env
PORT=8000
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
JWT_KEY=your_secret_key

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

# Mailing & Frontend Configuration
FRONTEND_URL=your_frontend_url
USER=your_email_service_user
PASS=your_email_service_password

```

3. **Launch**:

```bash
# Start Backend (from /backend)
npm start

# Start Frontend (from /frontend)
npm run dev

```

---

## 📧 Contact

**Aron Pozsar** [LinkedIn](https://www.linkedin.com/in/aronpozsar/) | aronpozsar@gmail.com

---

*This project was developed with a focus on **User Security**, **Technical Collaboration**, and **Modular API Design**.*
