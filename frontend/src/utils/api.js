import axios from 'axios'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000'
})

// Attach JWT if present
instance.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if(token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

export default instance
