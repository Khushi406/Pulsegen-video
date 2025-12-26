import React, {useEffect, useState} from 'react'
import axios from '../utils/api'
import socket from '../utils/socket'

export default function VideosPage(){
  const [videos,setVideos]=useState([])
  const [clientSocket,setClientSocket]=useState(null)
  const [statusFilter,setStatusFilter] = useState('')
  const [sensitivityFilter,setSensitivityFilter] = useState('')
  const [searchTerm,setSearchTerm] = useState('')
  const [page,setPage] = useState(1)
  const [limit,setLimit] = useState(10)
  const [totalPages,setTotalPages] = useState(1)
  const [total,setTotal] = useState(0)
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    async function load(){
      try{
        const params = { page, limit }
        if (statusFilter) params.status = statusFilter
        if (sensitivityFilter) params.sensitivity = sensitivityFilter
        if (searchTerm) params.search = searchTerm

        const res = await axios.get('/api/videos', { params })
        // expected shape: { data, page, limit, total, totalPages }
        const payload = res.data
        if (payload && payload.data) {
          setVideos(payload.data)
          setPage(payload.page || 1)
          setLimit(payload.limit || limit)
          setTotalPages(payload.totalPages || 1)
          setTotal(payload.total || 0)
        } else {
          // fallback to older shape
          setVideos(Array.isArray(payload) ? payload : [])
          setTotal(payload.length || 0)
        }
        setLoading(false)
      }catch(err){
        setLoading(false)
        console.error(err)
      }
    }
    load()

    setClientSocket(socket)
    // send join with JWT so server can place socket in tenant room
    const onConnect = () => {
      const token = localStorage.getItem('token')
      if (token) socket.emit('join', token)
    }

    const onProgress = (msg) => setVideos(prev => prev.map(v => v._id===msg.id?{...v, progress: msg.percent}:v))
    const onProcessed = (msg) => setVideos(prev => prev.map(v => v._id===msg.id?{...v, status:'processed', sensitivity: msg.sensitivity}:v))

    socket.on('connect', onConnect)
    socket.on('video:progress', onProgress)
    socket.on('video:processed', onProcessed)

    return () => {
      if (!socket) return
      socket.off('connect', onConnect)
      socket.off('video:progress', onProgress)
      socket.off('video:processed', onProcessed)
    }
  },[])

  // refetch when filters change
  useEffect(() => { setPage(1) }, [statusFilter, sensitivityFilter, searchTerm, limit])

  useEffect(() => {
    async function reload(){
      setLoading(true)
      try{
        const params = { page, limit }
        if (statusFilter) params.status = statusFilter
        if (sensitivityFilter) params.sensitivity = sensitivityFilter
        if (searchTerm) params.search = searchTerm
        const res = await axios.get('/api/videos', { params })
        const payload = res.data
        if (payload && payload.data) {
          setVideos(payload.data)
          setPage(payload.page || 1)
          setLimit(payload.limit || limit)
          setTotalPages(payload.totalPages || 1)
          setTotal(payload.total || 0)
        } else {
          setVideos(Array.isArray(payload) ? payload : [])
          setTotal(payload.length || 0)
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    reload()
  }, [page, limit, statusFilter, sensitivityFilter, searchTerm])

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">Videos</h2>

      <div className="flex flex-wrap gap-3 items-center mb-4">
        <select className="px-3 py-2 border rounded-md bg-white" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="processing">Processing</option>
          <option value="processed">Processed</option>
          <option value="failed">Failed</option>
        </select>
        <select className="px-3 py-2 border rounded-md bg-white" value={sensitivityFilter} onChange={e=>setSensitivityFilter(e.target.value)}>
          <option value="">All sensitivity</option>
          <option value="safe">Safe</option>
          <option value="flagged">Flagged</option>
          <option value="unknown">Unknown</option>
        </select>
        <input className="px-3 py-2 border rounded-md bg-white" placeholder="Search filename" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        <select className="px-3 py-2 border rounded-md bg-white" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center"><span className="inline-block w-6 h-6 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></span></div>
      ) : videos.length === 0 ? (
        <div className="empty">No videos found.</div>
      ) : (
        <ul className="space-y-4">
          {videos.map(v=> (
            <li key={v._id} className="p-4 border rounded-md flex gap-4 items-start">
              <div className="w-48 h-28 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                {v.status === 'processed' ? (
                  <video className="w-full h-full object-cover" src={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/uploads/${v.filename}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Preview N/A</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <strong className="text-lg font-medium">{v.originalName || v.filename}</strong>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.status==='processing'?'bg-yellow-50 text-yellow-800':v.status==='processed'?'bg-green-50 text-green-800':v.status==='failed'?'bg-red-50 text-red-800':''}`}>{v.status}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${v.sensitivity==='safe'?'bg-green-50 text-green-800':v.sensitivity==='flagged'?'bg-orange-50 text-orange-800':v.sensitivity==='unknown'?'bg-gray-100 text-gray-700':''}`}>{v.sensitivity || 'n/a'}</span>
                  </div>
                </div>
                <div className="meta text-sm text-gray-500 mb-2">Uploaded: {new Date(v.createdAt).toLocaleString()} — Size: {Math.round((v.size||0)/1024)} KB</div>
                <div className="mb-2">
                  {v.progress ? (
                    <div className="w-48 bg-blue-50 rounded h-6 overflow-hidden">
                      <div className="h-6 bg-blue-500 text-white text-xs font-semibold flex items-center justify-center" style={{width: `${v.progress}%`}}>{v.progress}%</div>
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <a className="px-3 py-1 rounded bg-blue-600 text-white text-sm" href={`${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/uploads/${v.filename}`} target="_blank" rel="noreferrer">Open</a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3 items-center mt-4">
        <button className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
        <div className="text-sm">Page {page} / {totalPages} — {total} items</div>
        <button className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
      </div>
    </div>
  )
}
