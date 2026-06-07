<<<<<<< HEAD
import client from './client'

export async function createOrder(order){
  const res = await client.post('/orders', order)
  return res.data
}

export async function getOrders(){
  const res = await client.get('/orders')
  return res.data
}

export async function cancelOrder(id){
  const res = await client.put(`/orders/${id}`, { status: 'cancelled' })
  return res.data
}
=======
import client from './client'

export async function createOrder(order) {
  const res = await client.post('/orders', order)
  return res.data
}

export async function getOrders() {
  const res = await client.get('/orders')
  return res.data
}

export async function cancelOrder(id) {
  const res = await client.put(`/orders/${id}`, { status: 'preklicano' })
  return res.data
}

export async function acceptOrder(id, deliveryDate) {
  const res = await client.post(`/orders/${id}/accept`, { delivery_date: deliveryDate || null })
  return res.data
}

export async function rejectOrder(id) {
  const res = await client.post(`/orders/${id}/reject`, {})
  return res.data
}
>>>>>>> Frontend
