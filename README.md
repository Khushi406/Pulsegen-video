# Pulsegen - Video Upload, Processing & Streaming Platform

A comprehensive full-stack application that enables users to upload videos, processes them for content sensitivity analysis, and provides seamless video streaming capabilities with real-time progress tracking.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 Project Overview

Pulsegen is a modern video management platform built with a focus on:
- **Secure Video Upload**: User-friendly interface with drag-and-drop functionality
- **Content Analysis**: Automated sensitivity detection (safe/flagged classification)
- **Real-Time Updates**: Live processing progress tracking via WebSockets
- **Streaming Service**: Efficient video playback using HTTP range requests
- **Multi-Tenant Architecture**: Complete data isolation between organizations
- **Role-Based Access Control**: Granular permissions (Viewer, Editor, Admin)

## ✨ Features

### Core Functionality
- ✅ **User Authentication & Authorization** - JWT-based secure login/signup
- ✅ **Video Upload** - Drag-and-drop interface with progress tracking
- ✅ **Content Processing** - Automated FFmpeg video processing pipeline
- ✅ **Sensitivity Analysis** - AI-ready content classification system
- ✅ **Real-Time Progress** - Live updates using Socket.io
- ✅ **Video Streaming** - HTTP range request support for efficient playback
- ✅ **Advanced Filtering** - Filter by status, sensitivity, and search by name
- ✅ **Pagination** - Efficient handling of large video libraries
- ✅ **Responsive Design** - Mobile-first, works on all devices

### Architecture Highlights
- ✅ **Multi-Tenant Isolation** - Each organization has separate data
- ✅ **RBAC Implementation** - Three roles with different permissions
- ✅ **RESTful API** - Clean, documented API endpoints
- ✅ **Modern UI/UX** - Gradient design with Tailwind CSS
- ✅ **Modal Video Player** - Seamless viewing experience

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (Latest LTS)
- **Framework**: Express.js 4.18
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.io 4.7
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Video Processing**: FFmpeg via fluent-ffmpeg
- **File Upload**: Multer 1.4
- **Security**: bcryptjs for password hashing

### Frontend
- **Build Tool**: Vite 7.2
- **Framework**: React 19.2
- **Routing**: React Router DOM 7.11
- **Styling**: Tailwind CSS 4.1
- **HTTP Client**: Axios 1.13
- **Real-Time**: Socket.io Client 4.8

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **FFmpeg** - Automatically installed via npm dependencies
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Pulsegen
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Configure environment variables
# The .env file already exists with your MongoDB Atlas connection
# Verify these settings:
# - PORT=4000
# - MONGO_URL=<your-mongodb-connection-string>
# - JWT_SECRET=<your-secret-key>

# Start the backend server
npm run dev
```

Backend will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Configure environment variables
# Create .env file if it doesn't exist:
echo "VITE_API_BASE=http://localhost:4000" > .env

# Start the frontend development server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 👤 Getting Started

### Create Your First Account

1. **Navigate to Signup Page**: Click "Sign up" on the login page
2. **Fill in Details**:
   - Email: `admin@company.com`
   - Organization ID: `company-1` (unique identifier for your organization)
   - Role: Select `Admin` for full access
   - Password: Create a secure password
3. **Click "Create Account"**

### Upload Your First Video

1. **Login** with your credentials
2. **Navigate to "Upload Video"** in the sidebar
3. **Drag and drop** a video file or click to browse
4. **Click "Upload & Process Video"**
5. **Watch real-time progress** as the video is processed
6. **Return to Dashboard** to see your video

### Watch Your Videos

1. **Dashboard** shows all your uploaded videos in a card grid
2. **Click on any video card** to open the modal player
3. **Use filters** to find specific videos by status or sensitivity
4. **Use search** to find videos by filename

## 📁 Project Structure

```
Pulsegen/
├── Backend/                    # Backend application
│   ├── src/
│   │   ├── index.js           # Server entry point
│   │   ├── middleware/
│   │   │   └── auth.js        # Authentication & authorization
│   │   ├── models/
│   │   │   ├── user.js        # User schema (with RBAC)
│   │   │   └── video.js       # Video metadata schema
│   │   ├── routes/
│   │   │   ├── auth.js        # Login/signup endpoints
│   │   │   ├── upload.js      # Video upload & processing
│   │   │   ├── videos.js      # Video listing with filters
│   │   │   └── stream.js      # Video streaming endpoint
│   │   └── utils/
│   │       ├── ffmpegConfig.js    # FFmpeg setup
│   │       └── sensitivityStub.js # Content analysis
│   ├── uploads/               # Uploaded video storage
│   ├── package.json
│   └── .env                   # Environment configuration
│
├── frontend/                  # Frontend application
│   ├── src/
│   │   ├── App.jsx           # Main app component
│   │   ├── main.jsx          # React entry point
│   │   ├── index.css         # Global styles (Tailwind)
│   │   ├── components/
│   │   │   ├── Layout.jsx        # Sidebar navigation layout
│   │   │   ├── RequireAuth.jsx   # Protected route wrapper
│   │   │   ├── VideoPlayer.jsx   # Modal video player
│   │   │   ├── VideoCard.jsx     # Video card component
│   │   │   └── Loader.jsx        # Loading spinner
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx     # Login page
│   │   │   ├── SignupPage.jsx    # Signup page
│   │   │   ├── VideosPage.jsx    # Dashboard with video grid
│   │   │   └── UploadPage.jsx    # Video upload page
│   │   └── utils/
│   │       ├── api.js            # Axios instance with auth
│   │       └── socket.js         # Socket.io client
│   ├── package.json
│   └── .env                   # Environment configuration
│
└── README.md                  # This file
```

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)

The application implements three distinct roles:

| Role | Permissions |
|------|------------|
| **Viewer** | ✅ View videos<br>✅ Search/filter videos<br>✅ Stream videos<br>❌ Upload videos<br>❌ Manage content |
| **Editor** | ✅ All Viewer permissions<br>✅ Upload videos<br>✅ Manage own videos<br>❌ System settings |
| **Admin** | ✅ All Editor permissions<br>✅ Full system access<br>✅ Manage all videos<br>✅ User management |

### Multi-Tenant Architecture

- Each user belongs to an **Organization** (identified by `tenantId`)
- Users can only see videos from their own organization
- Complete data isolation between organizations
- Secure at both API and database levels

## 🎥 Video Processing Pipeline

1. **Upload** → File validation (type, size)
2. **Storage** → Secure storage with unique filename
3. **Processing** → FFmpeg transcoding and optimization
4. **Analysis** → Automated sensitivity detection
5. **Status Update** → Real-time progress via Socket.io
6. **Streaming Ready** → HTTP range request support

### Sensitivity Analysis

Videos are automatically classified:
- **Safe** ✅ - Appropriate content
- **Flagged** ⚠️ - Potentially sensitive content
- **Unknown** ❓ - Analysis pending or inconclusive

## 🌐 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication Endpoints

#### POST `/auth/signup`
Create a new user account
```json
{
  "email": "user@example.com",
  "password": "secure123",
  "tenantId": "org-1",
  "role": "Editor"
}
```

#### POST `/auth/login`
Login and receive JWT token
```json
{
  "email": "user@example.com",
  "password": "secure123"
}
```

### Video Endpoints (Requires Authentication)

#### POST `/upload`
Upload a video (Editor/Admin only)
- Content-Type: `multipart/form-data`
- Field: `video` (file)

#### GET `/videos`
List videos with filters
- Query params: `status`, `sensitivity`, `search`, `page`, `limit`

#### GET `/stream/:id`
Stream video by ID
- Supports HTTP range requests
- Tenant-isolated

See [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) for complete API reference.

## 🏗️ Architecture

The application follows a modern **three-tier architecture**:

1. **Presentation Layer** (React Frontend)
   - User interface and interactions
   - Real-time updates via WebSocket
   - Responsive design

2. **Application Layer** (Express Backend)
   - RESTful API endpoints
   - Business logic
   - Authentication & authorization
   - Real-time server (Socket.io)

3. **Data Layer** (MongoDB)
   - User data
   - Video metadata
   - Multi-tenant data storage

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed architecture documentation.

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=4000
MONGO_URL=mongodb+srv://...
JWT_SECRET=your_secret_key
```

