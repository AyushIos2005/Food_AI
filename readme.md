# 🍽️ Food-AI Backend

> Production-oriented backend API for **Food-AI** — an intelligent food platform where users can discover food, generate/recreate recipes with AI, interact through social features, and receive real-time notifications.

---

## 🚀 Overview

Food-AI is a scalable food platform backend built with **Node.js, Express.js and MongoDB**.

The backend provides APIs for:

* 🔐 User authentication & authorization
* 👨‍🍳 User and Chef roles
* 📧 Email verification & OTP
* 🔑 Password reset
* 🤖 AI-powered food/recipe generation
* 🍲 Chef-created recipes
* 📝 Food blogs/posts
* ❤️ Likes, comments and social interactions
* 👥 Follow/follower system
* 🔔 Notifications
* ⚡ Real-time notifications using Socket.IO
* 📸 Image/video uploads
* 🌐 Social links
* 📄 Pagination
* 🛡️ Security middleware & rate limiting

---

# 🏗️ Tech Stack

| Technology            | Purpose                 |
| --------------------- | ----------------------- |
| Node.js               | Runtime                 |
| Express.js            | REST API                |
| MongoDB               | Database                |
| Mongoose              | ODM                     |
| JWT                   | Authentication          |
| Cookie Parser         | Authentication cookies  |
| bcryptjs              | Password hashing        |
| Zod                   | Input validation        |
| Helmet                | Security headers        |
| CORS                  | Cross-origin protection |
| express-rate-limit    | Rate limiting           |
| Multer                | File uploads            |
| ImageKit              | Media storage           |
| Socket.IO             | Real-time communication |
| Nodemailer            | Email/OTP               |
| Google Gemini / GenAI | AI functionality        |

---

# 📁 Project Structure

```text
backend/
│
├── src/
│   │
│   ├── config/
│   │   └── env.js
│   │
│   ├── controllers/
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── upload.middleware.js
│   │   └── ...
│   │
│   ├── models/
│   │
│   ├── routes/
│   │
│   ├── services/
│   │   ├── notification.service.js
│   │   └── ...
│   │
│   ├── socket.io/
│   │   └── socket.js
│   │
│   ├── utils/
│   │
│   ├── validators/
│   │
│   ├── db/
│   │
│   └── app.js
│
├── server.js
├── package.json
└── .env
```

---

# 🔐 Authentication

Food-AI uses **JWT-based authentication** with HTTP-only cookies.

Authentication flow:

```text
User Login
    ↓
JWT generated
    ↓
HTTP-only Cookie
    ↓
Authenticated Request
    ↓
JWT verification
    ↓
User authorization
```

The backend verifies:

* JWT signature
* JWT expiration
* token blacklist
* user existence
* user role

Sensitive authentication tokens are not exposed unnecessarily to the frontend.

---

# 👤 Roles & Authorization

Food-AI currently supports:

```text
user
chef
```

### User

Users can:

* Browse food/recipes
* Generate AI food ideas
* Cook recipes
* Create social content where permitted
* Like/comment/follow
* Receive notifications
* Manage their profile

### Chef

Chefs can additionally manage chef-specific food/recipe functionality.

### Security Rule

Public registration must **not** allow users to select:

```json
{
  "role": "chef"
}
```

The server must never trust a client-provided privileged role.

Authorization is always enforced server-side.

---

# 📧 Email Verification & OTP

OTP functionality is used for account verification and security-sensitive operations.

Security principles:

* OTP expiration
* OTP hashing where applicable
* OTP verification limits
* resend protection
* old OTP invalidation
* purpose-specific OTP usage

Example flow:

```text
Registration
    ↓
OTP generated
    ↓
Email sent
    ↓
OTP verification
    ↓
Account verified
    ↓
Login allowed
```

---

# 🔑 Password Security

Passwords are hashed using `bcryptjs`.

The backend never stores plaintext passwords.

Password reset follows a controlled token/OTP-based flow and should invalidate previously issued reset credentials after successful use.

---

# 🤖 AI Integration

Food-AI integrates Google's Generative AI capabilities for food-related generation and recreation.

AI functionality can be used to:

* Recreate existing dishes
* Generate new food ideas
* Generate recipe information
* Process user food parameters

