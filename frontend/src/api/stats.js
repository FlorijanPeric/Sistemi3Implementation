import client from './client'

export async function getTopFlowers() {
  const res = await client.get('/stats/top-flowers')
  return res.data
}

export async function getMonthlyOrders() {
  const res = await client.get('/stats/monthly-orders')
  return res.data
}
