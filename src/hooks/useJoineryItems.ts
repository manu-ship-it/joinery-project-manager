'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { JoineryItem } from '@/lib/supabase'

export function useJoineryItems(projectId: string) {
  const [items, setItems] = useState<JoineryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('joinery_items')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('Error fetching joinery items:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchItems()
    }
  }, [projectId, fetchItems])

  const addItem = async (itemData: {
    item_name: string
    item_budget: number
    install_commencement_date?: string
    install_duration: number
  }) => {
    try {
      const { data, error } = await supabase
        .from('joinery_items')
        .insert([{
          project_id: projectId,
          ...itemData,
          // Initialize all checklist items as false
          shop_drawings_approved: false,
          board_ordered: false,
          hardware_ordered: false,
          site_measured: false,
          microvellum_ready_to_process: false,
          processed_to_factory: false,
          picked_up_from_factory: false,
          install_scheduled: false,
          plans_printed: false,
          assembled: false,
          delivered: false,
          installed: false,
          invoiced: false
        }])
        .select()
        .single()
      
      if (error) throw error
      setItems(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error adding joinery item:', err)
      throw err
    }
  }

  const updateItem = async (itemId: string, updates: Partial<JoineryItem>) => {
    try {
      const { data, error } = await supabase
        .from('joinery_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) throw error
      setItems(prev => prev.map(item => item.id === itemId ? data : item))
      return data
    } catch (err) {
      console.error('Error updating joinery item:', err)
      throw err
    }
  }

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('joinery_items')
        .delete()
        .eq('id', itemId)
      
      if (error) throw error
      setItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      console.error('Error deleting joinery item:', err)
      throw err
    }
  }

  const updateChecklistStep = async (itemId: string, stepKey: string, completed: boolean) => {
    try {
      const { data, error } = await supabase
        .from('joinery_items')
        .update({ [stepKey]: completed })
        .eq('id', itemId)
        .select()
        .single()
      
      if (error) throw error
      setItems(prev => prev.map(item => item.id === itemId ? data : item))
      return data
    } catch (err) {
      console.error('Error updating checklist step:', err)
      throw err
    }
  }

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    updateChecklistStep,
    refreshItems: fetchItems
  }
}

