<<<<<<< HEAD
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
=======
import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import SupplierForm from '../components/SupplierForm'
import { getSuppliers, updateSupplier } from '../api/suppliers'

function RatingStars({ value }) {
  const v = Number(value) || 0
  const filled = Math.round(v)
  return (
    <span title={`${v.toFixed(1)} / 5`}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= filled ? '#c97d8a' : '#ddd', fontSize: 16 }}>★</span>
      ))}
      <span className="ms-1 small text-muted">{v.toFixed(1)}</span>
    </span>
  )
}

function RankBadge({ rank }) {
  if (rank === 1) return <span className="badge" style={{ background: '#c97d8a' }}>Best choice</span>
  if (rank === 2) return <span className="badge bg-warning text-dark">Runner-up</span>
  return null
}

// Compute a composite rank score: higher rating = better, lower price = better
function rankSuppliers(suppliers) {
  if (suppliers.length === 0) return []

  const maxRating = Math.max(...suppliers.map(s => Number(s.rating) || 0), 1)
  const prices = suppliers.map(s => Number(s.avg_price)).filter(p => p > 0)
  const minPrice = prices.length ? Math.min(...prices) : 1
  const maxPrice = prices.length ? Math.max(...prices) : 1

  return suppliers
    .map(s => {
      const ratingScore = (Number(s.rating) || 0) / maxRating        // 0-1, higher is better
      const priceScore = maxPrice === minPrice
        ? 1
        : 1 - (Number(s.avg_price || maxPrice) - minPrice) / (maxPrice - minPrice) // 0-1, lower price = higher score
      const score = ratingScore * 0.6 + priceScore * 0.4
      return { ...s, _score: score }
    })
    .sort((a, b) => b._score - a._score)
    .map((s, i) => ({ ...s, _rank: i + 1 }))
}

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

  const ranked = rankSuppliers(suppliers)

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h2 className="page-title">Supplier Comparison</h2>
          <p className="page-intro">
            Suppliers ranked by rating (60%) and average flower price (40%).
            Lower price and higher rating = better score.
          </p>
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
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Supplier</th>
                    <th>Rating</th>
                    <th>Avg. price / unit</th>
                    <th>Avg. delivery (days)</th>
                    <th>Flowers</th>
                    <th>Recommendation</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">No suppliers found.</td>
                    </tr>
                  )}
                  {ranked.map((s) => (
                    <tr key={s.supplier_id} style={s._rank === 1 ? { background: '#fdf6f8' } : {}}>
                      <td><strong>{s._rank}</strong></td>
                      <td>
                        <div><strong>{s.name}</strong></div>
                        <div className="small text-muted">{s.email}</div>
                      </td>
                      <td><RatingStars value={s.rating} /></td>
                      <td>{s.avg_price != null ? `€${Number(s.avg_price).toFixed(2)}` : '—'}</td>
                      <td>{s.avg_delivery_days != null ? `${Number(s.avg_delivery_days).toFixed(1)} days` : '—'}</td>
                      <td>{s.flower_count}</td>
                      <td><RankBadge rank={s._rank} /></td>
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

      {!loading && !error && ranked.length > 0 && (
        <div className="card panel-card mt-4">
          <div className="card-body">
            <h5 className="mb-1">Best choice summary</h5>
            <p className="page-intro mb-3">Based on the composite score (rating + price):</p>
            <div className="row g-3">
              {ranked.slice(0, 3).map(s => (
                <div className="col-md-4" key={s.supplier_id}>
                  <div className="card h-100" style={{ borderLeft: s._rank === 1 ? '4px solid #c97d8a' : '4px solid #dee2e6' }}>
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <strong>{s.name}</strong>
                        <RankBadge rank={s._rank} />
                      </div>
                      <RatingStars value={s.rating} />
                      <div className="mt-2 small">
                        <div>Avg. price: {s.avg_price != null ? `€${Number(s.avg_price).toFixed(2)}` : '—'}</div>
                        <div>Flowers: {s.flower_count}</div>
                        {s.avg_delivery_days != null && (
                          <div>Avg. delivery: {Number(s.avg_delivery_days).toFixed(1)} days</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
>>>>>>> Frontend
