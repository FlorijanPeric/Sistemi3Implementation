import React, { useEffect, useState } from 'react'
import { getFlowers } from '../api/flowers'

export default function Flowers(){
  const [flowers, setFlowers] = useState([])

  useEffect(()=>{
    async function load(){
      const res = await getFlowers()
      if(res && res.flowers) setFlowers(res.flowers)
    }
    load()
  },[])

  return (
    <div>
      <div className="section-heading mb-3">
        <div>
          <h2 className="page-title">Flowers</h2>
          <p className="page-intro">Browse available flowers and pricing.</p>
        </div>
      </div>
      <div className="card panel-card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead><tr><th>Name</th><th>Price</th><th>Availability</th></tr></thead>
              <tbody>
                {flowers.map(f=> (
                  <tr key={f.flower_id}><td>{f.name}</td><td>{f.unit_price}</td><td>{f.availability}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
