'use client'

import { Project } from '@/lib/supabase'

interface BasicTimelineProps {
  projects: Project[]
}

export function BasicTimeline({ projects }: BasicTimelineProps) {
  // Filter projects with install dates and sort by install date
  const timelineProjects = projects
    .filter(project => 
      (project.project_status === 'planning' || project.project_status === 'in_progress') &&
      project.install_commencement_date
    )
    .sort((a, b) => {
      const dateA = new Date(a.install_commencement_date!)
      const dateB = new Date(b.install_commencement_date!)
      return dateA.getTime() - dateB.getTime()
    })

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

  // Get today's date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get all dates from projects
  const allDates = timelineProjects.map(p => {
    const date = new Date(p.install_commencement_date!)
    date.setHours(0, 0, 0, 0)
    return date
  })

  // Add today to dates
  allDates.push(today)

  // Get date range
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))

  // Add padding
  minDate.setDate(minDate.getDate() - 2)
  maxDate.setDate(maxDate.getDate() + 2)

  // Generate date headers (shifted forward 24 hours to align with bars)
  const dateHeaders = []
  const current = new Date(minDate)
  // Shift forward by 1 day to align with timeline bars
  current.setDate(current.getDate() + 1)
  while (current <= maxDate) {
    dateHeaders.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  // Get position of a date (column-based to match headers)
  const getDatePosition = (date: Date) => {
    const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    const daysFromStart = (date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    // Use the same column width as headers
    return (daysFromStart / totalDays) * 100
  }

  // Use fixed pixel width for columns
  const COLUMN_WIDTH_PX = 60
  
  const getActualColumnWidth = () => {
    console.log('Column width calculation:', {
      dateHeadersLength: dateHeaders.length,
      columnWidthPx: COLUMN_WIDTH_PX
    })
    return COLUMN_WIDTH_PX
  }

  // Get position for date headers (shifted back 24 hours to align with bars)
  const getHeaderPosition = (date: Date) => {
    const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    const daysFromStart = (date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
    // Shift back by 1 day to align with timeline bars
    const adjustedDays = daysFromStart - 1
    return (adjustedDays / totalDays) * 100
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
      
      <div className="p-4">
        {/* Date headers */}
        <div className="flex mb-2">
          <div className="w-64 pr-4 flex-shrink-0"></div>
          <div className="flex-1 relative overflow-hidden">
            <div className="flex">
              {dateHeaders.map((date, index) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6
                const isToday = date.toDateString() === today.toDateString()
                
                return (
                  <div
                    key={index}
                    className={`text-center text-xs py-1 border-r border-gray-200 flex-shrink-0 ${
                      isToday 
                        ? 'bg-red-100 text-red-800 font-semibold' 
                        : isWeekend 
                        ? 'bg-gray-200 text-gray-600' 
                        : 'bg-gray-50 text-gray-700'
                    }`}
                    style={{ 
                      width: `${COLUMN_WIDTH_PX}px`,
                      minWidth: `${COLUMN_WIDTH_PX}px`
                    }}
                    onLoad={() => {
                      console.log('Header column calculation:', {
                        dateHeadersLength: dateHeaders.length,
                        columnWidthPx: COLUMN_WIDTH_PX
                      })
                    }}
                    title={date.toLocaleDateString()}
                  >
                    {date.getDate()}/{String(date.getMonth() + 1).padStart(2, '0')}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Timeline grid */}
        <div className="space-y-3">
          {timelineProjects.map((project) => {
            const installDate = new Date(project.install_commencement_date!)
            installDate.setHours(0, 0, 0, 0)
            
            const duration = project.install_duration || 1
            const endDate = new Date(installDate)
            endDate.setDate(endDate.getDate() + duration - 1)
            endDate.setHours(0, 0, 0, 0)

            // Find which date header columns this project spans
            const startColumnIndex = dateHeaders.findIndex(d => d.toDateString() === installDate.toDateString())
            const endColumnIndex = dateHeaders.findIndex(d => d.toDateString() === endDate.toDateString())
            
            let startPos, width, todayPos
            
            // If dates are found in headers, use exact column positioning
            if (startColumnIndex !== -1 && endColumnIndex !== -1) {
              const columnWidth = getActualColumnWidth()
              startPos = startColumnIndex * columnWidth
              const endPos = (endColumnIndex + 1) * columnWidth
              width = endPos - startPos
              
              // Find today's column
              const todayColumnIndex = dateHeaders.findIndex(d => d.toDateString() === today.toDateString())
              todayPos = todayColumnIndex !== -1 ? todayColumnIndex * columnWidth : 0
              
              console.log('Bar calculation (column-based):', {
                projectName: project.project_name,
                startColumnIndex,
                endColumnIndex,
                columnWidth,
                startPos,
                endPos,
                width,
                duration
              })
            } else {
              // Fallback to pixel-based calculation
              const columnWidth = getActualColumnWidth()
              const totalDays = (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
              const daysFromStart = (installDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
              const daysFromEnd = (endDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)
              
              startPos = (daysFromStart / totalDays) * (dateHeaders.length * columnWidth)
              const endPos = (daysFromEnd / totalDays) * (dateHeaders.length * columnWidth)
              width = endPos - startPos
              todayPos = ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * (dateHeaders.length * columnWidth)
              
              // Ensure minimum width matches header columns
              width = Math.max(width, columnWidth)
              
              console.log('Bar calculation (pixel-based):', {
                projectName: project.project_name,
                startPos,
                endPos,
                width,
                columnWidth,
                duration
              })
            }

            return (
              <div key={project.id} className="flex items-center">
                {/* Project info column */}
                <div className="w-64 pr-4 flex-shrink-0">
                  <h3 className="font-medium text-gray-900 truncate">{project.project_name}</h3>
                  <p className="text-sm text-gray-500 truncate">{project.client}</p>
                  <p className="text-xs text-gray-400">
                    {installDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </p>
                </div>

                {/* Timeline bar column */}
                <div className="flex-1 relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                  {/* Today line */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-red-500 z-10" 
                    style={{ left: `${todayPos}px` }}
                    title="Today"
                  />
                  
                  {/* Project bar */}
                  <div 
                    className={`absolute top-1 bottom-1 rounded ${getStatusColor(project.project_status)} opacity-80`}
                    style={{ 
                      left: `${startPos}px`,
                      width: `${width}px`
                    }}
                    title={`${project.project_name} - ${duration} day${duration !== 1 ? 's' : ''}`}
                  >
                    <div className="h-full flex items-center justify-center text-white text-xs font-medium">
                      {duration}d
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
