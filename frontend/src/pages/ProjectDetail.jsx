import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'

function AddTaskModal({ projectId, projectMembers, onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', status: 'TODO', dueDate: '', assigneeId: '', projectId })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, assigneeId: form.assigneeId ? Number(form.assigneeId) : null, dueDate: form.dueDate || null }
      const res = await api.post('/tasks', payload)
      onCreate(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input className="input-field" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field resize-none" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select className="input-field" value={form.assigneeId} onChange={e => setForm({...form, assigneeId: e.target.value})}>
              <option value="">Unassigned</option>
              {projectMembers.map(m => (
                <option key={m.userId} value={m.userId}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddMemberModal({ projectId, onClose, onAdd }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post(`/projects/${projectId}/members`, { email, role })
      onAdd(res.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" className="input-field" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="input-field" value={role} onChange={e => setRole(e.target.value)}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks/project/${id}`)
    ]).then(([pRes, tRes]) => {
      setProject(pRes.data)
      setTasks(tRes.data)
    }).catch(() => navigate('/projects'))
    .finally(() => setLoading(false))
  }, [id])

  const isOwner = project?.ownerId === user?.id
  const currentMember = project?.members?.find(m => m.userId === user?.id)
  const isAdminMember = isOwner || currentMember?.role === 'ADMIN' || user?.role === 'ADMIN'

  const removeMember = async (userId) => {
    if (!confirm('Remove this member?')) return
    try {
      await api.delete(`/projects/${id}/members/${userId}`)
      setProject(prev => ({ ...prev, members: prev.members.filter(m => m.userId !== userId) }))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove member')
    }
  }

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
                <span className={`badge ${
                  project?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                  project?.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{project?.status}</span>
              </div>
              {project?.description && <p className="text-gray-500 mb-2">{project.description}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Owner: {project?.ownerName}</span>
                {project?.deadline && <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>}
              </div>
            </div>
            {isAdminMember && (
              <div className="flex gap-2">
                <button onClick={() => setShowMemberModal(true)} className="btn-secondary text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Member
                </button>
                <button onClick={() => setShowTaskModal(true)} className="btn-primary text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Task
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tasks */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tasks ({filteredTasks.length})</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {['ALL', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(s => (
                  <button
                    key={s}
                    onClick={() => setFilter(s)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                      filter === s ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {s === 'ALL' ? 'All' : s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-400">No tasks {filter !== 'ALL' ? `with status "${filter.replace('_', ' ')}"` : 'yet'}</p>
                {isAdminMember && filter === 'ALL' && (
                  <button onClick={() => setShowTaskModal(true)} className="btn-primary mt-3 text-sm">Create first task</button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredTasks.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    currentUser={user}
                    onUpdate={updated => setTasks(prev => prev.map(x => x.id === updated.id ? updated : x))}
                    onDelete={tid => setTasks(prev => prev.filter(x => x.id !== tid))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Members Sidebar */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Members ({project?.members?.length || 0})</h2>
            <div className="space-y-2">
              {project?.members?.map(m => (
                <div key={m.id} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm">
                      {m.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.name}</p>
                      <span className={`badge text-xs ${m.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                        {m.role}
                      </span>
                    </div>
                  </div>
                  {isAdminMember && m.userId !== project?.ownerId && (
                    <button onClick={() => removeMember(m.userId)} className="text-gray-400 hover:text-red-600 text-xs">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <AddTaskModal
          projectId={Number(id)}
          projectMembers={project?.members || []}
          onClose={() => setShowTaskModal(false)}
          onCreate={t => setTasks(prev => [t, ...prev])}
        />
      )}
      {showMemberModal && (
        <AddMemberModal
          projectId={id}
          onClose={() => setShowMemberModal(false)}
          onAdd={m => setProject(prev => ({ ...prev, members: [...(prev.members || []), m] }))}
        />
      )}
    </div>
  )
}
