import client from './client'

export async function getAdminUsers() {
  const res = await client.get('/admin/users')
  return res.data
}

export async function updateAdminUser(id, data) {
  const res = await client.put(`/admin/users/${id}`, data)
  return res.data
}

export async function deleteAdminUser(id) {
  const res = await client.delete(`/admin/users/${id}`)
  return res.data
}

export async function getAdminOrders() {
  const res = await client.get('/admin/orders')
  return res.data
}
