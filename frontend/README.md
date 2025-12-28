# Pulsegen Frontend

Modern React + Vite frontend application for video management with real-time updates, drag-and-drop uploads, and a beautiful responsive UI built with Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Application runs on `http://localhost:5173` (default Vite port)

## 📁 Project Structure

```
frontend/
├── src/
│   ├── main.jsx              # React app entry point
│   ├── App.jsx               # Main app with routing
│   ├── index.css             # Global styles (Tailwind CSS)
│   │
│   ├── pages/                # Page components
│   │   ├── LoginPage.jsx     # Authentication - login
│   │   ├── SignupPage.jsx    # Authentication - signup
│   │   ├── VideosPage.jsx    # Dashboard with video grid
│   │   └── UploadPage.jsx    # Video upload with drag-drop
│   │
│   ├── components/           # Reusable components
│   │   ├── Layout.jsx        # Sidebar navigation wrapper
│   │   ├── RequireAuth.jsx   # Protected route HOC
│   │   ├── VideoPlayer.jsx   # Modal video player
│   │   ├── VideoCard.jsx     # Video card component
│   │   └── Loader.jsx        # Loading spinner
│   │
│   └── utils/                # Utilities
│       ├── api.js            # Axios instance with auth interceptor
│       └── socket.js         # Socket.io client instance
│
├── public/                   # Static assets
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.cjs      # Tailwind CSS configuration
├── eslint.config.js         # ESLint configuration
├── .env                     # Environment variables
└── README.md                # This file
```

## 🔧 Environment Variables

Create a `.env` file in the frontend directory:

```env
# Backend API Base URL
VITE_API_BASE=http://localhost:4000
```

For production deployment, update to your production backend URL:
```env
VITE_API_BASE=https://your-backend.railway.app
```

## 🎨 Features

### Pages

#### 1. Login Page (`/login`)
- Modern gradient design with branded logo
- Email and password authentication
- Link to signup page
- Error message display
- Auto-redirect on successful login

#### 2. Signup Page (`/signup`)
- Create new user accounts
- Fields: Email, Organization ID, Role, Password
- Role selection (Viewer, Editor, Admin)
- Password confirmation validation
- Success message and auto-redirect

#### 3. Videos Dashboard (`/`)
- **4 Gradient Stat Cards**: Total Videos, Processing, Safe, Flagged
- **Video Grid Layout**: Responsive card grid (1-4 columns)
- **Modal Video Player**: Click to play videos in modal
- **Advanced Filters**: Status, Sensitivity, Search by filename
- **Pagination**: Page navigation with ellipsis
- **Real-time Updates**: Progress bars and status updates via Socket.io
- **Empty State**: User-friendly message when no videos

#### 4. Upload Page (`/upload`)
- **Drag-and-Drop Zone**: Visual feedback for drag events
- **File Preview**: Show selected file details
- **Progress Bar**: Real-time upload progress
- **File Validation**: Client-side validation
- **Process Steps**: Visual guide (Upload → Analyze → Stream)
- **Auto-redirect**: Return to dashboard after success

### Components

#### Layout Component
- **Sidebar Navigation**: Collapsible on mobile
- **Role-Based Menu**: Hide/show items based on user role
- **User Info Footer**: Display tenant and role
- **Mobile Responsive**: Hamburger menu for mobile
- **Active Route Highlight**: Visual indicator for current page

#### VideoPlayer Component
- **Modal Overlay**: Full-screen video player
- **Video Controls**: Native HTML5 controls
- **Video Details**: Status, sensitivity, file size
- **Close Button**: Exit modal

#### RequireAuth Component
- **Route Protection**: Redirect to login if not authenticated
- **Token Validation**: Check localStorage for JWT

### Utils

#### api.js - Axios Instance
```javascript
import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000'
})

// Auto-attach JWT token to all requests
instance.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if(token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default instance
```

#### socket.js - Socket.io Client
```javascript
import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
const socket = io(URL, { reconnection: true })

export default socket
```

## 🎨 Design System

### Color Palette
- **Primary Gradient**: Blue (600) → Purple (600)
- **Success**: Green (500-600)
- **Warning**: Yellow (500) → Orange (500)
- **Danger**: Red (500) → Pink (600)
- **Neutral**: Gray (50-900)

### Components
- **Cards**: White background, rounded-xl, shadow-md/lg
- **Buttons**: Gradient or solid with hover states
- **Inputs**: Border with focus ring (blue-500)
- **Badges**: Colored backgrounds with matching text
- **Icons**: Heroicons via inline SVG

### Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

## 🔌 Real-Time Features

### Socket.io Integration

The app uses Socket.io for real-time updates:

```javascript
// Connect to Socket.io server
socket.on('connect', () => {
  const tenantId = localStorage.getItem('tenantId')
  socket.emit('join', tenantId) // Join tenant room
})

// Listen for video processing progress
socket.on('video:progress', (data) => {
  // data = { id: '...', percent: 45 }
  updateVideoProgress(data.id, data.percent)
})

// Listen for processing completion
socket.on('video:processed', (data) => {
  // data = { id: '...', sensitivity: 'safe' }
  updateVideoStatus(data.id, 'processed', data.sensitivity)
})
```

## 🛡️ Authentication Flow

### Login
1. User enters email and password
2. POST request to `/api/auth/login`
3. Receive JWT token
4. Store token in `localStorage`
5. Decode token to extract `tenantId` and `role`
6. Navigate to dashboard

### Signup
1. User fills signup form
2. POST request to `/api/auth/signup`
3. Account created
4. Redirect to login page

### Protected Routes
All routes except `/login` and `/signup` are protected:

```javascript
<Route
  path="/"
  element={
    <RequireAuth>
      <Layout>
        <VideosPage />
      </Layout>
    </RequireAuth>
  }
/>
```

### Logout
1. Clear `localStorage`
2. Navigate to login page

## 📱 Responsive Design

### Mobile (< 640px)
- Single column video grid
- Hamburger menu for navigation
- Stacked stat cards
- Full-width filters

### Tablet (640px - 1024px)
- 2-column video grid
- Visible sidebar
- 2-column stat cards

### Desktop (> 1024px)
- 3-4 column video grid
- Fixed sidebar navigation
- 4-column stat cards
- Optimal spacing

## 🎭 User Experience

### Loading States
- Spinner for initial page load
- Progress bars for uploads
- Skeleton screens for video grid (optional)
- Button disabled states

### Error Handling
- API error messages displayed in UI
- Form validation errors
- Network error messages
- 404 handling for invalid routes

### Success Feedback
- Success messages for actions
- Auto-redirect after success
- Real-time updates without refresh

## 🧪 Testing

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Signup creates new account
- [ ] Logout clears session
- [ ] Dashboard loads videos
- [ ] Filters work correctly
- [ ] Search finds videos
- [ ] Pagination works
- [ ] Upload with drag-drop
- [ ] Upload with file picker
- [ ] Real-time progress updates
- [ ] Video plays in modal
- [ ] Mobile responsive layout
- [ ] Role-based menu (Viewer vs Editor)

### Browser Compatibility
- ✅ Chrome/Edge (v100+)
- ✅ Firefox (v100+)
- ✅ Safari (v15+)

## 📦 Dependencies

### Core
- **react**: ^19.2.0 - UI library
- **react-dom**: ^19.2.0 - React DOM renderer
- **react-router-dom**: ^7.11.0 - Client-side routing

### Styling
- **tailwindcss**: ^4.1.18 - Utility-first CSS framework
- **@tailwindcss/vite**: ^4.1.18 - Vite integration

### HTTP & Real-Time
- **axios**: ^1.13.2 - HTTP client
- **socket.io-client**: ^4.8.3 - Real-time WebSocket client

### Development
- **vite**: ^7.2.4 - Build tool and dev server
- **@vitejs/plugin-react**: ^5.1.1 - React plugin for Vite
- **eslint**: ^9.39.1 - Code linting

## 🔍 Troubleshooting

### Vite Dev Server Won't Start
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Reinstall dependencies
rm -rf node_modules
npm install

# Start again
npm run dev
```

### API Connection Error
```bash
# Check .env file exists
cat .env

# Verify VITE_API_BASE is correct
# Ensure backend is running on that URL
# Check browser console for CORS errors
```

### Tailwind CSS Not Working
```bash
# Ensure @tailwindcss/vite is installed
npm list @tailwindcss/vite

# Check vite.config.js has Tailwind plugin
# Restart dev server
```

### Socket.io Not Connecting
```bash
# Check browser console for connection errors
# Verify backend Socket.io server is running
# Check VITE_API_BASE matches backend URL
```

## 🚀 Production Build

```bash
# Build for production
npm run build

# Output will be in dist/ directory
# Files are minified and optimized
# Ready to deploy to Vercel/Netlify
```

### Build Output
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js     # Optimized JavaScript
│   └── index-[hash].css    # Optimized CSS
└── ...
```

## 📈 Performance Optimization

- ✅ Code splitting with React.lazy (optional)
- ✅ Vite's fast HMR (Hot Module Replacement)
- ✅ Minified production build
- ✅ Optimized Tailwind CSS (unused classes removed)
- ✅ Single Socket.io connection (reused across app)

## 🎨 Customization

### Change Colors
Edit `tailwind.config.cjs`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
      }
    }
  }
}
```

### Change Logo
Replace the gradient logo SVG in `Layout.jsx`

### Add New Pages
1. Create component in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Layout.jsx` (if needed)

---

**Last Updated**: December 28, 2025