AI endpoints are protected against abuse using validation, rate limiting and controlled processing.

API credentials are stored exclusively in environment variables.

---

# 🍲 Recipe System

Recipes are primarily chef-oriented content.

Chef workflow:

```text
Chef
 ↓
Create Recipe
 ↓
Store Recipe
 ↓
Users Discover Recipe
 ↓
User Cooks Recipe
```

Recipe data can contain:

* Food name
* Ingredients
* Description
* Precautions
* Cooking information
* Media
* Chef information

Authorization is enforced server-side for chef-only operations.

---

# 📝 Blog & Social Content

Food-AI provides social content functionality.

Supported interactions include:

* Create posts
* Upload images/videos
* Hashtags
* Likes
* Comments
* Shares
* Saves
* Social links

Supported media is validated before upload.

Media is stored using ImageKit.

---

# 👥 Follow System

Users can follow other users/chefs.

Social relationships support:

```text
User A
   ↓
Follow
   ↓
User B
   ↓
Notification
```

The backend prevents invalid relationships such as self-following and duplicate follows.

---

# 🔔 Notification System

Notifications are stored permanently in MongoDB.

The backend uses a two-layer notification architecture:

```text
                Notification
                     │
             ┌───────┴────────┐
             ↓                ↓
          MongoDB          Socket.IO
          Storage         Real-time
             │                │
             ↓                ↓
       Offline access     Instant UI
```

### Why MongoDB + Socket.IO?

Socket.IO provides instant delivery, but it should never be the only source of notification data.

If the user is offline:

```text
Notification
     ↓
MongoDB ✅
     ↓
User reconnects
     ↓
REST API retrieves notification
```

---

# ⚡ Real-Time Notifications

Food-AI uses **Socket.IO** for real-time notification delivery.

### Connection Architecture

```text
                HTTP Server
                /          \
               /            \
          Express          Socket.IO
             │                 │
          REST APIs       Authenticated
                              User
                               │
                               ↓
                         user:<userId>
```

Socket.IO is attached to the same HTTP server as Express.

---

## 🔐 Socket Authentication

Socket connections are authenticated using the existing JWT authentication mechanism.

The server determines the authenticated user ID from the verified token.

The client must NOT be able to specify another user's ID.

Secure flow:

```text
Socket Connection
       ↓
Read authentication cookie
       ↓
Verify JWT
       ↓
Check blacklist
       ↓
Verify user exists
       ↓
Get authenticated user ID
       ↓
Join user:<userId>
```

This prevents unauthorized users from joining another user's notification room.

---

## 📡 Notification Event

The primary server-to-client event is:

```text
notification:new
```

When a notification is successfully created:

```text
MongoDB
   ↓
Notification.create()
   ↓
Success
   ↓
Socket.IO
   ↓
user:<recipientId>
   ↓
notification:new
```

The notification is saved before it is emitted.

---

# 🌐 REST + Socket.IO

Socket.IO does **not** replace the existing REST notification APIs.

REST is responsible for:

* Fetching notifications
* Pagination
* Unread notifications
* Marking notifications as read
* Deleting notifications
* Initial notification state

Socket.IO is responsible for:

* Instant delivery
* Live notification updates
* Real-time unread count updates
* Real-time UI events

---

# 🛡️ Security

The backend includes multiple security layers.

### Security Middleware

* Helmet
* CORS allowlist
* Rate limiting
* Input validation
* Request sanitization
* JWT authentication
* Token blacklist
* HTTP-only cookies
* Role-based authorization
* Ownership checks
* File validation

### API Security

User-controlled data is validated before processing.

Sensitive operations verify:

```text
Authentication
      +
Authorization
      +
Resource Ownership
```

---

# 📤 File Upload Security

Multer is used for handling uploads.

Uploads are restricted by:

* File size
* MIME type
* File extension
* Supported image/video formats

ImageKit is used for media storage.

The backend does not allow arbitrary executable file uploads.

---

# 🚦 Rate Limiting

Sensitive endpoints use rate limiting to reduce abuse.

Protected areas include:

* Authentication
* Registration
* OTP
* Password reset
* AI generation
* Uploads
* Other abuse-prone endpoints

Limits should be configured according to production traffic requirements.

---

# 📄 Pagination

Large collections use pagination to prevent expensive unrestricted queries.

