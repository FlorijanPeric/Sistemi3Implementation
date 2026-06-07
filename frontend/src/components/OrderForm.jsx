<<<<<<< HEAD
import React, { useEffect, useState } from 'react'
import { getFlowers } from '../api/flowers'

export default function OrderForm({ onCreate }){
  const [flowers, setFlowers] = useState([])
  const [flowerId, setFlowerId] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(()=>{
    async function load(){
      const res = await getFlowers()
      if(res && res.flowers) setFlowers(res.flowers)
    }
    load()
  },[])

  function submit(e){
    e.preventDefault()
    if(!flowerId) return
    onCreate({ items: [{ flower_id: flowerId, quantity }] })
  }

  return (
    <form onSubmit={submit} className="mb-3">
      <div className="mb-2">
        <label className="form-label">Flower</label>
        <select className="form-select" value={flowerId} onChange={e=>setFlowerId(e.target.value)}>
          <option value="">Select</option>
          {flowers.map(f=> <option key={f.flower_id} value={f.flower_id}>{f.name} — {f.unit_price}€</option>)}
        </select>
      </div>
      <div className="mb-2">
        <label className="form-label">Quantity</label>
        <input className="form-control" type="number" min={1} value={quantity} onChange={e=>setQuantity(+e.target.value)} />
      </div>
      <button className="btn btn-primary" type="submit">Create Order</button>
    </form>
  )
}
=======
import React, { useEffect, useState } from 'react'
import { getFlowers } from '../api/flowers'

const EMPTY_ITEM = { flower_id: '', quantity: 1 }

export default function OrderForm({ onCreate }) {
  const [flowers, setFlowers] = useState([])
  const [items, setItems] = useState([{ ...EMPTY_ITEM }])
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const res = await getFlowers()
      if (res && res.flowers) setFlowers(res.flowers)
    }
    load()
  }, [])

  function setItem(index, field, val) {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, [field]: val } : it))
  }

  function addItem() {
    setItems(prev => [...prev, { ...EMPTY_ITEM }])
  }

  function removeItem(index) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function flowerById(id) {
    return flowers.find(f => f.flower_id === id)
  }

  function total() {
    return items.reduce((sum, it) => {
      const f = flowerById(it.flower_id)
      return sum + (f ? Number(f.unit_price) * Number(it.quantity || 0) : 0)
    }, 0)
  }

  function submit(e) {
    e.preventDefault()
    setError('')

    const valid = items.filter(it => it.flower_id && Number(it.quantity) >= 1)
    if (valid.length === 0) { setError('Add at least one flower with a quantity.'); return }

    const duplicates = valid.map(it => it.flower_id)
    if (new Set(duplicates).size !== duplicates.length) { setError('Each flower can only appear once.'); return }

    onCreate({ items: valid.map(it => ({ flower_id: it.flower_id, quantity: Number(it.quantity) })) })
    setItems([{ ...EMPTY_ITEM }])
  }

  return (
    <div className="card panel-card">
      <div className="card-body">
        <h5 className="mb-3">New order</h5>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit}>
          {items.map((item, i) => {
            const f = flowerById(item.flower_id)
            return (
              <div key={i} className="row g-2 align-items-end mb-2">
                <div className="col-md-6">
                  {i === 0 && <label className="form-label">Flower</label>}
                  <select
                    className="form-select"
                    value={item.flower_id}
                    onChange={e => setItem(i, 'flower_id', e.target.value)}
                    required
                  >
                    <option value="">Select flower…</option>
                    {flowers.map(fl => (
                      <option key={fl.flower_id} value={fl.flower_id}>
                        {fl.name} — €{Number(fl.unit_price).toFixed(2)} ({fl.supplier_name || 'Unknown supplier'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  {i === 0 && <label className="form-label">Quantity</label>}
                  <input
                    className="form-control"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={e => setItem(i, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-2">
                  {i === 0 && <label className="form-label">Subtotal</label>}
                  <div className="form-control-plaintext">
                    {f ? `€${(Number(f.unit_price) * Number(item.quantity || 0)).toFixed(2)}` : '—'}
                  </div>
                </div>
                <div className="col-md-1">
                  {items.length > 1 && (
                    <button type="button" className="btn btn-sm btn-ghost text-danger" onClick={() => removeItem(i)} title="Remove row">✕</button>
                  )}
                </div>
              </div>
            )
          })}

          <div className="d-flex align-items-center gap-3 mt-2 mb-3">
            <button type="button" className="btn btn-sm btn-ghost" onClick={addItem}>+ Add flower</button>
            <span className="ms-auto fw-semibold">Total: €{total().toFixed(2)}</span>
          </div>

          <button className="btn btn-primary" type="submit">Place order</button>
        </form>
      </div>
    </div>
  )
}
>>>>>>> Frontend
