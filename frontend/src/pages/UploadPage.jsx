import React, {useState} from 'react'
import axios from '../utils/api'

export default function UploadPage(){
  const [file,setFile]=useState(null)
  const [message,setMessage]=useState('')

  async function handleUpload(e){
    e.preventDefault()
    if(!file) return setMessage('Select a file')
    const form = new FormData()
    form.append('video', file)
    try{
      const res = await axios.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage('Upload started: ' + res.data.id)
    }catch(err){
      setMessage(err?.response?.data?.error || 'Upload failed')
    }
  }

  return (
    <div className="page">
      <h2>Upload Video</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept="video/*" onChange={e=>setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      <p>{message}</p>
    </div>
  )
}
