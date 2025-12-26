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
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Upload Video</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <input className="w-full" type="file" accept="video/*" onChange={e=>setFile(e.target.files[0])} />
          </div>
          <div>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Upload</button>
          </div>
        </form>

        {uploadProgress > 0 && (
          <div className="mt-4 w-full bg-gray-100 rounded overflow-hidden h-6">
            <div className="h-6 bg-blue-500 text-white text-xs font-semibold flex items-center justify-center" style={{width: `${uploadProgress}%`}}>{uploadProgress}%</div>
          </div>
        )}

        {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
      </div>
    </div>
  )
}
