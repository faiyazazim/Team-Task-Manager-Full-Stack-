import { useState } from 'react'
import api from '../api/axios'

const PRIORITY_STYLES = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

const STATUS_STYLES = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
}

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']

export default function TaskCard({ task, onUpdate, onDelete, currentUser }) {
  const [updating, setUpdating] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const isAssignee = task.assigneeId === currentUser?.id
  const isCreator = task.createdById === currentUser?.id
  const isAdmin = currentUser?.role === 'ADMIN'
  const canChangeStatus = isAdmin || isAssignee || isCreator
  const canDelete = isAdmin || isCreator

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    setShowDropdown(false)
    try {
      const res = await api.patch(`/tasks/${task.id}/status`, { status: newStatus })
      onUpdate && onUpdate(res.data)
    } catch (err) {
      console.error('Failed to update status', err)
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      await api.delete(`/tasks/${task.id}`)
      onDelete && onDelete(task.id)
    } catch (err) {
      console.error('Failed to delete task', err)
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 flex-1 pr-2">{task.title}</h3>
        <div className="flex items-center gap-1">
          <span className={`badge ${PRIORITY_STYLES[task.priority] || 'bg-gray-100 text-gray-600'}`}>
            {task.priority}
          </span>
          {canDelete && (
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

      {task.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="relative">
          {canChangeStatus ? (
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={updating}
              className={`badge cursor-pointer hover:opacity-80 ${STATUS_STYLES[task.status] || 'bg-gray-100 text-gray-700'}`}
            >
              {updating ? '...' : task.status?.replace('_', ' ')}
              <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          ) : (
            <span className={`badge ${STATUS_STYLES[task.status] || 'bg-gray-100 text-gray-700'}`}>
              {task.status?.replace('_', ' ')}
            </span>
          )}

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          {task.assigneeName && (
            <span className="flex items-center gap-1">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium text-xs">
                {task.assigneeName.charAt(0)}
              </div>
              {task.assigneeName}
            </span>
          )}
          {task.dueDate && (
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              {isOverdue ? '⚠ ' : ''}
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {task.projectName && (
        <p className="text-xs text-gray-400 mt-2 truncate">📁 {task.projectName}</p>
      )}
    </div>
  )
}
