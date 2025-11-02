'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Material } from '@/lib/supabase'

export function useMaterials(projectId: string) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMaterials = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setMaterials(data || [])
    } catch (err) {
      console.error('Error fetching materials:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    if (projectId) {
      fetchMaterials()
    }
  }, [projectId, fetchMaterials])

  const addMaterial = async (materialData: {
    material_name: string
    thickness: number
    board_size: string
    quantity: number
    supplier: string
    is_ordered: boolean
    order_number: string
  }) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([{
          project_id: projectId,
          ...materialData
        }])
        .select()
        .single()
      
      if (error) throw error
      setMaterials(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Error adding material:', err)
      throw err
    }
  }

  const updateMaterial = async (materialId: string, updates: Partial<Material>) => {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', materialId)
        .select()
        .single()
      
      if (error) throw error
      setMaterials(prev => prev.map(material => material.id === materialId ? data : material))
      return data
    } catch (err) {
      console.error('Error updating material:', err)
      throw err
    }
  }

  const deleteMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)
      
      if (error) throw error
      setMaterials(prev => prev.filter(material => material.id !== materialId))
    } catch (err) {
      console.error('Error deleting material:', err)
      throw err
    }
  }

  return {
    materials,
    isLoading,
    error,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    refreshMaterials: fetchMaterials
  }
}
