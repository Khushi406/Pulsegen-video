# Pulsegen Backend

Express.js backend server for video upload, processing, and real-time streaming with multi-tenant architecture and role-based access control.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

Server runs on `http://localhost:4000` (default)

## 📁 Project Structure

```
Backend/
├── src/
│   ├── index.js              # Server entry point & Socket.io setup
│   ├── middleware/
│   │   └── auth.js           # JWT authentication & RBAC middleware
│   ├── models/
│   │   ├── user.js           # User schema with multi-tenant support
│   │   └── video.js          # Video metadata schema
│   ├── routes/
│   │   ├── auth.js           # POST /api/auth/signup, /api/auth/login
│   │   ├── upload.js         # POST /api/upload, GET /api/upload
│   │   ├── videos.js         # GET /api/videos (with filters)
│   │   └── stream.js         # GET /api/stream/:id (range requests)
│   └── utils/
│       ├── ffmpegConfig.js   # FFmpeg binary path configuration
│       └── sensitivityStub.js # Video content analysis logic
├── uploads/                  # Video file storage directory
├── package.json
├── .env                      # Environment configuration
└── README.md                 # This file
```

## 🔧 Environment Variables

Create a `.env` file in the Backend directory:

```env
# Server Configuration
PORT=4000

# Database Connection
MONGO_URL=mongodb+srv://dbUser:password@cluster.mongodb.net/?appName=Cluster0

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

**Important**: Change `JWT_SECRET` in production!

## 📡 API Endpoints

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure123",
  "tenantId": "org-1",
  "role": "Editor"  // Optional: "Viewer", "Editor", "Admin" (default: "Viewer")
}
```

**Response** (200):
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com"
}
```

#### POST `/api/auth/login`
Login and receive JWT token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "secure123"
}
```

**Response** (200):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Token Payload**:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "tenantId": "org-1",
  "role": "Editor",
  "iat": 1640000000,
  "exp": 1640604800
}
```

### Video Upload Endpoints

#### POST `/api/upload`
Upload a video file for processing.

**Authentication**: Required (Editor or Admin role)

**Request**: `multipart/form-data`
- Field: `video` (file)

**Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Response** (200):
```json
{
  "message": "Upload started",
  "id": "507f1f77bcf86cd799439011"
}
```

**Real-time Events** (via Socket.io):
```javascript
// Progress update (0-100%)
socket.on('video:progress', { id: '...', percent: 45 })

// Processing complete
socket.on('video:processed', { 
  id: '...', 
  sensitivity: 'safe' // or 'flagged', 'unknown'
})
```

#### GET `/api/upload`
List all uploaded videos for the authenticated user's tenant.

**Authentication**: Required

**Response** (200):
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "filename": "1640000000-video.mp4",
    "originalName": "video.mp4",
    "path": "/path/to/uploads/1640000000-video.mp4",
    "size": 15728640,
    "status": "processed",
    "sensitivity": "safe",
    "owner": "507f1f77bcf86cd799439012",
    "tenantId": "org-1",
    "createdAt": "2024-12-28T10:00:00.000Z"
  }
]
```

### Video Listing Endpoint

#### GET `/api/videos`
List videos with pagination and filters.

**Authentication**: Required

**Query Parameters**:
- `status` - Filter by status: `uploaded`, `processing`, `processed`, `failed`
- `sensitivity` - Filter by sensitivity: `safe`, `flagged`, `unknown`
- `search` - Search by originalName (case-insensitive regex)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 200)
- `sort` - Sort order (default: `-createdAt`)

**Example Request**:
```
GET /api/videos?status=processed&sensitivity=safe&page=1&limit=12
```

**Response** (200):
```json
{
  "data": [ /* array of videos */ ],
  "page": 1,
  "limit": 12,
  "total": 45,
  "totalPages": 4
}
```

### Video Streaming Endpoint

#### GET `/api/stream/:id`
Stream video with HTTP range request support.

**Authentication**: Required (tenant-isolated)

**Headers**:
```
Authorization: Bearer <jwt-token>
Range: bytes=0-1023  // Optional
```

**Response** (206 Partial Content):
```
Content-Range: bytes 0-1023/15728640
Content-Length: 1024
Content-Type: video/mp4
```

**Response** (200 Full Content):
```
Content-Length: 15728640
Content-Type: video/mp4
```

## 🔐 Authentication Middleware

### `authenticate(req, res, next)`
Verifies JWT token and attaches user data to `req.user`.

**Usage**:
```javascript
router.get('/protected', authenticate, (req, res) => {
  // req.user = { _id, tenantId, role }
  res.json({ user: req.user });
});
```

**Extracts**:
- `req.user._id` - User ID
- `req.user.tenantId` - Organization ID
- `req.user.role` - User role (Viewer/Editor/Admin)

