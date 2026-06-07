import React, { useState } from 'react'

export default function SupplierForm({ supplier, isAdmin, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: supplier.name || '',
    rating: supplier.rating ?? 4.0,
  })

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return alert('Name required')
    const data = { name: form.name.trim() }
    if (isAdmin) data.rating = parseFloat(form.rating)
    onSave(data)
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Edit Supplier</h5>
        <form onSubmit={submit}>
          <div className="mb-2">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {isAdmin && (
            <div className="mb-2">
              <label className="form-label">Rating ({Number(form.rating).toFixed(1)})</label>
              <input
                className="form-range"
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) })}
              />
            </div>
          )}
          <button className="btn btn-primary me-2" type="submit">Save</button>
          <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancel</button>
        </form>
      </div>
    </div>
  )
}
