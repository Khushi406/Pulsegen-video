import React, {useState} from 'react'
import axios from '../utils/api'

export default function LoginPage(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [message,setMessage]=useState('')

  async function handleSubmit(e){
    e.preventDefault()
    try{
      const res = await axios.post('/api/auth/login', { email, password })
      const token = res.data.token
      localStorage.setItem('token', token)
      setMessage('Logged in')
    }catch(err){
      setMessage(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input className="mt-1 w-full px-3 py-2 border rounded-md" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="mt-1 w-full px-3 py-2 border rounded-md" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Login</button>
          </div>
        </form>
        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      </div>
    </div>
  )
}
