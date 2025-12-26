import { io } from 'socket.io-client'

const URL = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

// Single shared socket instance to avoid connect/disconnect churn in React dev
const socket = io(URL, { reconnection: true })

export default socket
