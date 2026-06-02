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
