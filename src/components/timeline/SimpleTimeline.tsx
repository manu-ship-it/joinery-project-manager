'use client'

import { Project } from '@/lib/supabase'

interface SimpleTimelineProps {
  projects: Project[]
}

export function SimpleTimeline({ projects }: SimpleTimelineProps) {
  // Filter projects with install dates
  const timelineProjects = projects.filter(project => 
    (project.project_status === 'planning' || project.project_status === 'in_progress') &&
    project.install_commencement_date
  )

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

  // Get today's date (browser local time)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get date range from projects
  const getDateRange = () => {
    const dates = timelineProjects.map(p => {
      const date = new Date(p.install_commencement_date!)
      date.setHours(0, 0, 0, 0)
      return date
    })
    
    const minDate = new Date(Math.min(...dates.map(d => d.getTime()), today.getTime()))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime()), today.getTime()))
    
    // Add padding
    minDate.setDate(minDate.getDate() - 3)
    maxDate.setDate(maxDate.getDate() + 3)
    
    return { start: minDate, end: maxDate }
  }

  const { start: timelineStart, end: timelineEnd } = getDateRange()

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

  // Get position of a date on the timeline
  const getDatePosition = (date: Date) => {
    const timelineDuration = timelineEnd.getTime() - timelineStart.getTime()
    const dateOffset = date.getTime() - timelineStart.getTime()
    return (dateOffset / timelineDuration) * 100
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-500'
      case 'in_progress': return 'bg-green-500'
      case 'on_hold': return 'bg-yellow-500'
      case 'completed': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
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
        <div className="min-w-[1000px]">
          {/* Date Headers */}
          <div className="flex border-b">
            <div className="w-48 p-3 border-r bg-gray-50">
              <span className="text-sm font-medium text-gray-700">Project</span>
            </div>
            <div className="flex-1 relative min-w-[600px]">
              <div className="flex">
                {dateHeaders.map((date, index) => (
                  <div
                    key={index}
                    className={`text-center text-xs py-2 border-r border-gray-200 ${
                      date.toDateString() === today.toDateString() 
                        ? 'bg-red-100 text-red-800 font-semibold' 
                        : 'bg-gray-50'
                    }`}
                    style={{ 
                      width: `${100 / dateHeaders.length}%`,
                      minWidth: '40px'
                    }}
                    title={date.toLocaleDateString()}
                  >
                    {date.getDate()}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Rows */}
          <div className="divide-y">
            {timelineProjects.map((project) => {
              const installDate = new Date(project.install_commencement_date!)
              installDate.setHours(0, 0, 0, 0)
              
              const duration = project.install_duration || 1
              const endDate = new Date(installDate)
              endDate.setDate(endDate.getDate() + duration - 1)
              endDate.setHours(0, 0, 0, 0)
              
              const barStartPosition = getDatePosition(installDate)
              const barEndPosition = getDatePosition(endDate)
              const barWidth = barEndPosition - barStartPosition
              const todayPosition = getDatePosition(today)

              return (
                <div key={project.id} className="flex items-center py-3">
                  {/* Project Name */}
                  <div className="w-48 p-3 border-r">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {project.project_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {project.client}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative min-w-[600px]">
                    <div className="relative h-full w-full">
                      {/* Grid structure matching header columns exactly */}
                      <div className="absolute inset-0 flex">
                        {dateHeaders.map((date, index) => (
                          <div
                            key={index}
                            className="border-r border-gray-200"
                            style={{ 
                              width: `${100 / dateHeaders.length}%`,
                              minWidth: '40px'
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Today line */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" 
                        style={{ left: `${todayPosition}%` }}
                        title="Today"
                      />
                      
                      {/* Project Bar */}
                      <div 
                        className={`absolute top-1/2 transform -translate-y-1/2 h-6 rounded ${getStatusColor(project.project_status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer border-2 border-white`}
                        style={{ 
                          left: `${barStartPosition}%`,
                          width: `${Math.max(barWidth, 2)}%`
                        }}
                        title={`${project.project_name} - ${duration} day${duration !== 1 ? 's' : ''} install (${installDate.toLocaleDateString()} to ${endDate.toLocaleDateString()})`}
                      >
                        <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                          {duration}d
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}