'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, X, Package, Calendar, DollarSign } from 'lucide-react'
import { JoineryItem } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

interface JoineryItemsListProps {
  projectId: string
  items: JoineryItem[]
  onItemsChange: () => void
}

const CHECKLIST_STEPS = [
  { key: 'shop_drawings_approved', label: 'Shop Drawings Approved' },
  { key: 'board_ordered', label: 'Board Ordered' },
  { key: 'hardware_ordered', label: 'Hardware Ordered' },
  { key: 'site_measured', label: 'Site Measured' },
  { key: 'microvellum_ready_to_process', label: 'Microvellum Ready to Process' },
  { key: 'processed_to_factory', label: 'Processed to Factory' },
  { key: 'picked_up_from_factory', label: 'Picked up from Factory' },
  { key: 'install_scheduled', label: 'Install Scheduled' },
  { key: 'plans_printed', label: 'Plans Printed' },
  { key: 'assembled', label: 'Assembled' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'installed', label: 'Installed' },
  { key: 'invoiced', label: 'Invoiced' }
]

export function JoineryItemsList({ projectId, items, onItemsChange }: JoineryItemsListProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<JoineryItem | null>(null)

  const handleAddItem = async (itemData: {
    item_name: string
    item_budget: number
    install_commencement_date: string
    install_duration: number
  }) => {
    try {
      const { error } = await supabase
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
      
      if (error) throw error
      
      setShowAddForm(false)
      onItemsChange()
    } catch (error) {
      console.error('Error adding joinery item:', error)
      alert('Error adding joinery item. Please try again.')
    }
  }

  const handleUpdateChecklist = async (itemId: string, stepKey: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('joinery_items')
        .update({ [stepKey]: completed })
        .eq('id', itemId)
      
      if (error) throw error
      onItemsChange()
    } catch (error) {
      console.error('Error updating checklist:', error)
      alert('Error updating checklist. Please try again.')
    }
  }

  const handleEditItem = async (itemId: string, updates: Partial<JoineryItem>) => {
    try {
      const { error } = await supabase
        .from('joinery_items')
        .update(updates)
        .eq('id', itemId)
      
      if (error) throw error
      
      setEditingItem(null)
      onItemsChange()
    } catch (error) {
      console.error('Error updating joinery item:', error)
      alert('Error updating joinery item. Please try again.')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this joinery item?')) return

    try {
      const { error } = await supabase
        .from('joinery_items')
        .delete()
        .eq('id', itemId)
      
      if (error) throw error
      onItemsChange()
    } catch (error) {
      console.error('Error deleting joinery item:', error)
      alert('Error deleting joinery item. Please try again.')
    }
  }

  const getCompletionPercentage = (item: JoineryItem) => {
    const completedSteps = CHECKLIST_STEPS.filter(step => item[step.key as keyof JoineryItem] as boolean).length
    return Math.round((completedSteps / CHECKLIST_STEPS.length) * 100)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Joinery Items</h3>
          <p className="text-sm text-gray-600">
            Track manufacturing progress for each joinery item
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <JoineryItemForm
          onSave={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Items List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No joinery items yet. Add your first item to get started.</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg shadow-sm">
              {/* Item Header */}
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(item.item_budget)}</span>
                        </span>
                        {item.install_commencement_date && (
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Install: {formatDate(item.install_commencement_date)}</span>
                          </span>
                        )}
                        <span>{item.install_duration} days</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {getCompletionPercentage(item)}% Complete
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getCompletionPercentage(item)}%` }}
                        ></div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit item"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="p-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Manufacturing Checklist</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {CHECKLIST_STEPS.map((step) => (
                    <label
                      key={step.key}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item[step.key as keyof JoineryItem] as boolean}
                        onChange={(e) => handleUpdateChecklist(item.id, step.key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className={`text-sm ${
                        item[step.key as keyof JoineryItem] as boolean
                          ? 'text-green-700 line-through'
                          : 'text-gray-700'
                      }`}>
                        {step.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <JoineryItemForm
          item={editingItem}
          onSave={(updates) => handleEditItem(editingItem.id, updates)}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  )
}

// Joinery Item Form Component
function JoineryItemForm({ 
  item, 
  onSave, 
  onCancel 
}: { 
  item?: JoineryItem
  onSave: (data: {
    item_name: string
    item_budget: number
    install_commencement_date: string
    install_duration: number
  }) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    item_name: item?.item_name || '',
    item_budget: item?.item_budget || 0,
    install_commencement_date: item?.install_commencement_date || '',
    install_duration: item?.install_duration || 1
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.item_name.trim()) {
      onSave(formData)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'item_budget' || name === 'install_duration' 
        ? Number(value) 
        : value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {item ? 'Edit Joinery Item' : 'Add Joinery Item'}
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
              Item Name *
            </label>
            <input
              type="text"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Kitchen Cabinets, Island Unit"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Budget ($)
            </label>
            <input
              type="number"
              name="item_budget"
              value={formData.item_budget}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Install Date
            </label>
            <input
              type="date"
              name="install_commencement_date"
              value={formData.install_commencement_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Install Duration (days)
            </label>
            <input
              type="number"
              name="install_duration"
              value={formData.install_duration}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

