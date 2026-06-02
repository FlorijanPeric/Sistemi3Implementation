import React, { useContext, useEffect, useState } from 'react'
import { getRecommendations } from '../api/recommendations'
import { AuthContext } from '../context/AuthContext'

export default function Recommendations(){
  const { user } = useContext(AuthContext)
  const [recs, setRecs] = useState([])
  const [season, setSeason] = useState('spring')
  const floristId = user?.florist_id || null

  useEffect(()=>{ load() }, [season])
  async function load(){
    if(!floristId){
      setRecs([])
      return
    }
    try{
      const res = await getRecommendations(floristId, season)
      if(res && res.recommendations) setRecs(res.recommendations)
    }catch(error){
      setRecs([])
    }
  }

  return (
    <div>
      <h2>Recommendations</h2>
      {user?.role !== 'florist' ? (
        <div className="alert alert-info">Recommendations are available for florist accounts.</div>
      ) : null}
      <div className="mb-3">
        <label className="form-label">Season</label>
        <select className="form-select" value={season} onChange={e=>setSeason(e.target.value)}>
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="autumn">Autumn</option>
          <option value="winter">Winter</option>
        </select>
      </div>
      <div className="table-responsive">
      <table className="table">
        <thead><tr><th>Flower</th><th>Suggested Qty</th></tr></thead>
        <tbody>
          {recs.map(r=> <tr key={r.rec_id}><td>{r.name || r.flower_id}</td><td>{r.suggested_qty}</td></tr>)}
        </tbody>
      </table>
      </div>
    </div>
  )
}