Pagination is used for resources such as:

* Blogs
* Comments
* Notifications
* Followers
* Following
* Recipes
* AI history

The server enforces maximum page sizes.

---

# 🧹 Error Handling

The backend uses centralized error handling.

Production responses should never expose:

* Stack traces
* Database internals
* File system paths
* Secrets
* API keys
* Authentication tokens

Detailed diagnostic information should remain server-side.

---

# 📝 Logging

The backend uses centralized logging.

Sensitive information must never be logged, including:

```text
Passwords
JWTs
Cookies
OTP
API keys
Reset tokens
Authorization headers
```

Logs should contain useful operational information such as:

* Request ID
* HTTP method
* Route
* Status code
* Duration
* Error category

---

# 🌱 Environment Variables

Create a `.env` file locally.

Example:

```env
PORT=
MONGO_URI=

JWT_KEY=

FRONTEND_URL=

GOOGLE_USER=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=

IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_URL_ENDPOINT=

GOOGLE_GENAI_API_KEY=
```

Never commit `.env`.

Use `.env.example` for variable names only.

---

# 🚀 Installation

Clone the repository:

```bash
git clone https://github.com/AyushIos2005/Food-ai.git
```

Move into backend:

```bash
cd Food-ai/backend
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
.env
```

Add the required environment variables.

---

# ▶️ Run Development Server

```bash
npm run dev
```

or:

```bash
npx nodemon server.js
```

---

# 🏭 Production

Build/configure the backend using production environment variables.

Before deployment verify:

* `NODE_ENV=production`
* Strong JWT secret
* Secure cookies
* Correct CORS origin
* MongoDB production connection
* ImageKit credentials
* Google AI credentials
* Email credentials
* Rate limits
* Logging configuration

Never deploy real secrets inside source code.

---

# 🧪 Security Testing Checklist

Before production deployment, verify:

* [ ] Public registration cannot create a chef account
* [ ] Unverified accounts cannot access protected functionality
* [ ] Invalid JWT is rejected
* [ ] Expired JWT is rejected
* [ ] Blacklisted JWT is rejected
* [ ] Users cannot access another user's private data
* [ ] Users cannot modify/delete another user's content
* [ ] OTP brute force is limited
* [ ] Old OTP cannot be reused
* [ ] Password reset tokens cannot be reused
* [ ] Unsupported uploads are rejected
* [ ] Oversized uploads are rejected
* [ ] AI abuse is rate limited
* [ ] Socket connections are authenticated
* [ ] Users cannot join another user's socket room
* [ ] Notifications are stored before socket emission
* [ ] Offline notifications remain available
* [ ] Multiple tabs receive notifications
* [ ] Logout disconnects the socket
* [ ] REST notification APIs continue working

---

# 📊 Architecture

```text
                    ┌──────────────────┐
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    │                  │
                  REST              Socket.IO
                    │                  │
                    ▼                  ▼
             ┌──────────────┐   ┌──────────────┐
             │   Express    │   │ Authenticated│
             │     API      │   │   Sockets    │
             └──────┬───────┘   └──────┬───────┘
                    │                  │
                    └────────┬─────────┘
                             ▼
                    ┌────────────────┐
                    │    MongoDB     │
                    └────────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
               Persistent         Real-time
               Data Storage       Events
```

---

# 🔮 Future Improvements

Potential future improvements include:

* Redis adapter for Socket.IO horizontal scaling
* Background job queues
* Push notifications
* Advanced recommendation engine
* Distributed rate limiting
* Monitoring/observability
* Automated security testing
* Automated API documentation
* Multi-region deployment

For multi-instance production deployment, a shared Socket.IO adapter such as Redis can be introduced so notifications work across multiple backend instances.

---

# 📌 Development Principles

Food-AI backend follows these principles:

* Security first
* Server-side authorization
* Never trust client roles
* Never expose secrets
* Validate user input
* Persist important data
* Real-time features should complement REST APIs
* Avoid unnecessary architectural changes
* Keep APIs backward compatible
* Fail safely

---

## 👨‍💻 Project

**Food-AI**

Backend focused on intelligent food discovery, recipe generation, social interaction and real-time user experiences.

Built with ❤️ using Node.js, Express, MongoDB and Socket.IO.
