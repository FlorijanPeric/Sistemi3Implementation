import React, { useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getAdminUsers, updateAdminUser, deleteAdminUser, getAdminOrders } from '../api/admin'

const STATUS_BADGE = {
  'v obdelavi': 'bg-warning text-dark',
  'potrjeno': 'bg-success',
  'dostavljeno': 'bg-primary',
  'preklicano': 'bg-secondary',
  'zavrnjeno': 'bg-danger',
}

const STATUS_LABELS = {
  'v obdelavi': 'Processing',
  'potrjeno': 'Confirmed',
  'dostavljeno': 'Delivered',
  'preklicano': 'Cancelled',
  'zavrnjeno': 'Rejected',
}

const ROLE_BADGE = {
  admin: 'bg-danger',
  florist: 'bg-success',
  supplier: 'bg-primary',
}

function formatDate(val) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString()
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ role: '', valid_until: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getAdminUsers()
      if (res.ok) setUsers(res.users)
    } catch (e) {
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function startEdit(user) {
    setEditingId(user.user_id)
    setEditForm({
      role: user.role,
      valid_until: user.valid_until ? user.valid_until.slice(0, 10) : '',
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ role: '', valid_until: '' })
  }

  async function saveEdit(userId) {
    setSaving(true)
    try {
      const payload = { role: editForm.role }
      if (editForm.valid_until) payload.valid_until = editForm.valid_until
      else payload.valid_until = null
      const res = await updateAdminUser(userId, payload)
      if (res.ok) { cancelEdit(); load() }
      else setError('Failed to save changes.')
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(userId, username) {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
    try {
      const res = await deleteAdminUser(userId)
      if (res.ok) load()
      else setError('Failed to delete user.')
    } catch {
      setError('Failed to delete user.')
    }
  }

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p className="text-muted">Loading users...</p>}
      {!loading && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Assigned</th>
                <th>Valid until</th>
                <th>Florist / Supplier</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan="7" className="text-center text-muted">No users found.</td></tr>
              )}
              {users.map(u => (
                <React.Fragment key={u.user_id}>
                  <tr>
                    <td><strong>{u.username}</strong></td>
                    <td className="text-muted small">{u.email}</td>
                    <td>
                      <span className={`badge ${ROLE_BADGE[u.role] || 'bg-secondary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{formatDate(u.assigned_date)}</td>
                    <td>{formatDate(u.valid_until)}</td>
                    <td className="small">
                      {u.florist_name && <span>🌸 {u.florist_name}</span>}
                      {u.supplier_name && <span>📦 {u.supplier_name}</span>}
                      {!u.florist_name && !u.supplier_name && <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => startEdit(u)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(u.user_id, u.username)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === u.user_id && (
                    <tr className="table-light">
                      <td colSpan="7">
                        <div className="d-flex align-items-end gap-3 flex-wrap py-1 ps-2">
                          <div>
                            <label className="form-label small mb-1">Role</label>
                            <select
                              className="form-select form-select-sm"
                              value={editForm.role}
                              onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                            >
                              <option value="florist">florist</option>
                              <option value="supplier">supplier</option>
                              <option value="admin">admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label small mb-1">Valid until (optional)</label>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              style={{ minWidth: 160 }}
                              value={editForm.valid_until}
                              onChange={e => setEditForm(f => ({ ...f, valid_until: e.target.value }))}
                            />
                          </div>
                          <div className="d-flex gap-2 mt-auto">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => saveEdit(u.user_id)}
                              disabled={saving}
                            >
                              {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await getAdminOrders()
        if (res.ok) setOrders(res.orders)
      } catch {
        setError('Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p className="text-muted">Loading orders...</p>}
      {!loading && (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Florist</th>
                <th>Ordered</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Total (€)</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan="6" className="text-center text-muted">No orders found.</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.order_id}>
                  <td className="text-monospace small">{o.order_id.slice(0, 8)}…</td>
                  <td>{o.florist_name || '—'}</td>
                  <td>{formatDate(o.ordered_at)}</td>
                  <td>{formatDate(o.delivery_date)}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[o.status] || 'bg-secondary'}`}>
                      {STATUS_LABELS[o.status] || o.status}
                    </span>
                  </td>
                  <td>€{Number(o.total_value).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const { user, loading } = useContext(AuthContext)
  const [tab, setTab] = useState('users')

  if (loading) return <div className="py-5 text-center">Loading...</div>
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />

  return (
    <div>
      <div className="section-heading mb-4">
        <div>
          <h2 className="page-title">Admin panel</h2>
          <p className="page-intro">Manage users and view all orders across the platform.</p>
        </div>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'users' ? 'active' : ''}`}
            onClick={() => setTab('users')}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'orders' ? 'active' : ''}`}
            onClick={() => setTab('orders')}
          >
            Orders
          </button>
        </li>
      </ul>

      <div className="card panel-card">
        <div className="card-body">
          {tab === 'users' && <UsersTab />}
          {tab === 'orders' && <OrdersTab />}
        </div>
      </div>
    </div>
  )
}
