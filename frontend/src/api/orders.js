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
