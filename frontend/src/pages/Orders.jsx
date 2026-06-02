import React, { useContext, useEffect, useState } from 'react'
import { getOrders, createOrder, cancelOrder } from '../api/orders'
import OrderForm from '../components/OrderForm'
import { AuthContext } from '../context/AuthContext'

export default function Orders(){
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])

  async function load(){
    try{
      const res = await getOrders()
      if(res && res.orders) setOrders(res.orders)
    }catch(error){
      setOrders([])
    }
  }

  useEffect(()=>{ load() }, [])

  async function handleCreate(order){
    const res = await createOrder(order)
    if(res && res.ok){ load() }
    else alert('Create failed')
  }

  async function handleCancel(id){
    if(!confirm('Cancel order?')) return
    const res = await cancelOrder(id)
    if(res && res.ok) load()
  }

  return (
    <div>
      <div className="section-heading mb-3">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-intro">Manage and review your orders.</p>
        </div>
      </div>

      {user?.role === 'florist' || !user ? <div className="mb-4"><OrderForm onCreate={handleCreate} /></div> : null}
      {user?.role === 'supplier' ? (
        <div className="alert alert-info">You are viewing supplier orders. Creating new orders is available for florist accounts only.</div>
      ) : null}

      <div className="card panel-card">
        <div className="card-body">
          <h5 className="mb-3">Your orders</h5>
          <div className="table-responsive">
            <table className="table">
              <thead><tr><th>ID</th><th>Date</th><th>Status</th><th>Total</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.map(o=> (
                  <tr key={o.order_id}>
                    <td className="text-monospace small">{o.order_id}</td>
                    <td>{o.ordered_at}</td>
                    <td>{o.status}</td>
                    <td>{o.total_value}</td>
                    <td>
                      {o.status !== 'cancelled' && <button className="btn btn-sm btn-danger" onClick={()=>handleCancel(o.order_id)}>Cancel</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
