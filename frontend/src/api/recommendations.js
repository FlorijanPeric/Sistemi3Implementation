<<<<<<< HEAD
import client from './client'

export async function getRecommendations(floristId, season){
  const res = await client.get(`/recommendations/${floristId}?season=${season}`)
  return res.data
}
=======
import client from './client'

export async function getRecommendations(floristId, season){
  const res = await client.get(`/recommendations/${floristId}?season=${season}`)
  return res.data
}
>>>>>>> Frontend
