# 🍽️ Food-AI — AI-Powered Food Discovery & Social Recipe Platform

> **Discover food. Generate recipes with AI. Share your creations. Build a food community.**

Food-AI is a full-stack food discovery and social platform that combines **AI-powered recipe generation**, **chef-created recipes**, and a **social food community** into one modern web application.

Users can discover dishes, generate recipes from available ingredients, recreate existing recipes with AI, save their favorites, interact with the community, and manage their profiles.

Chefs can publish recipes and contribute high-quality food content to the platform.

---

## 🚀 Live Project

**Frontend:** Add your deployed frontend URL here
**Backend API:** Add your deployed backend URL here

> Replace the URLs above with your actual deployment links before publishing the repository.

---

## ✨ Key Features

### 🤖 AI-Powered Recipe Generation

* Generate recipes using available ingredients
* Recreate or modify existing recipes using AI
* AI-generated ingredients, instructions and precautions
* Recipe generation history
* Recreate previous AI recipes
* Delete/restore AI-generated recipe history
* AI error handling and API integration

### 👨‍🍳 Chef & User Roles

Food-AI supports role-based functionality:

**User**

* Discover recipes
* Generate AI recipes
* Save dishes
* Like/comment/share community posts
* Manage profile
* Receive notifications

**Chef**

* Create and publish recipes
* Manage food content
* Share recipes with the community
* Build a food-focused profile

---

## 🔐 Authentication & Security

* User registration
* Email OTP verification
* Login/logout
* Forgot password
* Reset password
* Change password
* Protected routes
* Role-based authorization
* HTTP-only authentication cookies
* Credential-based API requests
* Backend authorization for protected operations

---

## 🍲 Food Discovery

* Browse chef-created dishes
* Explore recipes
* Search/discover food
* Random dish discovery
* Detailed recipe pages
* Ingredients
* Cooking precautions
* Recipe information
* Save favorite dishes

---

## 👥 Food Community

Food-AI includes a social platform where users and chefs can share food-related content.

### Community Features

* Create food posts
* Image/video media support
* Like posts
* Comment on posts
* Share posts
* Save posts
* View community feed
* View comments
* Manage posts

This turns Food-AI from a simple recipe application into a **food-focused social platform**.

---

## 👤 Profile System

* User profiles
* Chef profiles
* Profile creation
* Profile editing
* Profile information management
* Favorite food preferences
* Profile-based content

---

## 🔔 Notifications

Food-AI supports real-time application notifications using:

* Socket.IO
* REST API fallback
* Read/unread notification state
* Notification deletion

This provides a foundation for real-time social interactions.

---

## 🌐 Multi-Language Support

The application includes a language context that allows the UI to support multiple languages and provides a foundation for localized food content.

---

## 🎨 Modern UI/UX

* Responsive design
* Mobile-first experience
* Desktop sidebar navigation
* Mobile bottom navigation
* Responsive food grids
* Dark/light theme support
* Toast notifications
* Loading states
* Empty states
* Error states
* Reusable UI components

### Responsive Layout

| Device      | Experience                                     |
| ----------- | ---------------------------------------------- |
| 📱 Mobile   | Bottom navigation + responsive grids           |
| 💻 Laptop   | Sidebar navigation + multi-column layout       |
| 🖥️ Desktop | Expanded navigation + optimized content layout |

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React App       │
                    │   React 19 + Vite    │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │    Axios API Layer   │
                    │  Auth / Food / Blog  │
                    │ AI / Profile / etc.  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │      Backend API     │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
       ┌───────────┐     ┌────────────┐    ┌─────────────┐
       │ MongoDB   │     │ Gemini AI  │    │   Image/    │
       │ Mongoose  │     │   Service  │    │ Media Store │
       └───────────┘     └────────────┘    └─────────────┘
                               │
                               ▼
                       ┌──────────────┐
                       │   Socket.IO  │
                       │ Notifications│
                       └──────────────┘