### `authorize(allowedRoles)`
Checks if user has required role.

**Usage**:
```javascript
router.post('/admin-only', 
  authenticate, 
  authorize(['Admin']), 
  (req, res) => {
    // Only Admin can access
  }
);
```

**Allowed Roles**:
- `Viewer` - Read-only access
- `Editor` - Can upload and manage videos
- `Admin` - Full system access

## 💾 Database Schemas

### User Schema
```javascript
{
  email: String (required, unique),
  password: String (required, hashed with bcryptjs),
  role: String (enum: ['Admin', 'Editor', 'Viewer'], default: 'Viewer'),
  tenantId: String (required) // Multi-tenant isolation
}
```

### Video Schema
```javascript
{
  filename: String (required),
  originalName: String,
  path: String,
  size: Number,
  status: String (default: 'uploaded'), // uploaded, processing, processed, failed
  sensitivity: String (default: 'unknown'), // safe, flagged, unknown
  owner: ObjectId (ref: 'User', required),
  tenantId: String (required), // Multi-tenant isolation
  createdAt: Date (default: Date.now)
}
```

## 🎥 Video Processing Pipeline

1. **Upload** → Multer receives file
2. **Storage** → File saved to `uploads/` with timestamp prefix
3. **Database** → Video record created with `status: 'processing'`
4. **FFmpeg Processing**:
   - Probe video metadata (duration, format)
   - Transcode with `-c copy` (fast, lossless)
   - Emit progress updates via Socket.io
5. **Sensitivity Analysis**:
   - Run integrity check
   - Classify as safe/flagged/unknown
6. **Completion**:
   - Update `status: 'processed'`
   - Update `sensitivity` field
   - Emit `video:processed` event

## 🔌 Socket.io Real-Time Events

### Client → Server

#### `join` event
Join a tenant room for receiving updates.

```javascript
socket.emit('join', tenantId); // or JWT token
```

### Server → Client

#### `video:progress` event
Video processing progress update.

```javascript
socket.on('video:progress', (data) => {
  // data = { id: '...', percent: 45 }
});
```

#### `video:processed` event
Video processing completed.

```javascript
socket.on('video:processed', (data) => {
  // data = { id: '...', sensitivity: 'safe' }
});
```

## 🏗️ Multi-Tenant Architecture

All video operations are **tenant-scoped**:

1. **User Registration**: Each user belongs to a `tenantId`
2. **Data Isolation**: Videos filtered by `req.user.tenantId`
3. **Socket Rooms**: Real-time updates scoped to tenant
4. **Streaming Access**: Users can only stream videos from their tenant

**Example**:
```javascript
// User A (tenantId: 'org-1') cannot access videos from User B (tenantId: 'org-2')
const videos = await Video.find({ tenantId: req.user.tenantId });
```

## 🛡️ Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT authentication with expiry (7 days)
- ✅ Role-based authorization
- ✅ Tenant isolation at API and database level
- ✅ Protected streaming endpoint
- ✅ Input validation on all endpoints
- ✅ CORS enabled for frontend integration

## 🧪 Testing the API

### Using cURL

**Signup**:
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","tenantId":"org-1","role":"Editor"}'
```

**Login**:
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**List Videos**:
```bash
curl http://localhost:4000/api/videos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **socket.io**: Real-time WebSocket communication
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **fluent-ffmpeg**: Video processing
- **@ffmpeg-installer/ffmpeg**: FFmpeg binary
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## 🔍 Troubleshooting

**MongoDB Connection Failed**:
```bash
# Check connection string in .env
# Verify IP whitelist in MongoDB Atlas
# Test connection: node -e "require('mongoose').connect(process.env.MONGO_URL)"
```

**FFmpeg Errors**:
```bash
# FFmpeg installs automatically via npm
# Check logs for specific error
# Verify video file is not corrupted
```

**Socket.io Not Connecting**:
```bash
# Ensure frontend Socket.io client version matches server
# Check CORS configuration
# Verify JWT token is being sent for tenant join
```

**Port Already in Use**:
```bash
# Change PORT in .env
# Or kill process: npx kill-port 4000
```

## 📈 Performance Tips

- Use MongoDB indexes on `tenantId` and `owner` fields
- Implement video file cleanup for failed uploads
- Consider AWS S3 for production video storage
- Add Redis for Socket.io scaling across multiple servers
- Implement rate limiting for upload endpoint

## 🚀 Production Deployment

1. Set strong `JWT_SECRET`
2. Use MongoDB Atlas or managed MongoDB
3. Set `NODE_ENV=production`
4. Use process manager (PM2)
5. Enable HTTPS
6. Add monitoring (Sentry, LogRocket)
7. Implement file storage on cloud (AWS S3)
8. Set up CDN for video delivery

---

**Last Updated**: December 28, 2025
