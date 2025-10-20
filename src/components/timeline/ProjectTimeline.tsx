'use client'

import { Project } from '@/lib/supabase'

interface ProjectTimelineProps {
  projects: Project[]
}

export function ProjectTimeline({ projects }: ProjectTimelineProps) {
  // Filter to only planning and in_progress projects with install dates
  const timelineProjects = projects.filter(project => 
    (project.project_status === 'planning' || project.project_status === 'in_progress') &&
    project.install_commencement_date
  )

  // Get date range for timeline
  const getDateRange = () => {
    if (timelineProjects.length === 0) return { start: new Date(), end: new Date() }
    
    const dates = timelineProjects.map(p => {
      const date = new Date(p.install_commencement_date!)
      return date
    })
    
    const start = new Date(Math.min(...dates.map(d => d.getTime())))
    const end = new Date(Math.max(...dates.map(d => d.getTime())))
    
    // Always include today in the timeline range
    const today = new Date()
    const minStart = new Date(Math.min(start.getTime(), today.getTime()))
    const maxEnd = new Date(Math.max(end.getTime(), today.getTime()))
    
    // Add some padding
    minStart.setDate(minStart.getDate() - 7)
    maxEnd.setDate(maxEnd.getDate() + 7)
    
    return { start: minStart, end: maxEnd }
  }

  const { start: timelineStart, end: timelineEnd } = getDateRange()
  const today = new Date()
  

  // Generate date headers
  const generateDateHeaders = () => {
    const dates = []
    const current = new Date(timelineStart)
    
    while (current <= timelineEnd) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  const dateHeaders = generateDateHeaders()

  // Calculate bar position and width
  const getBarStyle = (project: Project) => {
    const installDate = new Date(project.install_commencement_date!)
    const duration = project.install_duration || 1
    
    // Calculate position as percentage of timeline
    const timelineDuration = timelineEnd.getTime() - timelineStart.getTime()
    const projectStart = installDate.getTime() - timelineStart.getTime()
    const leftPercent = Math.max(0, (projectStart / timelineDuration) * 100)
    
    // Calculate width as percentage - use a minimum width for visibility
    const projectDuration = duration * 24 * 60 * 60 * 1000 // Convert days to milliseconds
    const widthPercent = Math.max(2, (projectDuration / timelineDuration) * 100) // Minimum 2% width
    
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    }
  }

  const getStatusColor = (project: Project) => {
    switch (project.project_status) {
      case 'in_progress':
        return 'bg-blue-500'
      case 'planning':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-AU', { 
      day: 'numeric', 
      month: 'short' 
    })
  }

  const isToday = (date: Date) => {
    const todayStr = today.toDateString()
    const dateStr = date.toDateString()
    return todayStr === dateStr
  }

  if (timelineProjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Timeline Data</h3>
        <p className="text-gray-500">
          No projects with install dates in planning or in progress status.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Project Install Timeline</h2>
        <p className="text-sm text-gray-600">
          Showing {timelineProjects.length} project{timelineProjects.length !== 1 ? 's' : ''} with scheduled installs
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Date Headers */}
          <div className="flex border-b">
            <div className="w-64 flex-shrink-0 p-3 border-r bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Project</span>
            </div>
            <div className="flex-1 relative">
              <div className="flex">
                {dateHeaders.map((date, index) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-8 text-xs text-center py-2 border-r ${
                      isToday(date) ? 'bg-red-100 text-red-800 font-semibold' : 'bg-gray-50'
                    }`}
                    title={formatDate(date)}
                  >
                    {date.getDate()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Rows */}
          <div className="divide-y">
            {timelineProjects.map((project) => (
              <div key={project.id} className="flex min-h-[60px]">
                {/* Project Name Column */}
                <div className="w-64 flex-shrink-0 p-3 border-r bg-gray-50">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{project.project_name}</h4>
                    <p className="text-xs text-gray-600">{project.client}</p>
                    <p className="text-xs text-gray-500">#{project.project_number}</p>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        project.project_status === 'in_progress' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.project_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Column */}
                <div className="flex-1 relative min-w-[800px]">
                  <div className="relative h-full w-full">
                    {/* Debug: Timeline boundaries */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-green-500 z-5" 
                         style={{ left: '0%' }} title="Timeline Start">
                    </div>
                    <div className="absolute top-0 bottom-0 w-0.5 bg-purple-500 z-5" 
                         style={{ left: '100%' }} title="Timeline End">
                    </div>
                    
                    {/* Debug: Show timeline width */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-300 z-1" title="Timeline Width">
                    </div>
                    
                    {/* Today line */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" 
                         style={{ left: `${((today.getTime() - timelineStart.getTime()) / (timelineEnd.getTime() - timelineStart.getTime())) * 100}%` }}>
                    </div>
                    
                    {/* Project Bar */}
                    <div className="absolute top-1/2 transform -translate-y-1/2 h-6 rounded">
                      {(() => {
                        const barStyle = getBarStyle(project)
                        const installDate = new Date(project.install_commencement_date!)
                        const isInRange = installDate >= timelineStart && installDate <= timelineEnd
                        
                        
                        if (!isInRange) {
                          return (
                            <div className="h-6 flex items-center justify-center text-gray-400 text-xs">
                              Outside range
                            </div>
                          )
                        }
                        
                        return (
                          <div
                            className={`h-6 rounded ${getStatusColor(project)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer border-2 border-white`}
                            style={barStyle}
                            title={`${project.project_name} - ${project.install_duration || 1} day${(project.install_duration || 1) !== 1 ? 's' : ''} install`}
                          >
                            <div className="h-full flex items-center justify-center text-white text-xs font-medium px-2">
                              {project.install_duration || 1}d
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Planning</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-0.5 h-4 bg-red-500"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
