import React, { useEffect, useState, useContext } from 'react'
import { getFlowers, createFlower, updateFlower, deleteFlower } from '../api/flowers'
import { AuthContext } from '../context/AuthContext'

const EMPTY_FORM = {
  name: '', unit_price: '', season_start: '', availability: 'in_stock',
  offer_start: '', offer_end: '',
}

const MONTH_NAMES = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const AVAIL_LABELS = { in_stock: 'In Stock', limited: 'Limited', unavailable: 'Unavailable' }

function FlowerForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const [error, setError] = useState('')

  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.unit_price) { setError('Name and price are required.'); return }
    const price = parseFloat(form.unit_price)
    if (isNaN(price) || price <= 0) { setError('Price must be a positive number.'); return }
    try {
      await onSave({
        name: form.name.trim(),
        unit_price: price,
        season_start: form.season_start ? Number(form.season_start) : null,
        availability: form.availability,
        offer_start: form.offer_start || null,
        offer_end: form.offer_end || null,
      })
    } catch {
      setError('Failed to save flower.')
    }
  }

  return (
    <div className="card panel-card mb-4">
      <div className="card-body">
        <h5 className="mb-3">{initial ? 'Edit Flower' : 'Add New Flower'}</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Flower name</label>
              <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Price per unit (€)</label>
              <input className="form-control" type="number" min="0.01" step="0.01" value={form.unit_price} onChange={e => set('unit_price', e.target.value)} required />
            </div>
            <div className="col-md-3">
              <label className="form-label">Availability</label>
              <select className="form-select" value={form.availability} onChange={e => set('availability', e.target.value)}>
                <option value="in_stock">In Stock</option>
                <option value="limited">Limited</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Season start</label>
              <select className="form-select" value={form.season_start} onChange={e => set('season_start', e.target.value)}>
                <option value="">Any</option>
                {MONTH_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Offer start</label>
              <input className="form-control" type="date" value={form.offer_start} onChange={e => set('offer_start', e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Offer end</label>
              <input className="form-control" type="date" value={form.offer_end} onChange={e => set('offer_end', e.target.value)} />
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" type="submit">{initial ? 'Save changes' : 'Add flower'}</button>
            <button className="btn btn-ghost" type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Flowers() {
  const { user } = useContext(AuthContext)
  const [flowers, setFlowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)

  const canManage = user && (user.role === 'supplier' || user.role === 'admin')

  async function load() {
    setLoading(true)
    try {
      const res = await getFlowers()
      if (res && res.flowers) setFlowers(res.flowers)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleAdd(data) {
    await createFlower(data)
    setShowAdd(false)
    load()
  }

  async function handleEdit(data) {
    await updateFlower(editing.flower_id, data)
    setEditing(null)
    load()
  }

  async function handleDelete(flower) {
    if (!confirm(`Delete "${flower.name}"?`)) return
    await deleteFlower(flower.flower_id)
    load()
  }

  function canEditFlower(f) {
    if (!user) return false
    if (user.role === 'admin') return true
    return user.role === 'supplier' && user.supplier_id === f.supplier_id
  }

  function toEditForm(f) {
    return {
      name: f.name,
      unit_price: f.unit_price,
      season_start: f.season_start || '',
      availability: f.availability,
      offer_start: f.offer_start ? f.offer_start.slice(0, 10) : '',
      offer_end: f.offer_end ? f.offer_end.slice(0, 10) : '',
    }
  }

  return (
    <div>
      <div className="d-flex align-items-start justify-content-between mb-3">
        <div>
          <h2 className="page-title">Flowers</h2>
          <p className="page-intro">Browse available flowers and pricing from all suppliers.</p>
        </div>
        {canManage && !showAdd && !editing && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add flower</button>
        )}
      </div>

      {showAdd && (
        <FlowerForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
      )}
      {editing && (
        <FlowerForm initial={toEditForm(editing)} onSave={handleEdit} onCancel={() => setEditing(null)} />
      )}

      <div className="card panel-card">
        <div className="card-body">
          {loading && <p className="text-muted">Loading flowers...</p>}
          {!loading && (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Supplier</th>
                    <th>Price / unit</th>
                    <th>Season start</th>
                    <th>Availability</th>
                    <th>Offer period</th>
                    {canManage && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {flowers.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-muted">No flowers found.</td></tr>
                  )}
                  {flowers.map(f => (
                    <tr key={f.flower_id}>
                      <td><strong>{f.name}</strong></td>
                      <td>{f.supplier_name || '—'}</td>
                      <td>€{Number(f.unit_price).toFixed(2)}</td>
                      <td>{f.season_start ? MONTH_NAMES[f.season_start] : '—'}</td>
                      <td>
                        <span className={`badge ${f.availability === 'in_stock' ? 'bg-success' : f.availability === 'limited' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {AVAIL_LABELS[f.availability] || f.availability}
                        </span>
                      </td>
                      <td>
                        {f.offer_start && f.offer_end
                          ? `${f.offer_start.slice(0,10)} – ${f.offer_end.slice(0,10)}`
                          : '—'}
                      </td>
                      {canManage && (
                        <td>
                          {canEditFlower(f) && (
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-secondary" onClick={() => { setShowAdd(false); setEditing(f) }}>Edit</button>
                              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f)}>Delete</button>
                            </div>
                          )}
                        </td>
                      )}
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
