'use client'

import { Project } from '@/lib/supabase'

interface ProjectCardProps {
  project: Project
  daysUntilInstall: number | null
  urgencyColor: string
}

export function ProjectCard({ project, daysUntilInstall, urgencyColor }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{project.project_name}</h3>
        <p className="text-sm text-gray-600">Client: {project.client}</p>
        <p className="text-sm text-gray-600">Project #: {project.project_number}</p>
        <p className="text-sm text-gray-600">Status: {project.project_status}</p>
        <p className="text-sm text-gray-600">Budget: ${project.overall_project_budget}</p>
        <p className="text-sm text-gray-600">Address: {project.project_address}</p>
        {project.install_commencement_date && (
          <p className="text-sm text-gray-600">Install Date: {new Date(project.install_commencement_date).toLocaleDateString()}</p>
        )}
        {project.project_status === 'completed' ? (
          <div className="mt-2 p-2 rounded bg-blue-100 border border-blue-200">
            <span className="text-sm font-medium text-blue-800">
              Project Complete
            </span>
          </div>
        ) : daysUntilInstall !== null && (
          <div className={`mt-2 p-2 rounded ${urgencyColor}`}>
            <span className="text-sm font-medium">
              {daysUntilInstall > 0 ? `${daysUntilInstall} days until install` : 
               daysUntilInstall === 0 ? 'Install today' : 'Install overdue'}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}