### Frontend (.env)
```env
VITE_API_BASE=http://localhost:4000
```

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
```bash
# Check if MongoDB is running (local)
mongod --version

# Or verify MongoDB Atlas connection string in .env
# Ensure IP whitelist includes your current IP
```

**FFmpeg Not Found**
```bash
# FFmpeg is installed automatically via npm
# If issues persist, manually install FFmpeg:
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
```

**Port Already in Use**
```bash
# Change PORT in Backend/.env
# Or kill the process using port 4000
```

### Frontend Issues

**API Connection Error**
```bash
# Verify VITE_API_BASE in frontend/.env
# Ensure backend is running on correct port
# Check browser console for CORS errors
```

**Tailwind CSS Not Working**
```bash
# Clear Vite cache
cd frontend
rm -rf node_modules/.vite
npm run dev
```

### Video Upload Issues

**Upload Fails**
- Check file size (max 500MB recommended)
- Ensure video format is supported (MP4, AVI, MOV, MKV)
- Verify JWT token is valid (re-login if needed)

**Processing Stuck**
- Check backend logs for FFmpeg errors
- Ensure sufficient disk space in `Backend/uploads/`
- Verify video file is not corrupted

## 📊 Performance Considerations

- Videos stored locally in `Backend/uploads/` (for production, use AWS S3 or similar)
- Socket.io connections are tenant-scoped for efficiency
- Pagination implemented for video lists (default 12 per page)
- HTTP range requests for efficient video streaming

## 🚀 Deployment

### Backend Deployment (Railway/Render/Heroku)

1. Create new project on platform
2. Connect GitHub repository
3. Set environment variables:
   - `MONGO_URL`
   - `JWT_SECRET`
   - `PORT`
4. Deploy from `Backend` directory
5. Note the deployed URL

### Frontend Deployment (Vercel/Netlify)

1. Create new project on platform
2. Connect GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Set environment variable:
   - `VITE_API_BASE=<your-backend-url>`
6. Deploy from `frontend` directory

## 📝 Testing Checklist

- [ ] User signup creates account successfully
- [ ] User login returns JWT token
- [ ] Viewer cannot access upload page
- [ ] Editor can upload videos
- [ ] Admin has full access
- [ ] Videos only visible within same tenant
- [ ] Real-time progress updates work
- [ ] Video streaming plays without buffering
- [ ] Filters work correctly
- [ ] Search finds videos by filename
- [ ] Mobile responsive layout works

## 🤝 Contributing

This is an academic project. For improvements:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- Assignment requirements provided by [Institution Name]
- FFmpeg for video processing
- MongoDB Atlas for database hosting
- Open source community

## 📧 Support

For issues or questions:
- Create an issue in the repository
- Email: your.email@example.com

---

**Last Updated**: December 28, 2025

**Version**: 1.0.0
