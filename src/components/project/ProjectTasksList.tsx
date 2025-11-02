'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Check, X } from 'lucide-react'
import { ProjectTask } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface ProjectTasksListProps {
  projectId: string
  tasks: ProjectTask[]
  onTasksChange: () => void
}

export function ProjectTasksList({ projectId, tasks, onTasksChange }: ProjectTasksListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [newTaskDescription, setNewTaskDescription] = useState('')

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskDescription.trim()) return

    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert([{
          project_id: projectId,
          task_description: newTaskDescription.trim(),
          is_completed: false
        }])
      
      if (error) throw error
      
      setNewTaskDescription('')
      setShowAddForm(false)
      onTasksChange()
    } catch (error) {
      console.error('Error adding task:', error)
      alert('Error adding task. Please try again.')
    }
  }

  const handleToggleTask = async (task: ProjectTask) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ is_completed: !task.is_completed })
        .eq('id', task.id)
      
      if (error) throw error
      onTasksChange()
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Error updating task. Please try again.')
    }
  }

  const handleEditTask = async (task: ProjectTask, newDescription: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ task_description: newDescription.trim() })
        .eq('id', task.id)
      
      if (error) throw error
      
      setEditingTask(null)
      onTasksChange()
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Error updating task. Please try again.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
      onTasksChange()
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error deleting task. Please try again.')
    }
  }

  const completedTasks = tasks.filter(task => task.is_completed).length
  const totalTasks = tasks.length
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
          <p className="text-sm text-gray-600">
            {completedTasks} of {totalTasks} tasks completed ({completionPercentage}%)
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
      )}

      {/* Add Task Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <form onSubmit={handleAddTask} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Description
              </label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setNewTaskDescription('')
                }}
                className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No tasks yet. Add your first task to get started.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center space-x-3 p-3 bg-white border rounded-lg ${
                task.is_completed ? 'bg-green-50 border-green-200' : 'border-gray-200'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggleTask(task)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  task.is_completed
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 hover:border-green-500'
                }`}
              >
                {task.is_completed && <Check className="h-3 w-3" />}
              </button>

              {/* Task Description */}
              <div className="flex-1 min-w-0">
                {editingTask?.id === task.id ? (
                  <TaskEditForm
                    task={task}
                    onSave={(description) => handleEditTask(task, description)}
                    onCancel={() => setEditingTask(null)}
                  />
                ) : (
                  <p className={`text-sm ${
                    task.is_completed ? 'line-through text-gray-500' : 'text-gray-900'
                  }`}>
                    {task.task_description}
                  </p>
                )}
              </div>

              {/* Actions */}
              {editingTask?.id !== task.id && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit task"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Inline edit form component
function TaskEditForm({ 
  task, 
  onSave, 
  onCancel 
}: { 
  task: ProjectTask
  onSave: (description: string) => void
  onCancel: () => void 
}) {
  const [description, setDescription] = useState(task.task_description)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (description.trim()) {
      onSave(description)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoFocus
      />
      <button
        type="submit"
        className="p-1 text-green-600 hover:text-green-700 transition-colors"
        title="Save"
      >
        <Check className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Cancel"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  )
}


