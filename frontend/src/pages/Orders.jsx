import React, { useContext, useEffect, useState } from 'react'
import { getOrders, createOrder, cancelOrder, acceptOrder, rejectOrder } from '../api/orders'
import OrderForm from '../components/OrderForm'
import { AuthContext } from '../context/AuthContext'

const STATUS_LABELS = {
  'v obdelavi': 'Processing',
  'potrjeno': 'Confirmed',
  'dostavljeno': 'Delivered',
  'preklicano': 'Cancelled',
  'zavrnjeno': 'Rejected',
}

const STATUS_BADGE = {
  'v obdelavi': 'bg-warning text-dark',
  'potrjeno': 'bg-success',
  'dostavljeno': 'bg-primary',
  'preklicano': 'bg-secondary',
  'zavrnjeno': 'bg-danger',
}

export default function Orders() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState(null)
  const [deliveryDate, setDeliveryDate] = useState('')

  async function load() {
    setLoading(true)
    try {
      const res = await getOrders()
      if (res && res.orders) setOrders(res.orders)
    } catch { setOrders([]) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(order) {
    const res = await createOrder(order)
    if (res && res.ok) load()
    else alert('Failed to create order.')
  }

  async function handleCancel(id) {
    if (!confirm('Cancel this order?')) return
    const res = await cancelOrder(id)
    if (res && res.ok) load()
  }

  async function handleAccept(id) {
    if (acceptingId === id) {
      const res = await acceptOrder(id, deliveryDate)
      if (res && res.ok) { setAcceptingId(null); setDeliveryDate(''); load() }
      else alert('Failed to accept order.')
    } else {
      setAcceptingId(id)
      setDeliveryDate('')
    }
  }

  async function handleReject(id) {
    if (!confirm('Reject this order?')) return
    const res = await rejectOrder(id)
    if (res && res.ok) load()
    else alert('Failed to reject order.')
  }

  function formatDate(val) {
    if (!val) return '—'
    return new Date(val).toLocaleDateString()
  }

  const isSupplier = user?.role === 'supplier'
  const isFlorist = user?.role === 'florist'

  return (
    <div>
      <div className="section-heading mb-3">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-intro">Manage and review your orders.</p>
        </div>
      </div>

      {isFlorist && (
        <div className="mb-4">
          <OrderForm onCreate={handleCreate} />
        </div>
      )}
      {isSupplier && (
        <div className="alert alert-info mb-4">
          You are viewing orders for your flowers. Accept or reject pending orders below.
        </div>
      )}

      <div className="card panel-card">
        <div className="card-body">
          {loading && <p className="text-muted">Loading orders...</p>}
          {!loading && (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    {isSupplier && <th>Florist</th>}
                    <th>Date</th>
                    <th>Delivery date</th>
                    <th>Status</th>
                    <th>Total (€)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr><td colSpan="7" className="text-center text-muted">No orders found.</td></tr>
                  )}
                  {orders.map(o => (
                    <React.Fragment key={o.order_id}>
                      <tr>
                        <td className="text-monospace small">{o.order_id.slice(0, 8)}…</td>
                        {isSupplier && <td>{o.florist_name || '—'}</td>}
                        <td>{formatDate(o.ordered_at)}</td>
                        <td>{formatDate(o.delivery_date)}</td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[o.status] || 'bg-secondary'}`}>
                            {STATUS_LABELS[o.status] || o.status}
                          </span>
                        </td>
                        <td>€{Number(o.total_value).toFixed(2)}</td>
                        <td>
                          <div className="d-flex gap-2 flex-wrap">
                            {isFlorist && o.status === 'v obdelavi' && (
                              <button className="btn btn-sm btn-danger" onClick={() => handleCancel(o.order_id)}>
                                Cancel
                              </button>
                            )}
                            {isSupplier && o.status === 'v obdelavi' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleAccept(o.order_id)}
                                >
                                  {acceptingId === o.order_id ? 'Confirm accept' : 'Accept'}
                                </button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleReject(o.order_id)}>
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      {acceptingId === o.order_id && (
                        <tr>
                          <td colSpan="7">
                            <div className="d-flex align-items-center gap-3 ps-2 pb-2">
                              <label className="form-label mb-0 text-nowrap">Delivery date (optional):</label>
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                style={{ maxWidth: 180 }}
                                value={deliveryDate}
                                onChange={e => setDeliveryDate(e.target.value)}
                              />
                              <button className="btn btn-sm btn-ghost" onClick={() => setAcceptingId(null)}>
                                Cancel
                              </button>
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
      </div>
    </div>
  )
}
