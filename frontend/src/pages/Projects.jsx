import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'

function ProjectCard({ project, onDelete, currentUser }) {
  const isOwner = project.ownerId === currentUser?.id
  const isAdmin = currentUser?.role === 'ADMIN'

  const handleDelete = async (e) => {
    e.preventDefault()
    if (!confirm('Delete this project? This cannot be undone.')) return
    try {
      await api.delete(`/projects/${project.id}`)
      onDelete(project.id)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete')
    }
  }

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-blue-100 text-blue-700',
    ON_HOLD: 'bg-yellow-100 text-yellow-700',
  }

  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'COMPLETED'

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <div className="card hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className={`badge ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
              {project.status}
            </span>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
        {project.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{project.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
          <span>By {project.ownerName}</span>
          {project.deadline && (
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {isOverdue ? '⚠ ' : '📅 '}
              {new Date(project.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '', status: 'ACTIVE', deadline: '', memberEmails: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const payload = {
        ...form,
        memberEmails: form.memberEmails ? form.memberEmails.split(',').map(e => e.trim()).filter(Boolean) : [],
        deadline: form.deadline || null
      }
      const res = await api.post('/projects', payload)
      onCreate(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">New Project</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input className="input-field" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" className="input-field" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Emails (comma-separated)</label>
            <input className="input-field" placeholder="a@b.com, c@d.com" value={form.memberEmails} onChange={e => setForm({...form, memberEmails: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).finally(() => setLoading(false))
  }, [])

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg">No projects yet</p>
            {isAdmin && <button onClick={() => setShowModal(true)} className="btn-primary mt-4">Create your first project</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} currentUser={user} onDelete={id => setProjects(prev => prev.filter(x => x.id !== id))} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={p => setProjects(prev => [p, ...prev])}
        />
      )}
    </div>
  )
}
