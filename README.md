## Project Overview

This project is a full-stack developer-focused social platform designed to support technical content sharing and real-time interaction between users. It combines a social networking model with developer-specific features such as code snippet publishing and structured interaction flows.

---

## Architecture & Technology Stack

### Frontend

The frontend is implemented in **React with TypeScript**.

UI and styling:
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for accessible and reusable UI components

State management:
- **Zustand** for lightweight global state management (authentication, feed data, UI state)

The rendering layer is optimized for dynamic content such as feeds and real-time updates, minimizing unnecessary re-renders.

---

### Backend

The backend is built using **Node.js** and **Express**, exposing a RESTful API.

Core responsibilities:
- Authentication and authorization using **JWT**
- Password hashing with **bcrypt**
- Protected route enforcement
- Social graph operations (users, friendships, posts, comments, likes)

---

### Database

The application uses **MongoDB** as a document-oriented database.

It is used to model:
- Users and relationships
- Posts with nested structures (comments, likes)
- Flexible content types (text, images, code snippets)

---

### Real-Time Communication

Real-time functionality is implemented using **WebSockets**.

Used for:
- Chat between users (bi-directional communication)
- Live updates where low latency is required

---

### Event Handling & Webhooks

The system integrates **webhooks**.

This enables:
- Decoupling side effects from request-response cycles
- Integration with third-party services (e.g., email, media processing)

---

### External Integrations

- **ImageKit** for media upload, transformation, and CDN delivery
- Email service integration for notifications and onboarding

---

## Testing

Testing focuses on backend reliability and data integrity.

- **Jest** for unit testing business logic
- Integration tests for API-to-database flows
- Validation of access control and social interaction rules

---

## Development Setup

- Separate `/frontend` and `/backend` structure
- Environment configuration via `.env`
- Standard Node.js scripts for running services and tests

---

## Summary

The project consists of:

- React + TypeScript frontend with Tailwind and shadcn/ui
- Node.js + Express backend with REST API
- MongoDB for flexible data modeling
- WebSockets for real-time communication (chat, live updates)

*This project was developed with a focus on ***Technical Collaboration** special thanks to @aronpozsar