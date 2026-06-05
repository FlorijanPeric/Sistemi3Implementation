import client from './client'

export async function getSuppliers() {
  const res = await client.get('/suppliers')
  return res.data
}

export async function getSupplier(id) {
  const res = await client.get(`/suppliers/${id}`)
  return res.data
}

export async function updateSupplier(id, data) {
  const res = await client.patch(`/suppliers/${id}`, data)
  return res.data
}
