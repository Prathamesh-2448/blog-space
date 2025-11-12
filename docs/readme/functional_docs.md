# Functional Documentation - Blog Space

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [User Roles](#user-roles)
4. [Features & Functionalities](#features--functionalities)
5. [User Workflows](#user-workflows)
6. [Business Rules](#business-rules)
7. [Use Cases](#use-cases)

---

## Introduction

### Purpose
Blog Space is a content management platform designed to facilitate knowledge sharing and content discovery across three key domains: Technology, Travel, and Environment. The platform enables content creators to publish and manage their blog posts while providing readers with an intuitive way to discover, read, and save their favorite content.

### Target Audience
- **Content Creators**: Bloggers, writers, and subject matter experts who want to share knowledge
- **Readers**: Anyone interested in Technology, Travel, or Environment topics
- **Organizations**: Can be used for internal knowledge sharing or public content distribution

### Scope
The platform supports:
- User registration and authentication
- Blog creation, editing, and deletion
- Content categorization and discovery
- Social features (favorites)
- Search and filtering capabilities

---

## System Overview

### Platform Categories
Blog Space organizes content into three main categories:

1. **Technology**

2. **Travel**

3. **Environment**

### Key Capabilities
- **Content Management**: Create, read, update, and delete blog posts
- **User Management**: Registration, authentication, and authorization
- **Discovery**: Browse, search, and filter content
- **Engagement**: Save favorite blogs for later reading
- **Media Support**: Include images in blog posts



## User Roles

### 1. Guest Users (Not Logged In)

**Capabilities:**
- Browse all published blogs
- View blog details
- Filter blogs by category
- Search blogs by title, author, or category
- View author information

**Restrictions:**
- Cannot create blogs
- Cannot save favorites
- Cannot edit or delete content

**Use Case:**
Ideal for casual readers who want to explore content without commitment.

---

### 2. Registered Users (Readers)

**Capabilities:**
All guest capabilities, plus:
- Save blogs to favorites
- Access personalized favorites list
- Remove blogs from favorites

**Restrictions:**
-  Cannot create blogs
-  Cannot edit or delete blogs

**Registration Requirements:**
- First name
- Last name
- Email address (unique)
- Strong password (8+ chars, uppercase, lowercase, number, special character)

**Use Case:**
Perfect for regular readers who want to bookmark interesting content for later.

---

### 3. Content Creators (Bloggers)

**Capabilities:**
All reader capabilities, plus:
- Create new blog posts
- Edit own blog posts
- Delete own blog posts
- Add images to blogs
- View favorite counts on own blogs
- Manage all own content

**Restrictions:**
- Cannot edit or delete other users' blogs
- Cannot add blogs to favorites (creators cannot favorite)

**Registration Requirements:**
All user requirements, plus:
- Must select a primary blogging category (Technology, Travel, or Environment)

**Use Case:**
Subject matter experts who want to share knowledge and build an audience.

---

## Features & Functionalities

### 1. User Authentication

#### Registration
**Process:**
1. User clicks "Register" in navigation
2. Fills out registration form:
   - First Name
   - Last Name
   - Email (must be unique)
   - Password (validated for strength)
   - User Type (Reader or Creator)
   - Category (only if Creator)
3. System validates input:
   - Email uniqueness check
   - Password strength validation
   - Required field validation
4. Password is hashed using bcrypt
5. User record created in database
6. Redirected to login page

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Category Selection Logic:**
- Category field is hidden by default
- Only visible when "Creator" is selected as user type
- Required for creators, not applicable for readers

#### Login
**Process:**
1. User enters email and password
2. System verifies credentials:
   - Checks if user exists
   - Compares hashed password
3. If successful:
   - JWT token generated (24-hour validity)
   - Token stored in HTTP-only cookie
   - User redirected to home page
   - Navigation updates to show user-specific options
4. If failed:
   - Error message displayed
   - User remains on login page

#### Logout
**Process:**
1. User clicks "Logout" button
2. System clears authentication cookie
3. Navigation updates to guest state
4. User remains on current page

---

### 2. Blog Management

#### Creating a Blog (Creators Only)

**Access:** Hero Section → Create Blog button (visible only to creators)

**Process:**
1. User fills in blog details:
   - **Title**: Blog headline (required, max 255 characters)
   - **Category**: Technology, Travel, or Environment (required)
   - **Content**: Main blog text (required, supports line breaks)
   - **Images**: Optional, multiple images supported
2. Image handling:
   - Users can select multiple images from their device
   - Each image converted to Base64 format
   - Preview shown before submission
   - Images can be removed before saving
   - 5MB size limit per image
3. User clicks "Save Blog"
4. System validates all fields
5. Blog saved to database with:
   - Author ID (from logged-in user)
   - Current timestamp
   - Images stored in separate table with order
6. User redirected to home page
7. New blog appears in blog list

**Validation:**
- All required fields must be filled
- Title cannot exceed 255 characters
- Must select a valid category
- Images must be under 5MB each

**Unsaved Changes Warning:**
- System tracks if user makes any changes
- If user tries to leave page without saving, warning dialog appears
- User can choose to stay and save, or discard changes

---

#### Viewing a Blog

**Access:** Click on any blog card from home page or category view

**Display:**
- Blog title (large, prominent)
- Category badge (color-coded by category)
- Author name
- Publication date
- Favorite count (if viewing own blog as creator)
- Full content with preserved formatting
- All images displayed in order (proper aspect ratio maintained)
- Action buttons (based on user role)

**Actions Available:**
- **For Author**: Edit and Delete buttons
- **For Readers**: Add/Remove Favorite button
- **For Guests**: No action buttons (read-only)

---

#### Editing a Blog (Authors Only)

**Access:** 
1. View your own blog
2. Click "Edit" button
3. Redirected to blog editor with pre-filled data

**Process:**
1. Form loads with existing blog data:
   - Title
   - Category
   - Content
   - Existing images displayed
2. User can modify any field
3. Can remove existing images
4. Can add new images
5. System tracks changes
6. User clicks "Save Blog"
7. Blog updated in database
8. Images table updated (old images deleted, new ones added)
9. User redirected to blog view page

**Security:**
- Only blog author can edit their own blogs
- System verifies author ID before allowing edits
- Unauthorized attempts result in error

---

#### Deleting a Blog (Authors Only)

**Process:**
1. User views their own blog
2. Clicks "Delete" button
3. Confirmation dialog appears: "Are you sure you want to delete this blog? This action cannot be undone."
4. If confirmed:
   - Blog deleted from database
   - Associated images automatically deleted (CASCADE)
   - Associated favorites automatically deleted (CASCADE)
   - User redirected to home page
5. If cancelled:
   - No action taken
   - User remains on blog view page

**Security:**
- Only blog author can delete their own blogs
- Cascading deletion ensures data consistency

---

### 3. Content Discovery

#### Browsing All Blogs

**Home Page Display:**
- Shows all blogs in grid layout
- Blogs sorted by creation date (newest first)
- Each blog card shows:
  - Category badge (color-coded)
  - Title
  - Excerpt (first 150 characters)
  - Author name
  - Favorite count
  - Featured image (if available)
- Responsive grid: 3 columns on desktop, 2 on tablet, 1 on mobile

#### Category Filtering

**Access:** Click category name in navigation (Technology, Travel, Environment)

**Behavior:**
1. Navigation item highlighted
2. Hero section updates with category name
3. Only blogs from selected category displayed
4. All other blog functionality remains the same
5. Click "Home" to return to all blogs

**Example:**
- Click "Technology" → Shows only Technology blogs
- Hero displays: "Technology Blogs - Explore the latest blogs about Technology"

---

#### Search Functionality

**Access:** Search box in navigation (visible on all pages)

**Search Capabilities:**
Users can search by:
- **Blog Title**: Partial match (case-insensitive)
- **Author Name**: First or last name (partial match)
- **Category**: Exact match

**Process:**
1. User types search query
2. Clicks search button or presses Enter
3. System searches all three fields simultaneously
4. Results displayed in same grid format
5. Hero updates: "Search Results - Results for '[query]'"
6. If no results: "No blogs found" message displayed

**Examples:**
- Search "Node" → Finds blogs with "Node" in title or author name
- Search "John" → Finds blogs by authors named John
- Search "Travel" → Finds all Travel blogs

---

### 4. Favorites System (Readers Only)

#### Adding to Favorites

**Process:**
1. Reader views a blog
2. Clicks "Add to Favorites" button (🤍)
3. System:
   - Verifies user is logged in
   - Creates favorite record in database
   - Updates button to "Remove from Favorites" (❤️)
   - Shows success message
4. If already favorited: "Already in favorites" message

**Constraints:**
- Only readers can add favorites
- Creators cannot favorite any blogs (including their own)
- Must be logged in
- Cannot favorite the same blog twice

---

#### Viewing Favorites

**Access:** Navigation → "Favorites" link (visible only to logged-in readers)

**Display:**
1. Shows all blogs user has favorited
2. Sorted by favorite date (most recent first)
3. Same card layout as home page
4. Hero displays: "My Favorites - Your saved blog posts"
5. If no favorites: "No favorites yet. Start adding blogs to your favorites!"

---

#### Removing from Favorites

**Process:**
1. Reader views a favorited blog
2. Button shows "Remove from Favorites" (❤️)
3. Clicks button
4. System:
   - Deletes favorite record
   - Updates button to "Add to Favorites" (🤍)
   - Shows success message
5. Blog removed from favorites list

---

### 5. My Blogs (Creators Only)

**Access:** Navigation → "My Blogs" link (visible only to creators)

**Display:**
1. Shows only blogs created by logged-in user
2. Sorted by creation date (newest first)
3. Each blog card shows favorite count
4. Hero displays: "My Blogs - Manage your blog posts"
5. If no blogs: "No blogs found. Be the first to create one!"

**Purpose:**
- Creators can easily manage their content
- See engagement metrics (favorite counts)
- Quick access to edit/delete own blogs

---

## User Workflows

### Workflow 1: New User Registration and First Blog

**Scenario:** Sarah wants to share her travel experiences

1. Sarah visits Blog Space
2. Clicks "Register"
3. Fills form:
   - First Name: Sarah
   - Last Name: Johnson
   - Email: sarah@example.com
   - Password: Travel@2024
   - User Type: Creator
   - Category: Travel
4. Submits and redirected to login
5. Logs in with credentials
6. Navigation now shows "Create Blog" and "My Blogs"
7. Clicks "Create Blog"
8. Fills in blog:
   - Title: "10 Hidden Gems in Bali"
   - Category: Travel
   - Content: Detailed travel guide
   - Adds 3 images from recent trip
9. Reviews preview
10. Clicks "Save Blog"
11. Blog published and visible to everyone
12. Sarah sees it on home page and in "My Blogs"

---

### Workflow 2: Reader Finding and Saving Favorite Blogs

**Scenario:** Mike wants to learn about climate change

1. Mike visits Blog Space (not logged in)
2. Browses home page, sees various blogs
3. Clicks "Environment" in navigation
4. Sees only Environment-related blogs
5. Finds interesting blog: "Climate Change Solutions"
6. Clicks to read full blog
7. Wants to save it for later
8. Clicks "Add to Favorites" → Prompted to login
9. Clicks "Register" and creates account:
   - User Type: Reader (no category needed)
10. After registration, logs in
11. Navigates back to the blog
12. Clicks "Add to Favorites" successfully
13. Continues browsing, adds 2 more blogs to favorites
14. Clicks "Favorites" in navigation
15. Sees all 3 saved blogs
16. Can return anytime to read them

---

### Workflow 3: Creator Editing Published Blog

**Scenario:** John notices a typo in his tech blog

1. John logs in as creator
2. Clicks "My Blogs" in navigation
3. Sees list of all his blogs
4. Clicks on "Introduction to Node.js" blog
5. Notices typo in content
6. Clicks "Edit" button
7. Editor loads with existing content
8. John fixes the typo
9. Decides to add one more image
10. Selects new image
11. Reviews changes
12. Clicks "Save Blog"
13. Warning appears: "You have unsaved changes..."
14. Confirms save
15. Blog updated successfully
16. Views updated blog with correction

---

### Workflow 4: Guest User Exploring Content

**Scenario:** Anonymous visitor exploring the platform

1. Visitor lands on Blog Space home page
2. Sees all blogs in grid layout
3. Interested in technology content
4. Clicks "Technology" in navigation
5. Sees filtered results
6. Uses search: types "JavaScript"
7. Finds relevant blogs
8. Clicks on "Modern JavaScript Patterns"
9. Reads full blog with images
10. Enjoys content
11. Tries to favorite → Sees "Please login to add favorites"
12. Decides to register
13. Creates account as Reader
14. Now can save favorites for future reading

---

## Business Rules

### Authentication Rules
1. Email addresses must be unique across all users
2. Passwords must meet strength requirements (8+ chars, mixed case, number, special char)
3. JWT tokens expire after 24 hours
4. Users must re-login after token expiration
5. Logout clears all authentication cookies

### User Role Rules
1. Creators must select one primary blogging category during registration
2. Regular users do not need to select a category
3. User type (Creator vs User) cannot be changed after registration
4. Each user can only have one account per email address

### Blog Management Rules
1. Only creators can create blogs
2. Blogs must have title, category, and content
3. Images are optional but recommended
4. Each image must be under 5MB
5. Multiple images allowed per blog
6. Blog titles limited to 255 characters
7. Blogs are immediately published (no draft state)
8. Only blog authors can edit or delete their blogs
9. Editing requires all fields to be re-validated
10. Deleting blogs also deletes associated images and favorites

### Favorites Rules
1. Only regular users (readers) can add favorites
2. Creators cannot add any blogs to favorites
3. Users cannot favorite the same blog twice
4. Removing a favorite is permanent (can be re-added later)
5. Deleting a blog removes it from all users' favorites

### Content Discovery Rules
1. All published blogs are immediately visible to everyone
2. Category filtering is mutually exclusive (show one category at a time)
3. Search queries check title, author name, and category simultaneously
4. Search is case-insensitive
5. Partial matches are allowed for search
6. Empty search shows all blogs

### Data Integrity Rules
1. Deleting a user deletes all their blogs (CASCADE)
2. Deleting a blog deletes all its images (CASCADE)
3. Deleting a blog removes it from all favorites lists (CASCADE)
4. Author information is always displayed with blogs
5. Favorite counts are calculated in real-time

---

## Use Cases

### Use Case 1: Technology Blogger Sharing Tutorial

**Actor:** Tech Creator (Alex)
**Goal:** Share a programming tutorial with code examples
**Precondition:** Alex is registered and logged in as creator

**Main Flow:**
1. Alex clicks "Create Blog"
2. Enters title: "Building REST APIs with Express.js"
3. Selects category: Technology
4. Writes detailed tutorial with code examples
5. Adds 2 screenshots showing code implementation
6. Reviews content
7. Clicks "Save Blog"
8. Blog published successfully

**Postcondition:** Tutorial is visible to all users, searchable, and can be favorited

---

### Use Case 2: Travel Enthusiast Planning Trip

**Actor:** Reader (Maria)
**Goal:** Find and save travel blogs about Japan
**Precondition:** Maria is registered and logged in

**Main Flow:**
1. Maria clicks "Travel" category
2. Uses search: "Japan"
3. Finds 5 relevant blogs
4. Reads "Tokyo Travel Guide"
5. Clicks "Add to Favorites"
6. Repeats for 2 more blogs
7. Clicks "Favorites" to review saved blogs
8. Now has personal collection for trip planning

**Postcondition:** Maria has 3 Japan-related blogs saved for reference

---

### Use Case 3: Environmental Activist Updating Article

**Actor:** Environment Creator (Lisa)
**Goal:** Update blog with latest climate data
**Precondition:** Lisa has existing blog about climate change

**Main Flow:**
1. Lisa clicks "My Blogs"
2. Opens "2024 Climate Report Summary"
3. Clicks "Edit"
4. Updates statistics with latest data
5. Adds new infographic image
6. Removes outdated chart
7. Clicks "Save Blog"
8. Updated version published

**Postcondition:** Blog shows latest information, old image removed

---

### Use Case 4: Guest Discovering Platform

**Actor:** Guest User (Tom)
**Goal:** Explore content before deciding to register
**Precondition:** Tom visits site for first time

**Main Flow:**
1. Tom lands on home page
2. Browses various blogs
3. Clicks on interesting tech blog
4. Reads full content
5. Tries to favorite → Sees login prompt
6. Decides to register as Creator
7. Selects Technology as category
8. Registration complete
9. Can now create own tech blogs

**Postcondition:** Tom is registered and ready to contribute content

---

## Summary

Blog Space provides a comprehensive blogging platform with clear role-based functionality. The system balances simplicity for casual users with powerful features for content creators, all while maintaining a clean, intuitive user experience. The three-category focus (Technology, Travel, Environment) provides structure without limiting creativity, and the favorites system enables readers to build personalized content libraries.
