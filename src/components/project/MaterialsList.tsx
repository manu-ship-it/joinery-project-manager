'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, X, Package, Hash, Ruler, Users, ShoppingCart, CheckCircle } from 'lucide-react'
import { Material } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface MaterialsListProps {
  projectId: string
  materials: Material[]
  onMaterialsChange: () => void
}

export function MaterialsList({ projectId, materials, onMaterialsChange }: MaterialsListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)

  const handleAddMaterial = async (materialData: {
    material_name: string
    thickness: number
    board_size: string
    quantity: number
    supplier: string
    is_ordered: boolean
    order_number: string
  }) => {
    try {
      const { error } = await supabase
        .from('materials')
        .insert([{
          project_id: projectId,
          ...materialData
        }])
      
      if (error) throw error
      
      setShowAddForm(false)
      onMaterialsChange()
    } catch (error) {
      console.error('Error adding material:', error)
      alert('Error adding material. Please try again.')
    }
  }

  const handleEditMaterial = async (materialId: string, updates: Partial<Material>) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update(updates)
        .eq('id', materialId)
      
      if (error) throw error
      
      setEditingMaterial(null)
      onMaterialsChange()
    } catch (error) {
      console.error('Error updating material:', error)
      alert('Error updating material. Please try again.')
    }
  }

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)
      
      if (error) throw error
      onMaterialsChange()
    } catch (error) {
      console.error('Error deleting material:', error)
      alert('Error deleting material. Please try again.')
    }
  }

  const handleOrderStatusUpdate = async (materialId: string, isOrdered: boolean, orderNumber?: string) => {
    try {
      const { error } = await supabase
        .from('materials')
        .update({ 
          is_ordered: isOrdered,
          order_number: orderNumber || ''
        })
        .eq('id', materialId)
      
      if (error) throw error
      onMaterialsChange()
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error updating order status. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Materials</h3>
          <p className="text-sm text-gray-600">
            Track materials and supplies for this project
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Material</span>
        </button>
      </div>

      {/* Add Material Form */}
      {showAddForm && (
        <MaterialForm
          onSave={handleAddMaterial}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Materials List */}
      <div className="space-y-4">
        {materials.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No materials yet. Add your first material to get started.</p>
          </div>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="bg-white border rounded-lg shadow-sm">
              {/* Material Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{material.material_name}</h4>
                        {material.is_ordered && (
                          <span className="flex items-center space-x-1 text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Ordered</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1">
                          <Ruler className="h-4 w-4" />
                          <span>{material.thickness}mm thick</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Hash className="h-4 w-4" />
                          <span>Qty: {material.quantity}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{material.supplier}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingMaterial(material)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit material"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Material Details */}
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Board Size</p>
                    <p className="text-sm text-gray-900">{material.board_size}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Cost Estimate</p>
                    <p className="text-sm text-gray-900">
                      ${(material.quantity * (material.thickness * 0.1)).toFixed(2)} 
                      <span className="text-xs text-gray-500">(estimated)</span>
                    </p>
                  </div>
                </div>

                {/* Order Status Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={material.is_ordered}
                          onChange={(e) => {
                            const isOrdered = e.target.checked
                            if (isOrdered && !material.order_number) {
                              const orderNumber = prompt('Enter order number:')
                              if (orderNumber) {
                                handleOrderStatusUpdate(material.id, true, orderNumber)
                              }
                            } else {
                              handleOrderStatusUpdate(material.id, isOrdered)
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Material Ordered</span>
                      </label>
                    </div>
                    {material.is_ordered && material.order_number && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <ShoppingCart className="h-4 w-4" />
                        <span>Order #: {material.order_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Material Modal */}
      {editingMaterial && (
        <MaterialForm
          material={editingMaterial}
          onSave={(updates) => handleEditMaterial(editingMaterial.id, updates)}
          onCancel={() => setEditingMaterial(null)}
        />
      )}
    </div>
  )
}

// Material Form Component
function MaterialForm({ 
  material, 
  onSave, 
  onCancel 
}: { 
  material?: Material
  onSave: (data: {
    material_name: string
    thickness: number
    board_size: string
    quantity: number
    supplier: string
    is_ordered: boolean
    order_number: string
  }) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    material_name: material?.material_name || '',
    thickness: material?.thickness || 0,
    board_size: material?.board_size || '',
    quantity: material?.quantity || 0,
    supplier: material?.supplier || '',
    is_ordered: material?.is_ordered || false,
    order_number: material?.order_number || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.material_name.trim()) {
      onSave(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'thickness' || name === 'quantity' 
          ? Number(value) 
          : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {material ? 'Edit Material' : 'Add Material'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Material Name *
            </label>
            <input
              type="text"
              name="material_name"
              value={formData.material_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Oak Veneer, MDF Board, Hardwood"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thickness (mm)
              </label>
              <input
                type="number"
                name="thickness"
                value={formData.thickness}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board Size
            </label>
            <input
              type="text"
              name="board_size"
              value={formData.board_size}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2400x1200mm, 8x4ft"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., ABC Timber, XYZ Supplies"
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Order Status</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_ordered"
                  checked={formData.is_ordered}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Material has been ordered</span>
              </label>
              
              {formData.is_ordered && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Number
                  </label>
                  <input
                    type="text"
                    name="order_number"
                    value={formData.order_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., ORD-2024-001, PO-12345"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {material ? 'Update Material' : 'Add Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
