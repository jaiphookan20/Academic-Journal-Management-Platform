# Academic Journal Management Platform (AJMP)

A digital platform designed to streamline the submission, peer review, and editorial management processes for academic journals. Built specifically for Studies in Language Assessment (SiLA), the official peer-reviewed publication of the Association for Language Testing and Assessment of New Zealand (ALTAANZ), attached to the University of Melbourne

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

## Overview

The Academic Journal Management Platform revolutionizes the traditional manuscript submission and review process by providing a fully integrated digital solution. This platform eliminates manual processes, enhances transparency in editorial decision-making, and provides comprehensive tracking capabilities for all stakeholders involved in the academic publishing workflow.

### Core Objectives
- **Streamline Submission Process**: Simplify manuscript submission with intuitive multi-step forms and automated validation
- **Enhance Review Management**: Facilitate efficient peer review assignment, tracking, and completion
- **Improve Editorial Workflow**: Provide editors with comprehensive dashboards for managing submissions and making informed decisions
- **Increase Transparency**: Enable real-time tracking of submission status for all users
- **Ensure Data Integrity**: Maintain secure, role-based access control with comprehensive audit trails

## Key Features

### For Authors
- Multi-step manuscript submission wizard with progress tracking
- Real-time submission status monitoring
- Revision submission capabilities
- Direct communication with editorial team
- Personal dashboard with submission history

### For Reviewers
- Dedicated review dashboard with pending and completed reviews
- Advanced PDF annotation tools for inline commenting
- Structured review forms with customizable criteria
- Review deadline management and reminders
- Historical review tracking

### For Editors & Editorial Assistants
- Comprehensive submission management dashboard
- Reviewer assignment and tracking system
- Editorial decision workflow management
- Automated email notifications
- Statistical reporting and analytics
- Bulk operations for efficient management

### System-Wide Features
- **Role-Based Access Control**: Four distinct user roles (Author, Reviewer, Editor, Editorial Assistant)
- **Secure Authentication**: JWT-based authentication with refresh token mechanism
- **File Management**: Secure manuscript upload and storage with AWS S3 integration
- **Email Integration**: Automated notifications for all critical workflow events
- **Responsive Design**: Full mobile and tablet compatibility
- **Advanced Search**: Comprehensive filtering and search capabilities across submissions

## System Architecture

**Demonstration:**
https://youtu.be/CZFNYIi9Elg

**Architecture:**

![image](https://github.com/jaiphookan20/Academic-Journal-Management-Platform/assets/52240311/8fffdc6d-7e01-4bf8-ad9e-488daad1a6fc)


**ERD Diagram:**

![image](https://github.com/jaiphookan20/Academic-Journal-Management-Platform/assets/52240311/4b01b2f9-944d-492f-83eb-e59a07c2cab8)

## Prerequisites

Before setting up the application, ensure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- MySQL (v8.0 or higher)
- Git

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/jaiphookan20/Academic-Journal-Management-Platform.git
cd Academic-Journal-Management-Platform
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Database Setup
```bash
cd ../data

# Create database and import schema
mysql -u root -p < sila_dev_db.sql

# Deploy database views
./deploy_views.sh

# Optional: Set up sample data
./setup_db.sh
```

## Configuration

### Backend Configuration
Create a `.env` file in the backend directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=sila_dev_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# AWS Configuration (Optional)
AWS_REGION=ap-southeast-2
S3_BUCKET=your-s3-bucket-name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Server Configuration
PORT=8080
NODE_ENV=development
```

### Frontend Configuration
Update the API endpoint in `frontend/src/config/api.js`:
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

## Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run start-dev  # Runs with nodemon for auto-reload
```
The backend server will start on http://localhost:8080

#### Start Frontend Application
```bash
cd frontend
npm start
```
The frontend application will start on http://localhost:3000

### Production Mode

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm run build
# Serve the build folder using a static server
```

## Project Structure

```
Academic-Journal-Management-Platform/
├── backend/
│   ├── app/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utilities/      # Helper functions
│   │   └── test/          # Unit tests
│   ├── server.js          # Express server setup
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── public/            # Static files
│   ├── src/
│   │   ├── assets/        # Images and static assets
│   │   ├── components/    # React components
│   │   │   ├── Css/       # Component styles
│   │   │   └── subComponents/  # Reusable components
│   │   ├── App.js         # Main application component
│   │   └── index.js       # Application entry point
│   └── package.json       # Frontend dependencies
├── data/
│   ├── manuscript/        # Sample manuscript files
│   ├── procedures/        # SQL procedures
│   ├── views/            # Database views
│   └── sila_dev_db.sql   # Database schema
├── aws/                   # AWS CDK infrastructure code
└── docs/                  # Documentation

```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Submission Management
- `GET /api/submissions` - Get all submissions (role-based filtering)
- `GET /api/submissions/:id` - Get submission details
- `POST /api/submissions` - Create new submission
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission

### Review Management
- `GET /api/reviews` - Get all reviews
- `GET /api/reviews/:id` - Get review details
- `POST /api/reviews` - Create new review
- `PUT /api/reviews/:id` - Update review
- `POST /api/reviews/:id/submit` - Submit completed review

### Editorial Decisions
- `GET /api/editorial-decisions` - Get all decisions
- `POST /api/editorial-decisions` - Create editorial decision
- `PUT /api/editorial-decisions/:id` - Update decision

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/assign-role` - Assign role to user (Editor only)

## Testing

### Backend Testing
```bash
cd backend
npm test  # Run all tests
npm test -- --watch  # Run tests in watch mode
```

### Frontend Testing
```bash
cd frontend
npm test  # Run tests in interactive mode
npm test -- --coverage  # Generate coverage report
```

## Security Considerations

- All passwords are hashed using bcrypt with salt rounds
- JWT tokens expire after 15 minutes with refresh token rotation
- Input validation on all API endpoints
- SQL injection prevention through parameterized queries
- XSS protection through React's built-in escaping
- CORS configured for specific origins only
- File upload restrictions and virus scanning recommended

## Performance Optimization

- Database indexing on frequently queried columns
- Optimized database views for complex queries
- Frontend code splitting and lazy loading
- Image optimization and CDN integration
- API response caching where appropriate
- Pagination for large data sets

