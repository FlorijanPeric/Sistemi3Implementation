import client from './client'

export async function register(data){
  const res = await client.post('/auth/register', data)
  return res.data
}

export async function login(data){
  const res = await client.post('/auth/login', data)
  return res.data
}

export function setAuthHeader(token){
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function clearAuthHeader(){
  delete client.defaults.headers.common['Authorization']
}
