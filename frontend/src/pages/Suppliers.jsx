import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import SupplierForm from '../components/SupplierForm'
import { getSuppliers, updateSupplier } from '../api/suppliers'

export default function Suppliers() {
  const { user } = useContext(AuthContext)
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)

  useEffect(() => { loadSuppliers() }, [])

  async function loadSuppliers() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSuppliers()
      setSuppliers(data.suppliers || [])
    } catch {
      setError('Failed to load suppliers.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(formData) {
    try {
      await updateSupplier(editing.supplier_id, formData)
      setEditing(null)
      loadSuppliers()
    } catch {
      alert('Failed to update supplier.')
    }
  }

  function canEdit(s) {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.role === 'supplier' && user.supplier_id === s.supplier_id
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="page-title">Suppliers</h2>
          <p className="page-intro">View and manage supplier contacts and ratings.</p>
        </div>
      </div>

      {editing && (
        <div className="mb-3">
          <SupplierForm
            supplier={editing}
            isAdmin={user?.role === 'admin'}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="card panel-card">
        <div className="card-body">
          {loading && <p className="text-muted">Loading suppliers...</p>}
          {error && <p className="text-danger">{error}</p>}
          {!loading && !error && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Rating</th>
                    <th>Flowers</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">No suppliers found.</td>
                    </tr>
                  )}
                  {suppliers.map((s) => (
                    <tr key={s.supplier_id}>
                      <td>{s.name}</td>
                      <td>{s.email}</td>
                      <td>{s.rating !== null ? Number(s.rating).toFixed(1) : '—'}</td>
                      <td>{s.flower_count}</td>
                      <td>
                        {canEdit(s) && (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => setEditing(s)}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
