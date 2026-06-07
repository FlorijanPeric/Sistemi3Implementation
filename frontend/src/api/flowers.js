<<<<<<< HEAD
import client from './client'

export async function getFlowers(){
  const res = await client.get('/flowers')
  return res.data
}

export async function createFlower(data){
  const res = await client.post('/flowers', data)
  return res.data
}

export async function updateFlower(id, data){
  const res = await client.put(`/flowers/${id}`, data)
  return res.data
}

export async function deleteFlower(id){
  const res = await client.delete(`/flowers/${id}`)
  return res.data
}
=======
import client from './client'

export async function getFlowers(){
  const res = await client.get('/flowers')
  return res.data
}

export async function createFlower(data){
  const res = await client.post('/flowers', data)
  return res.data
}

export async function updateFlower(id, data){
  const res = await client.put(`/flowers/${id}`, data)
  return res.data
}

export async function deleteFlower(id){
  const res = await client.delete(`/flowers/${id}`)
  return res.data
}
>>>>>>> Frontend
