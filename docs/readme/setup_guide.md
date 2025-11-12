# Blog-Space Server Setup Guide

This document provides instructions on how to set up and run the Node.js backend server for the Blog-Space application.

---

## Prerequisites

Before you begin, ensure you have the following software installed on your system:
* **Node.js** (which includes **npm**)
* **MySQL Server**

---

## 1. Installation

First, clone the repository to your local machine and install the required Node.js dependencies.

```bash
# 1. Clone the repository
git clone [https://github.com/Prathamesh-2448/blog-space.git](https://github.com/Prathamesh-2448/blog-space.git)

# 2. Navigate into the project directory
cd blog-space

# 3. Install all required packages
npm install
```
## 2. Database Setup
This application requires a MySQL database.

1. Start your MySQL server.

2. Create a new database for the project. You can name it anything (e.g., ```blog_space_db```).
```sql
CREATE DATABASE blog_space_db;
```

3. Create the required tables. Based on the application's architecture, you must create the following tables. You will need to define the specific columns (schema) for each table based on your application's logic.

- ```users```
- ```blogs```
- ```blog_images```
- ```favorites```

## 3. Environment Variables
The server connects to the database and manages authentication using environment variables.

1. Create a new file named .env in the root of the blog-space directory.

2. Add the following variables to your ```.env``` file, replacing the placeholder values with your actual database credentials. 

```env
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=blog_space_db

JWT_SECRET=your_super_strong_and_secret_key
```
```DB_NAME``` must match the database you created in step 2.

```JWT_SECRET``` is a private key used for signing authentication tokens. Make it a long, random, and strong string.

## Running the Application
Once installed and configured, you can run the server.
- For Development (with auto-reload): This command typically uses nodemon (Listed in package.json) to automatically restart the server when files change.

```
npm run dev
```