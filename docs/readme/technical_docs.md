# Technical Documentation - Blog Space

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [API Documentation](#api-documentation)
5. [Authentication & Security](#authentication--security)
6. [File Structure](#file-structure)
7. [Code Organization](#code-organization)
8. [Image Storage](#image-storage)
9. [Future Improvements](#future-improvements)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Client Browser                    │
│              (HTML, CSS, JavaScript)                │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP/HTTPS
                   │ RESTful API
┌──────────────────▼─────────────────────────────────┐
│                 Express.js Server                  │
│  ┌─────────────────────────────────────────────┐   │
│  │          Middleware Layer                   │   │
│  │  • Authentication (JWT)                     │   │
│  │  • Body Parser                              │   │
│  │  • Cookie Parser                            │   │
│  │  • Static File Serving                      │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │          Routing Layer                      │   │
│  │  • /api/auth                                │   │
│  │  • /api/blogs                               │   │
│  │  • /api/favorites                           │   │
│  └─────────────────────────────────────────────┘   │
└──────────────────┬─────────────────────────────────┘
                   │ SQL Queries
┌──────────────────▼───────────────────────────────────┐
│                  MySQL Database                      │
│  • users                                             │
│  • blogs                                             │
│  • blog_images                                       │
│  • favorites                                         │
└──────────────────────────────────────────────────────┘
```

### Request-Response Flow

```
1. User Action (Browser)
   ↓
2. JavaScript Event Handler
   ↓
3. Fetch API Call (AJAX)
   ↓
4. Express Route Handler
   ↓
5. Authentication Middleware (if required)
   ↓
6. Database Query (MySQL)
   ↓
7. JSON Response
   ↓
8. JavaScript Updates DOM
   ↓
9. User Sees Updated UI
```

### Architecture Pattern

**Model-View-Controller (MVC) Inspired:**
- **Model**: Database schemas and queries (`config/database.js`, SQL tables)
- **View**: HTML templates (`views/` folder)
- **Controller**: Route handlers (`routes/` folder)
- **Middleware**: Authentication, parsing (`middleware/` folder)

---

## Technology Stack

### Backend Technologies

#### Node.js v18+
**Role:** JavaScript runtime environment

**Why Node.js:**
- ✅ JavaScript on both frontend and backend (consistency)
- ✅ Non-blocking I/O for handling multiple requests efficiently
- ✅ Large ecosystem (npm packages)
- ✅ Excellent for I/O-heavy applications
- ✅ Fast development cycle

**Node.js Specific Features Used:**
- `require()` - Module system
- `process.env` - Environment variables
- Async/await - Asynchronous operations
- Event-driven architecture

#### Express.js v4.18+
**Role:** Web application framework

**Why Express:**
- ✅ Minimalist and flexible
- ✅ Robust routing system
- ✅ Middleware support
- ✅ Large community and documentation
- ✅ Easy to learn and implement

**Express Features Used:**
- Routing (`app.get()`, `router.post()`)
- Middleware (`app.use()`)
- Request/response enhancements (`req.body`, `res.json()`)
- Static file serving

#### MySQL v8.0+
**Role:** Relational database

**Why MySQL:**
- ✅ Reliable and mature technology
- ✅ ACID compliance (data integrity)
- ✅ Excellent for structured data
- ✅ Strong referential integrity (foreign keys)
- ✅ Good performance for read-heavy applications
- ✅ Wide hosting support

**MySQL Features Used:**
- Foreign keys with CASCADE delete
- Transactions (implicit through mysql2)
- Indexing on primary and foreign keys
- Text types (VARCHAR, TEXT, LONGTEXT)

### Supporting Libraries

#### mysql2 v3.0+
- Promise-based MySQL driver
- Prepared statements (SQL injection prevention)
- Connection pooling for performance

#### bcryptjs v2.4+
- Password hashing (10 salt rounds)
- Secure password verification
- Protection against rainbow table attacks

#### jsonwebtoken v9.0+
- JWT token generation
- Token verification
- 24-hour token expiration

#### cookie-parser v1.4+
- Parse cookies from requests
- Enable HTTP-only cookies
- Secure session management

#### dotenv v16.0+
- Environment variable management
- Secure credential storage
- Configuration isolation

### Frontend Technologies

#### HTML5
- Semantic markup
- Form validation attributes
- Modern input types

#### CSS3
- Flexbox for layouts
- CSS Grid for blog cards
- Media queries for responsiveness
- CSS Variables for theming
- Transitions and animations

#### JavaScript (ES6+)
- Fetch API for AJAX requests
- Async/await for promises
- Arrow functions
- Template literals
- Destructuring
- Modules (not bundled, vanilla JS)

---

## Database Design

### Entity-Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ user_id (PK)    │──┐
│ first_name      │  │
│ last_name       │  │
│ email (UNIQUE)  │  │
│ password_hash   │  │
│ user_type       │  │
│ category        │  │
│ created_at      │  │
└─────────────────┘  │
                     │
         ┌───────────┴──────────────┬──────────────────┐
         │                          │                  │
         │ 1:N                      │ 1:N              │
         │                          │                  │
┌────────▼────────┐        ┌────────▼────────┐        │
│     BLOGS       │        │   FAVORITES     │        │
├─────────────────┤        ├─────────────────┤        │
│ blog_id (PK)    │──┐     │ favorite_id (PK)│        │
│ title           │  │     │ user_id (FK)    │        │
│ content         │  │     │ blog_id (FK)    │        │
│ category        │  │     │ created_at      │        │
│ author_id (FK)  │  │     └─────────────────┘        │
│ created_at      │  │                                 │
│ updated_at      │  │                                 │
└─────────────────┘  │                                 │
                     │ 1:N                             │
                     │                                 │
            ┌────────▼────────┐                        │
            │  BLOG_IMAGES    │                        │
            ├─────────────────┤                        │
            │ image_id (PK)   │                        │
            │ blog_id (FK)    │                        │
            │ image_data      │                        │
            │ image_order     │                        │
            └─────────────────┘                        │
                                                        │
                  (Favorites also references blogs)────┘
```

### Table Schemas

#### Users Table
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('creator', 'user') NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Indexes:**
- Primary key on `user_id`
- Unique index on `email` (enforces uniqueness, speeds up login queries)

**Design Decisions:**
- `user_type` ENUM ensures data consistency
- `category` nullable (only for creators)
- `password_hash` VARCHAR(255) sufficient for bcrypt output
- `email` indexed for fast authentication lookups

---

#### Blogs Table
```sql
CREATE TABLE blogs (
    blog_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('Technology', 'Travel', 'Environment') NOT NULL,
    author_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

**Indexes:**
- Primary key on `blog_id`
- Foreign key on `author_id`

**Design Decisions:**
- `category` ENUM prevents invalid categories
- `TEXT` type for content (up to 65,535 characters)
- `ON DELETE CASCADE` removes blogs when user deleted
- `updated_at` auto-updates on modifications

---

#### Blog_Images Table
```sql
CREATE TABLE blog_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    blog_id INT NOT NULL,
    image_data LONGTEXT NOT NULL,
    image_order INT DEFAULT 0,
    FOREIGN KEY (blog_id) REFERENCES blogs(blog_id) ON DELETE CASCADE
);
```

**Indexes:**
- Primary key on `image_id`
- Foreign key on `blog_id`

**Design Decisions:**
- `LONGTEXT` stores up to 4GB (Base64 images)
- `image_order` maintains image sequence
- `ON DELETE CASCADE` removes images when blog deleted
- Separate table for normalization (1:N relationship)

---

#### Favorites Table
```sql
CREATE TABLE favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    blog_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (blog_id) REFERENCES blogs(blog_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, blog_id)
);
```

**Indexes:**
- Primary key on `favorite_id`
- Foreign keys on `user_id` and `blog_id`
- Unique composite index on `(user_id, blog_id)`

**Design Decisions:**
- Junction table for many-to-many relationship
- `UNIQUE KEY` prevents duplicate favorites
- `ON DELETE CASCADE` on both foreign keys
- `created_at` tracks when favorited (for sorting)

### Database Relationships

**1. Users → Blogs (1:N)**
- One user can create many blogs
- Each blog has exactly one author
- Cascade delete: Delete user → Delete all their blogs

**2. Blogs → Blog_Images (1:N)**
- One blog can have multiple images
- Each image belongs to one blog
- Cascade delete: Delete blog → Delete all its images

**3. Users ↔ Blogs (M:N via Favorites)**
- One user can favorite many blogs
- One blog can be favorited by many users
- Cascade delete both directions

### Query Optimization

**Indexed Columns:**
- `users.email` - Fast login lookups
- `users.user_id` - Primary key index (automatic)
- `blogs.blog_id` - Primary key index
- `blogs.author_id` - Foreign key index (automatic)
- `favorites.user_id` - Foreign key index
- `favorites.blog_id` - Foreign key index

**Composite Index:**
- `favorites(user_id, blog_id)` - Fast duplicate checks

**Query Strategies:**
- JOIN operations for blog listings with author info
- Subquery for favorite counts
- Parameterized queries prevent SQL injection

---

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Routes

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Strong@123",
  "userType": "creator",
  "category": "Technology"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": 1
}
```

**Validation:**
- Email must be unique
- Password: 8+ chars, uppercase, lowercase, number, special char
- Category required only if userType is "creator"

---

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Strong@123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "userId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "userType": "creator",
    "category": "Technology"
  }
}
```

**Sets Cookie:**
```
token=<JWT_TOKEN>; HttpOnly; Max-Age=86400
```

---

#### Logout
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Clears Cookie:** Removes authentication token

---

#### Check Authentication
```http
GET /api/auth/check
```

**Response (200) - Authenticated:**
```json
{
  "authenticated": true,
  "user": {
    "userId": 1,
    "firstName": "John",
    "lastName": "Doe",
    "userType": "creator",
    "category": "Technology"
  }
}
```

**Response (200) - Not Authenticated:**
```json
{
  "authenticated": false
}
```

---

### Blog Routes

#### Get All Blogs
```http
GET /api/blogs?category=Technology&search=node&authorId=1
```

**Query Parameters:**
- `category` (optional): Filter by category
- `search` (optional): Search in title, author name
- `authorId` (optional): Filter by author

**Response (200):**
```json
[
  {
    "blog_id": 1,
    "title": "Introduction to Node.js",
    "content": "Blog content...",
    "category": "Technology",
    "author_id": 1,
    "created_at": "2024-11-10T10:00:00.000Z",
    "updated_at": "2024-11-10T10:00:00.000Z",
    "first_name": "John",
    "last_name": "Doe",
    "favorite_count": 5
  }
]
```

---

#### Get Single Blog
```http
GET /api/blogs/:id
```

**Response (200):**
```json
{
  "blog_id": 1,
  "title": "Introduction to Node.js",
  "content": "Full blog content...",
  "category": "Technology",
  "author_id": 1,
  "created_at": "2024-11-10T10:00:00.000Z",
  "updated_at": "2024-11-10T10:00:00.000Z",
  "first_name": "John",
  "last_name": "Doe",
  "favorite_count": 5,
  "images": [
    "data:image/png;base64,iVBORw0KGgo..."
  ]
}
```

---

#### Create Blog
```http
POST /api/blogs
```
**Authentication Required:** Creator only

**Request Body:**
```json
{
  "title": "My New Blog",
  "content": "Blog content here...",
  "category": "Technology",
  "images": [
    "data:image/png;base64,..."
  ]
}
```

**Response (201):**
```json
{
  "message": "Blog created successfully",
  "blogId": 1
}
```

---

#### Update Blog
```http
PUT /api/blogs/:id
```
**Authentication Required:** Author only

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "category": "Technology",
  "images": []
}
```

**Response (200):**
```json
{
  "message": "Blog updated successfully"
}
```

---

#### Delete Blog
```http
DELETE /api/blogs/:id
```
**Authentication Required:** Author only

**Response (200):**
```json
{
  "message": "Blog deleted successfully"
}
```

---

### Favorites Routes

#### Add to Favorites
```http
POST /api/favorites
```
**Authentication Required:** User (reader) only

**Request Body:**
```json
{
  "blogId": 1
}
```

**Response (201):**
```json
{
  "message": "Added to favorites"
}
```

---

#### Remove from Favorites
```http
DELETE /api/favorites/:blogId
```
**Authentication Required:** Yes

**Response (200):**
```json
{
  "message": "Removed from favorites"
}
```

---

#### Get User's Favorites
```http
GET /api/favorites
```
**Authentication Required:** Yes

**Response (200):**
```json
[
  {
    "blog_id": 1,
    "title": "Blog Title",
    "content": "Content...",
    "category": "Technology",
    "author_id": 2,
    "first_name": "Jane",
    "last_name": "Smith",
    "favorited_at": "2024-11-11T15:30:00.000Z"
  }
]
```

---

#### Check if Blog is Favorited
```http
GET /api/favorites/check/:blogId
```
**Authentication Required:** Yes

**Response (200):**
```json
{
  "isFavorited": true
}
```

---

## Authentication & Security

### JWT Implementation

**Token Generation:**
```javascript
const token = jwt.sign(
    { 
        userId: user.user_id, 
        email: user.email, 
        userType: user.user_type,
        category: user.category 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
);
```

**Token Storage:**
- Stored in HTTP-only cookie
- Not accessible via JavaScript (XSS protection)
- Sent automatically with each request

**Token Verification:**
```javascript
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied' });
    }
    
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token' });
    }
};
```

### Password Security

**Hashing:**
```javascript
const salt = await bcrypt.genSalt(10);
const passwordHash = await bcrypt.hash(password, salt);
```

**Verification:**
```javascript
const validPassword = await bcrypt.compare(password, user.password_hash);
```

**Strength Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Regex:**
```javascript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
```

### SQL Injection Prevention

**Parameterized Queries:**
```javascript
// ✅ Safe - Parameterized
await db.query('SELECT * FROM users WHERE email = ?', [email]);

// ❌ Unsafe - String concatenation
await db.query('SELECT * FROM users WHERE email = ' + email);
```

### XSS Protection

**Output Escaping (Frontend):**
```javascript
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

**Input Validation:**
- Server-side validation of all inputs
- Type checking (ENUM for categories)
- Length limits on fields

### CORS & Headers

**Current Setup:**
- Same-origin policy (frontend and backend on same domain)
- No CORS needed for current architecture

**For Production:**
```javascript
const cors = require('cors');
app.use(cors({
    origin: 'https://yourdomain.com',
    credentials: true
}));
```

---

## File Structure

```
blog-space/
│
├── config/
│   └── database.js              # MySQL connection pool
│
├── middleware/
│   └── auth.js                  # JWT authentication middleware
│
├── routes/
│   ├── auth.js                  # Authentication endpoints
│   ├── blogs.js                 # Blog CRUD endpoints
│   └── favorites.js             # Favorites endpoints
│
├── public/
│   ├── css/
│   │   └── style.css            # Main stylesheet (responsive)
│   ├── js/
│   │   ├── main.js              # Home page logic
│   │   ├── auth.js              # Login/register logic
│   │   ├── blog-editor.js       # Blog creation/editing
│   │   └── blog-view.js         # Blog viewing logic
│   └── images/
│       └── (user uploaded images stored as Base64 in DB)
│
├── views/
│   ├── index.html               # Home page
│   ├── login.html               # Login form
│   ├── register.html            # Registration form
│   ├── create-blog.html         # Blog editor
│   └── blog-view.html           # Single blog view
│
├── .env                         # Environment variables (not committed)
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies
├── server.js                    # Main application entry point
│
└── docs/                        # Documentation (optional)
    ├── README.md
    ├── FUNCTIONAL_DOCUMENTATION.md
    ├── TECHNICAL_DOCUMENTATION.md
    └── SETUP_GUIDE.md
```

---

## Code Organization

### Separation of Concerns

**Backend:**
- **config/** - Database and external service configurations
- **middleware/** - Reusable middleware functions
- **routes/** - API endpoint definitions (controllers)
- **server.js** - Application bootstrap and configuration

**Frontend:**
- **views/** - HTML templates (presentation)
- **public/css/** - Styling (appearance)
- **public/js/** - Client-side logic (behavior)

### Module Pattern

**Backend Modules:**
```javascript
// Each route file exports a router
const router = express.Router();
// ... route definitions
module.exports = router;

// Imported in server.js
app.use('/api/auth', require('./routes/auth'));
```

**Frontend Modules:**
```javascript
// Each JS file is self-contained
// Global variables minimized
// Functions scoped appropriately
```

### Error Handling

**Backend:**
```javascript
try {
    // Database operation
    const [result] = await db.query('...');
    res.json(result);
} catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
}
```

**Frontend:**
```javascript
try {
    const response = await fetch('/api/blogs');
    const data = await response.json();
    // Handle data
} catch (error) {
    console.error('Error:', error);
    alert('Failed to load blogs');
}
```

## Image Storage

### Current Implementation: Base64 in Database

**How it Works:**

1. **User Selects Image (Client):**
```javascript
const file = document.getElementById('images').files[0];
const reader = new FileReader();
reader.readAsDataURL(file);  // Converts to Base64
reader.onload = () => {
    const base64 = reader.result;  // "data:image/png;base64,..."
    selectedImages.push(base64);
};
```

2. **Send to Server:**
```javascript
fetch('/api/blogs', {
    method: 'POST',
    body: JSON.stringify({
        title: "...",
        images: ["data:image/png;base64,iVBORw0..."]
    })
});
```

3. **Store in Database:**
```javascript
await db.query(
    'INSERT INTO blog_images (blog_id, image_data) VALUES (?, ?)',
    [blogId, base64String]  // Stored as LONGTEXT
);
```

4. **Retrieve and Display:**
```javascript
const [images] = await db.query('SELECT image_data FROM blog_images WHERE blog_id = ?', [id]);
// Send back to client
res.json({ images: images.map(img => img.image_data) });

// Display in HTML
<img src="data:image/png;base64,iVBORw0..." />
```

### Advantages
Simple implementation  
No file system management  
Everything in database  
Easy backup and restore  
No broken file paths  

### Disadvantages
33% size increase (Base64 overhead)  
Database bloat  
Slower queries for large images  
Not scalable for production  
Memory intensive  

## 🧭 Future Improvements

- **Pagination**
  - Limit the number of blogs displayed per page (e.g., 12 blogs)
  - Add “Load More” button or page number navigation
  - Improve performance for large datasets

- **Rich Text Editor**
  - Integrate a modern editor like Quill.js or TinyMCE
  - Support text formatting (bold, italic, lists, hyperlinks)
  - Enhance overall content creation experience

- **Email Verification**
  - Send verification email upon registration
  - Activate accounts via secure email link
  - Prevent fake or spam registrations

- **Password Reset**
  - Implement “Forgot Password” functionality
  - Send password reset link with unique token
  - Ensure secure and time-bound password update flow

- **Profile Pages**
  - Add user profile with bio and avatar
  - Display all blogs created by the user
  - Enable profile editing and customization

- **Comments System**
  - Allow users to comment on blog posts
  - Support threaded discussions and replies
  - Include like/dislike or reaction options

- **Tags & Advanced Filtering**
  - Add tags for blogs (e.g., `#javascript`, `#travel`)
  - Enable filtering and searching by multiple tags
  - Include tag cloud for better content discovery

- **Social Sharing**
  - Allow sharing blogs to platforms like Twitter, Facebook, and LinkedIn
  - Implement Open Graph meta tags for better previews
  - Track and display share counts or engagement stats

- **User Analytics**
  - Provide dashboard for content creators
  - Track blog view counts and favorites
  - Display user engagement metrics and insights

- **Draft System**
  - Allow saving blogs as drafts
  - Enable scheduling of future publications
  - Provide preview before publishing

- **Migration to Cloud Storage**
  - Move image and media storage to AWS S3, Google Cloud, or Cloudinary
  - Optimize storage and retrieval performance
  - Reduce load on the main database and improve scalability
