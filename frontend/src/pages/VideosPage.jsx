import React, {useEffect, useState} from 'react'
import axios from '../utils/api'
import { io } from 'socket.io-client'

export default function VideosPage(){
  const [videos,setVideos]=useState([])
  const [socket,setSocket]=useState(null)

  useEffect(()=>{
    async function load(){
      try{
        const res = await axios.get('/api/videos')
        setVideos(res.data)
      }catch(err){
        console.error(err)
      }
    }
    load()

    const s = io(import.meta.env.VITE_API_BASE || 'http://localhost:4000')
    setSocket(s)
    // send join with JWT so server can place socket in tenant room
    s.on('connect', () => {
      const token = localStorage.getItem('token')
      if (token) s.emit('join', token)
    })

    s.on('video:progress', msg => {
      setVideos(prev => prev.map(v => v._id===msg.id?{...v, progress: msg.percent}:v))
    })
    s.on('video:processed', msg => {
      setVideos(prev => prev.map(v => v._id===msg.id?{...v, status:'processed', sensitivity: msg.sensitivity}:v))
    })

    return ()=> s.disconnect()
  },[])

  return (
    <div className="page">
      <h2>Videos</h2>
      <ul>
        {videos.map(v=> (
          <li key={v._id}>
            <strong>{v.originalName || v.filename}</strong>
            <div>status: {v.status} {v.progress? ` - ${v.progress}%`: null}</div>
            <div>sensitivity: {v.sensitivity}</div>
            {v.status === 'processed' ? (
              <video controls width="480" src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/uploads/${v.filename}`} />
            ) : (
              <div className="placeholder">Processing preview not available</div>
            )}
            <div className="progress-row">{v.progress ? (
              <div className="progress"><div className="bar" style={{width: `${v.progress}%`}}>{v.progress}%</div></div>
            ) : null}</div>
            <div><a href={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/uploads/${v.filename}`} target="_blank" rel="noreferrer">Open file</a></div>
          </li>
        ))}
      </ul>
    </div>
  )
}
