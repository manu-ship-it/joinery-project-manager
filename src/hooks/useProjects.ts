'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Project } from '@/lib/supabase'

export function useProjects() {
  const queryClient = useQueryClient()

  // Fetch all projects
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      console.log('Fetching projects...')
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('Projects fetch result:', { data, error })
      
      if (error) {
        console.error('Error fetching projects:', error)
        throw error
      }
      return data as Project[]
    }
  })

  // Create project mutation
  const createProject = useMutation({
    mutationFn: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating project with data:', projectData)
      
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          date_created: new Date().toISOString().split('T')[0]
        }])
        .select()
        .single()
      
      console.log('Supabase response:', { data, error })
      
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  // Update project mutation
  const updateProject = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  // Delete project mutation
  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })

  // Fetch single project
  const useProject = (id: string) => {
    return useQuery({
      queryKey: ['project', id],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data as Project
      },
      enabled: !!id
    })
  }

  return {
    projects,
    isLoading,
    error,
    createProject,
    updateProject,
    deleteProject,
    useProject
  }
}