import React, {useState} from 'react'
import axios from '../utils/api'

export default function UploadPage(){
  const [file,setFile]=useState(null)
  const [message,setMessage]=useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  async function handleUpload(e){
    e.preventDefault()
    if(!file) return setMessage('Select a file')
    const form = new FormData()
    form.append('video', file)
    try{
      const res = await axios.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            setUploadProgress(percent)
          }
        }
      })
      setMessage('Upload started: ' + res.data.id)
      setUploadProgress(0)
    }catch(err){
      setMessage(err?.response?.data?.error || 'Upload failed')
      setUploadProgress(0)
    }
  }

  return (
    <div className="page">
      <h2>Upload Video</h2>
      <form onSubmit={handleUpload}>
        <input type="file" accept="video/*" onChange={e=>setFile(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      {uploadProgress > 0 && (
        <div className="progress">
          <div className="bar" style={{width: `${uploadProgress}%`}}>{uploadProgress}%</div>
        </div>
      )}
      <p>{message}</p>
    </div>
  )
}
