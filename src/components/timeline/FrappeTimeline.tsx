'use client'

import { useEffect, useRef } from 'react'
import { Project } from '@/lib/supabase'

interface FrappeTimelineProps {
  projects: Project[]
}

export function FrappeTimeline({ projects }: FrappeTimelineProps) {
  const ganttRef = useRef<HTMLDivElement>(null)

  // Filter projects with install dates
  const timelineProjects = projects.filter(project => 
    (project.project_status === 'planning' || project.project_status === 'in_progress') &&
    project.install_commencement_date
  )

  useEffect(() => {
    if (!ganttRef.current || timelineProjects.length === 0) return

    // Import Frappe Gantt dynamically
    import('frappe-gantt').then((frappeGantt) => {
      // Convert projects to Frappe Gantt format
      const tasks = timelineProjects.map((project, index) => {
        const startDate = new Date(project.install_commencement_date!)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + (project.install_duration || 1) - 1)

        return {
          id: project.id,
          name: project.project_name,
          start: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
          end: endDate.toISOString().split('T')[0],
          progress: project.project_status === 'in_progress' ? 50 : 0,
          custom_class: project.project_status === 'planning' ? 'planning' : 'in-progress'
        }
      })

      // Clear previous gantt
      ganttRef.current.innerHTML = ''

      // Create new gantt - try different import methods
      const Gantt = frappeGantt.default || frappeGantt.Gantt || frappeGantt
      const gantt = new Gantt(ganttRef.current, tasks, {
        header_height: 50,
        column_width: 30,
        step: 24,
        view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
        bar_height: 20,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        popup_trigger: 'click',
        date_format: 'YYYY-MM-DD',
        on_click: (task: any) => {
          console.log('Task clicked:', task)
        },
        on_date_change: (task: any, start: any, end: any) => {
          console.log('Date changed:', task, start, end)
        },
        on_progress_change: (task: any, progress: any) => {
          console.log('Progress changed:', task, progress)
        },
        on_view_change: (mode: any) => {
          console.log('View changed:', mode)
        }
      })

      // Add custom CSS for status colors
      const style = document.createElement('style')
      style.textContent = `
        .gantt .bar.planning {
          fill: #3b82f6;
        }
        .gantt .bar.in-progress {
          fill: #10b981;
        }
        .gantt .bar.completed {
          fill: #6b7280;
        }
        .gantt .bar.on-hold {
          fill: #f59e0b;
        }
      `
      document.head.appendChild(style)
    }).catch((error) => {
      console.error('Error loading Frappe Gantt:', error)
    })
  }, [timelineProjects])

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
      
      <div className="p-4">
        <div ref={ganttRef} className="w-full" />
      </div>
    </div>
  )
}
