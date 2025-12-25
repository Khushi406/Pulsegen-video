import React, {useState} from 'react'
import axios from '../utils/api'

export default function LoginPage(){
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
+  const [message,setMessage]=useState('')

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
    <div className="page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
    </div>
  )
}
