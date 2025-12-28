# Pulsegen Architecture Documentation

## 📐 System Overview

Pulsegen follows a modern **three-tier architecture** with real-time capabilities, designed for scalability, security, and multi-tenancy.

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                      │
│                  (React + Vite Frontend)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   Pages     │  │  Components  │  │   Socket.io       │  │
│  │  - Login    │  │  - Layout    │  │   Client          │  │
│  │  - Signup   │  │  - VideoCard │  │  (Real-time)      │  │
│  │  - Videos   │  │  - Player    │  │                   │  │
│  │  - Upload   │  │              │  │                   │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP(S) / WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│                  (Express.js Backend)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Routes  │  │   Auth   │  │  Video   │  │ Socket.io  │  │
│  │ /auth/*  │  │  JWT +   │  │Processing│  │   Server   │  │
│  │ /upload  │  │  RBAC    │  │ FFmpeg   │  │ (Events)   │  │
│  │ /videos  │  │Middleware│  │          │  │            │  │
│  │ /stream  │  │          │  │          │  │            │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│                    (MongoDB Database)                        │
│  ┌──────────────────┐              ┌──────────────────┐     │
│  │  Users           │              │  Videos          │     │
│  │  - email         │              │  - filename      │     │
│  │  - password      │              │  - metadata      │     │
│  │  - role          │              │  - status        │     │
│  │  - tenantId      │              │  - sensitivity   │     │
│  │                  │              │  - tenantId      │     │
│  └──────────────────┘              └──────────────────┘     │
│                                                              │
│  File Storage: uploads/ directory (local/cloud)             │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture Patterns

### 1. Multi-Tenant Architecture (Tenant Isolation)

Every user belongs to an organization (identified by `tenantId`). Data is completely isolated between tenants at multiple levels:

**Database Level**:
```javascript
// All queries are tenant-scoped
const videos = await Video.find({ tenantId: req.user.tenantId })
```

**API Level**:
```javascript
// Authentication middleware extracts tenantId from JWT
req.user = { _id, tenantId, role }

// All routes filter by tenantId
router.get('/videos', authenticate, async (req, res) => {
  const videos = await Video.find({ tenantId: req.user.tenantId })
})
```

**Real-Time Level**:
```javascript
// Socket.io rooms are tenant-specific
socket.join(tenantId) // Users only receive updates for their tenant
io.to(tenantId).emit('video:progress', data)
```

### 2. Role-Based Access Control (RBAC)

Three-tier permission system:

```
┌─────────────────────────────────────────────────────────┐
│                         Admin                           │
│  - Full system access                                   │
│  - User management                                      │
│  - All video operations                                 │
└────────────────┬────────────────────────────────────────┘
                 │ inherits
┌────────────────▼────────────────────────────────────────┐
│                         Editor                          │
│  - Upload videos                                        │
│  - Manage own videos                                    │
│  - View all videos in tenant                            │
└────────────────┬────────────────────────────────────────┘
                 │ inherits
┌────────────────▼────────────────────────────────────────┐
│                         Viewer                          │
│  - View videos                                          │
│  - Search/filter videos                                 │
│  - Stream videos                                        │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:
```javascript
// Middleware checks user role
function authorize(allowedRoles) {
  return (req, res, next) => {
    if (allowedRoles.includes(req.user.role)) return next()
    return res.status(403).json({ error: 'Forbidden' })
  }
}

// Usage in routes
router.post('/upload', 
  authenticate, 
  authorize(['Editor', 'Admin']), 
  uploadHandler
)
```

### 3. Authentication Flow

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ 1. POST /auth/login
       │    { email, password }
       ▼
┌──────────────────────┐
│  Backend API         │
│  1. Validate creds   │
│  2. Generate JWT     │
│     payload: {       │
│       _id,           │
│       tenantId,      │
│       role           │
│     }                │
│  3. Return token     │
└──────┬───────────────┘
       │ 2. JWT Token
       ▼
┌──────────────────────┐
│  Client Storage      │
│  localStorage.token  │
│  localStorage.role   │
└──────┬───────────────┘
       │ 3. All API requests
       │    Authorization: Bearer <token>
       ▼
┌──────────────────────┐
│  Auth Middleware     │
│  1. Extract token    │
│  2. Verify JWT       │
│  3. Attach user data │
│     req.user = {...} │
└──────┬───────────────┘
       │ 4. Authorized request
       ▼
┌──────────────────────┐
│  Protected Route     │
│  Access to req.user  │
└──────────────────────┘
```

### 4. Video Processing Pipeline

```
┌───────────────┐
│ 1. Upload     │  Multer receives file
│               │  → saves to uploads/
└───────┬───────┘
        │
┌───────▼───────┐
│ 2. Database   │  Create video record
│    Record     │  status: 'processing'
└───────┬───────┘
        │
┌───────▼───────┐
│ 3. FFmpeg     │  Probe metadata
│    Processing │  Transcode video
│               │  Emit progress via Socket.io
└───────┬───────┘
        │
┌───────▼───────┐
│ 4. Sensitivity│  Analyze content
│    Analysis   │  Classify: safe/flagged/unknown
└───────┬───────┘
        │
┌───────▼───────┐
│ 5. Completion │  Update status: 'processed'
│               │  Emit 'video:processed' event
│               │  Ready for streaming
└───────────────┘
```

**Code Flow**:
```javascript
// 1. Upload
router.post('/upload', authenticate, authorize(['Editor', 'Admin']), async (req, res) => {
  upload(req, res, async (err) => {
    // 2. Create DB record
    const record = await Video.create({
      filename: req.file.filename,
      status: 'processing',
      tenantId: req.user.tenantId
    })
    
    // 3. FFmpeg processing
    ffmpeg(record.path)
      .on('progress', (progress) => {
        // Emit real-time progress
        io.to(req.user.tenantId).emit('video:progress', { 
          id: record._id, 
          percent: progress.percent 
        })
      })
      .on('end', async () => {
        // 4. Sensitivity analysis
        const analysis = await analyzeSensitivity(record.path)
        record.sensitivity = analysis.result
        record.status = 'processed'
        await record.save()
        
        // 5. Emit completion
        io.to(req.user.tenantId).emit('video:processed', { 
          id: record._id, 
          sensitivity: record.sensitivity 
        })
      })
      .run()
  })
})
```

### 5. Real-Time Communication Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Frontend                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Socket.io Client                                  │  │
│  │  - Connects on app load                            │  │
│  │  - Joins tenant room: socket.emit('join', token)   │  │
│  │  - Listens for events                              │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────┘
                           │ WebSocket
                           ▼
┌──────────────────────────────────────────────────────────┐
│                     Backend                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Socket.io Server                                  │  │
│  │  - Creates tenant rooms                            │  │
│  │  - Receives 'join' events                          │  │
│  │  - Emits updates to specific rooms                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Tenant Rooms:                                           │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│  │ org-1   │  │ org-2   │  │ org-3   │                  │
│  │ 👤 👤   │  │ 👤      │  │ 👤 👤 👤│                  │
│  └─────────┘  └─────────┘  └─────────┘                  │
└──────────────────────────────────────────────────────────┘
```

**Events**:
```javascript
// Server → Client
'video:progress'   // { id, percent }
'video:processed'  // { id, sensitivity }

// Client → Server
'join'             // tenantId or JWT token
```

### 6. Video Streaming Architecture

**HTTP Range Requests** for efficient video streaming:

```
┌──────────────┐
│   Client     │
│  <video>     │
└──────┬───────┘
       │ GET /api/stream/123
       │ Range: bytes=0-1048575
       ▼
┌──────────────────────┐
│  Stream Endpoint     │
│  1. Authenticate     │
│  2. Check tenant     │
│  3. Read file stats  │
│  4. Parse range      │
│  5. Create stream    │
└──────┬───────────────┘
       │ 206 Partial Content
       │ Content-Range: bytes 0-1048575/15728640
       │ [video chunk]
       ▼
┌──────────────────────┐
│  Client Player       │
│  Plays chunk         │
│  Requests next chunk │
└──────────────────────┘
```

**Implementation**:
```javascript
router.get('/stream/:id', authenticate, async (req, res) => {
  const video = await Video.findById(req.params.id)
  
  // Tenant check
  if (video.tenantId !== req.user.tenantId) {
    return res.status(403).send('Access denied')
  }
  
  const videoSize = fs.statSync(video.path).size
  const range = req.headers.range
  
  if (range) {
    const [start, end] = parseRange(range, videoSize)
    const chunksize = (end - start) + 1
    const file = fs.createReadStream(video.path, { start, end })
    
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    })
    
    file.pipe(res)
  }
})
```

## 💾 Database Schema Design

### Users Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  email: "user@company.com",           // Unique, indexed
  password: "$2a$10$...",               // Bcrypt hashed
  role: "Editor",                       // Enum: Viewer/Editor/Admin
  tenantId: "org-1",                    // Organization identifier, indexed
  createdAt: ISODate("2024-12-28T00:00:00Z")
}
```

**Indexes**:
- `email` (unique)
- `tenantId` (non-unique, for tenant queries)

### Videos Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  filename: "1703721600000-video.mp4", // Timestamp + original
  originalName: "video.mp4",            // User's filename
  path: "/uploads/1703721600000-video.mp4",
  size: 15728640,                       // Bytes
  status: "processed",                  // uploaded/processing/processed/failed
  sensitivity: "safe",                  // safe/flagged/unknown
  owner: ObjectId("507f1f77bcf86cd799439011"), // User who uploaded
  tenantId: "org-1",                    // Organization identifier, indexed
  createdAt: ISODate("2024-12-28T00:00:00Z")
}
```

**Indexes**:
- `tenantId` (non-unique, critical for multi-tenancy)
- `owner` (non-unique, for user's videos)
- `status` (non-unique, for filtering)
- `createdAt` (descending, for sorting)

## 🔒 Security Architecture

### 1. Authentication Security
- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT with 7-day expiration
- ✅ Secure token storage (localStorage)
- ✅ Token verification on every protected request

### 2. Authorization Security
- ✅ Role-based middleware
- ✅ Tenant isolation at all levels
- ✅ Protected streaming endpoint

### 3. Data Security
- ✅ MongoDB connection string in environment variables
- ✅ No sensitive data in JWT payload
- ✅ CORS configured for specific origins

### 4. Input Validation
- ✅ File type validation (video/* only)
- ✅ File size limits (Multer configuration)
- ✅ Email format validation
- ✅ Required field validation

## 📊 Data Flow Diagrams

### User Registration Flow

```
┌────────┐    1. Fill form     ┌──────────┐
│ Client │──────────────────────▶│ Signup   │
│        │                       │ Page     │
└────────┘                       └────┬─────┘
                                      │ 2. POST /auth/signup
                                      ▼
                            ┌─────────────────┐
                            │ Backend         │
                            │ 1. Validate     │
                            │ 2. Hash pwd     │
                            │ 3. Create user  │
                            │ 4. Save to DB   │
                            └────┬────────────┘
                                 │ 3. Success response
                                 ▼
                         ┌──────────────┐
                         │  MongoDB     │
                         │  Users       │
                         └──────────────┘
```

### Video Upload & Processing Flow

```
┌────────┐    1. Select file    ┌──────────┐
│ Client │──────────────────────▶│ Upload   │
│        │                       │ Page     │
└────────┘                       └────┬─────┘
                                      │ 2. POST /upload (multipart)
                                      ▼
                            ┌─────────────────┐
                            │ Multer          │
                            │ Save to uploads/│
                            └────┬────────────┘
                                 │ 3. Create DB record
                                 ▼
                         ┌──────────────┐
                         │  MongoDB     │
                         │  Videos      │
                         │  status: processing
                         └────┬─────────┘
                              │ 4. Start FFmpeg
                              ▼
                    ┌───────────────────────┐
                    │  FFmpeg Processing    │
                    │  - Emit progress      │◀───┐
                    │  - Transcode          │    │ 5. Real-time
                    │  - Analyze            │    │    updates
                    └────┬──────────────────┘    │
                         │ 6. Complete           │
                         ▼                       │
                  ┌──────────────┐               │
                  │  Update DB   │               │
                  │  status: processed           │
                  │  sensitivity: safe           │
                  └────┬─────────┘               │
                       │ 7. Emit event           │
                       ▼                         │
              ┌──────────────────┐               │
              │  Socket.io       │───────────────┘
              │  video:processed │
              └──────────────────┘
```

## 🚀 Scalability Considerations

### Current Architecture Limitations
1. **File Storage**: Local filesystem (not scalable)
2. **Socket.io**: Single server (no clustering)
3. **FFmpeg**: Server-side processing (CPU-bound)

### Scalability Improvements

#### Phase 1: Cloud Storage
```
Current:  uploads/ directory
↓
Future:   AWS S3 / Google Cloud Storage
Benefits: - Unlimited storage
          - CDN integration
          - Reduced server load
```

#### Phase 2: Horizontal Scaling
```
Current:  Single backend server
↓
Future:   Load balancer + Multiple servers
          Redis for Socket.io adapter
Benefits: - Handle more concurrent users
          - High availability
```

#### Phase 3: Background Job Queue
```
Current:  FFmpeg runs in API request
↓
Future:   Bull Queue + Redis
          Separate worker processes
Benefits: - Non-blocking API
          - Retry failed jobs
          - Better resource management
```

## 📈 Performance Optimization

### Database
- Create compound indexes: `{ tenantId: 1, createdAt: -1 }`
- Use MongoDB aggregation for statistics
- Implement connection pooling

### API
- Implement caching (Redis)
- Add rate limiting
- Compress responses (gzip)

### Frontend
- Code splitting
- Lazy loading components
- Image/video thumbnail optimization

---

**Last Updated**: December 28, 2025
