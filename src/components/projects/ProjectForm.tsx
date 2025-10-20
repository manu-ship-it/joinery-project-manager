'use client'

import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { Project } from '@/lib/supabase'

interface ProjectFormProps {
  onClose: () => void
  onSuccess: () => void
  project?: Project // Optional for editing
}

export function ProjectForm({ onClose, onSuccess, project }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    project_number: project?.project_number || '',
    client: project?.client || '',
    project_name: project?.project_name || '',
    project_address: project?.project_address || '',
    project_status: project?.project_status || 'planning',
    install_commencement_date: project?.install_commencement_date || '',
    install_duration: project?.install_duration || 1,
    overall_project_budget: project?.overall_project_budget || 0,
    priority_level: project?.priority_level || 'medium'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createProject, updateProject } = useProjects()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (project) {
        // Editing existing project
        const result = await updateProject.mutateAsync({ id: project.id, ...formData })
        console.log('Update project result:', result)
      } else {
        // Creating new project
        const result = await createProject.mutateAsync({
          ...formData,
          date_created: new Date().toISOString().split('T')[0]
        })
        console.log('Create project result:', result)
      }
      console.log('Project saved successfully, closing form')
      onSuccess()
    } catch (error: unknown) {
      console.error('Error saving project:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert(`Error saving project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'install_duration' || name === 'overall_project_budget' 
        ? Number(value) 
        : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {project ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Number *
              </label>
              <input
                type="text"
                name="project_number"
                value={formData.project_number}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., PJ-2024-001"
              />
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <input
                type="text"
                name="client"
                value={formData.client}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Client name"
              />
            </div>

            {/* Project Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Kitchen Renovation - Main Street"
              />
            </div>

            {/* Project Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Address *
              </label>
              <textarea
                name="project_address"
                value={formData.project_address}
                onChange={handleChange}
                required
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Full project address"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="project_status"
                value={formData.project_status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                name="priority_level"
                value={formData.priority_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Install Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Install Commencement Date
              </label>
              <input
                type="date"
                name="install_commencement_date"
                value={formData.install_commencement_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Install Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Install Duration (days)
              </label>
              <input
                type="number"
                name="install_duration"
                value={formData.install_duration}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Budget */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Project Budget ($)
              </label>
              <input
                type="number"
                name="overall_project_budget"
                value={formData.overall_project_budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}