```

---

# 🧩 Frontend Architecture

```text
src/
│
├── api/
│   ├── auth.js
│   ├── food.js
│   ├── blog.js
│   ├── ai.js
│   ├── profile.js
│   ├── notifications.js
│   ├── feedback.js
│   └── client.js
│
├── components/
│   ├── AppLayout.jsx
│   ├── ProtectedRoute.jsx
│   ├── BottomNav.jsx
│   ├── TopBar.jsx
│   ├── BlogCard.jsx
│   ├── DishCard.jsx
│   ├── CommentsSheet.jsx
│   └── States.jsx
│
├── context/
│   ├── AuthContext.jsx
│   ├── LanguageContext.jsx
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Explore.jsx
│   ├── DishDetail.jsx
│   ├── AiHub.jsx
│   ├── AiCreate.jsx
│   ├── AiRecipe.jsx
│   ├── AiResult.jsx
│   ├── FoodCommunity.jsx
│   ├── CreatePost.jsx
│   ├── Profile.jsx
│   ├── EditProfile.jsx
│   ├── Saved.jsx
│   ├── Notifications.jsx
│   ├── Settings.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── VerifyOtp.jsx
│   └── ForgotPassword.jsx
│
├── assets/
├── App.jsx
├── main.jsx
└── index.css
```

The frontend follows a modular architecture where:

* API logic is separated from UI
* Shared state is handled through React Context
* Reusable UI components reduce duplication
* Pages represent application screens
* Protected routes handle authenticated experiences

---

# 🔌 API Integration

| Feature        | Frontend Module        | Backend          |
| -------------- | ---------------------- | ---------------- |
| Authentication | `api/auth.js`          | Auth API         |
| Food           | `api/food.js`          | Food API         |
| AI             | `api/ai.js`            | AI Recipe API    |
| Blog           | `api/blog.js`          | Community API    |
| Profile        | `api/profile.js`       | Profile API      |
| Notifications  | `api/notifications.js` | Notification API |
| Feedback       | `api/feedback.js`      | Feedback API     |

The centralized Axios client handles API communication and authenticated requests.

---

# 🛠️ Tech Stack

## Frontend

* **React 19**
* **Vite**
* **React Router**
* **Tailwind CSS**
* **Axios**
* **Lucide React**

## Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **Socket.IO**

## AI & Services

* **Google Gemini / Google GenAI**
* **ImageKit**
* **Nodemailer**
* **JWT Authentication**
* **HTTP-only Cookies**

---

# 📦 Installation

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

cd FOODAI
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

> Never commit your real `.env` file to GitHub.

Use `.env.example` as a reference.

---

# ▶️ Run Development Server

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

Make sure the backend server is running separately.

---

# 🏭 Production Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Run linting:

```bash
npm run lint
```

---

# 🔒 Authentication Flow

```text
Register
   ↓
Email OTP
   ↓
OTP Verification
   ↓
Account Created
   ↓
Login
   ↓
HTTP-only Auth Cookie
   ↓
Protected Application
```

Protected routes prevent unauthenticated users from accessing restricted application areas.

---

# 🤖 AI Recipe Flow

```text
User Ingredients / Food Parameters
                ↓
          AI Recipe Request
                ↓
          Backend API
                ↓
        Google Gemini Service
                ↓
       Generated Recipe
                ↓
       AI Result Screen
                ↓
      Save / Recreate / History
```

AI processing is handled through the backend rather than exposing sensitive AI credentials directly to the frontend.

---

# 📱 Main Application Screens

* Splash Screen
* Onboarding
* Login
* Registration
* OTP Verification
* Forgot Password
* Home
* Explore
* Random Dish
* Dish Details
* AI Hub
* AI Recipe Generator
* AI Results
* AI History
* Food Community
* Create Post
* Saved Recipes
* Profile
* Edit Profile
* Notifications
* Settings

---

# 🎯 Project Goals

Food-AI was designed to solve a simple problem:

> **People often have ingredients but don't know what to cook with them.**

Instead of searching through hundreds of recipes, users can provide their available ingredients and let AI generate a personalized recipe.

The platform extends this idea by connecting AI-powered cooking with:

* Chef-created recipes
* Food discovery
* Social sharing
* Community interaction
* Personalized profiles

---

# 📈 Scalability Considerations

The project is structured with scalability in mind:

* Modular API architecture
* Separated frontend API layer
* Centralized authentication handling
* Role-based authorization
* Reusable React components
* Context-based application state
* RESTful backend communication
* External media storage
* Real-time Socket.IO notifications

Future production improvements can include:

* Redis caching
* API rate limiting
* Database indexing
* CDN optimization
* Background job processing
* Horizontal backend scaling
* Automated testing
* CI/CD pipelines
* Observability and centralized logging

---

# 🔮 Future Improvements

* [ ] Personalized AI recommendations
* [ ] Nutrition and calorie analysis
* [ ] Advanced recipe search
* [ ] Ingredient-based filtering
* [ ] Follow/follower system
* [ ] Direct messaging
* [ ] Recipe ratings
* [ ] AI meal planning
* [ ] Shopping-list generation
* [ ] Advanced notification preferences
* [ ] Automated testing
* [ ] CI/CD pipeline
* [ ] Performance monitoring

---

# 👨‍💻 Developer

**Ayush Verma**

B.Tech Computer Science Engineering
Backend Developer / Software Engineer Aspirant

### Interests

* Backend Development
* REST APIs
* Database Design
* AI Integration
* System Design
* Scalable Applications

---

# ⭐ Why Food-AI?

Food-AI is more than a CRUD project.

It combines:

**AI + Backend Engineering + Authentication + Database Design + Social Features + Real-Time Notifications + Responsive UI**

The project demonstrates how multiple production-style technologies can work together to create a complete full-stack application.

---

## 📄 License

This project is developed for learning, portfolio and demonstration purposes.
