'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ProjectTask } from '@/lib/supabase'

export function useProjectTasks(projectId: string) {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTasks(data || [])
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchTasks()
    }
  }, [projectId, fetchTasks])

  const addTask = async (taskDescription: string) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .insert([{
          project_id: projectId,
          task_description: taskDescription,
          is_completed: false
        }])
        .select()
        .single()
      
      if (error) throw error
      setTasks(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error adding task:', err)
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<ProjectTask>) => {
    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()
      
      if (error) throw error
      setTasks(prev => prev.map(task => task.id === taskId ? data : task))
      return data
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      await updateTask(taskId, { is_completed: !task.is_completed })
    } catch (err) {
      console.error('Error toggling task:', err)
      throw err
    }
  }

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    refreshTasks: fetchTasks
  }
}

