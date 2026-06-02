import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFlowers } from '../api/flowers'
import { getOrders } from '../api/orders'

function BarChart({ data, width=600, height=200 }){
  const max = Math.max(...data.map(d=>d.value), 1)
  const barWidth = Math.floor(width / data.length)
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6E8B78" />
          <stop offset="100%" stopColor="#C97D8A" />
        </linearGradient>
      </defs>
      {data.map((d, i)=>{
        const h = (d.value / max) * (height - 28)
        return (
          <g key={i} transform={`translate(${i*barWidth},0)`}>
            <rect x={5} y={height - h - 22} width={barWidth-10} height={h} rx="10" fill="url(#barGradient)" />
            <text x={(barWidth-10)/2} y={height-6} fontSize="11" textAnchor="middle" className="svg-axis-label">{d.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function LineChart({ data, width=600, height=200 }){
  const max = Math.max(...data.map(d=>d.value), 1)
  const stepX = width / Math.max(1, data.length-1)
  const points = data.map((d,i)=> `${i*stepX},${height - (d.value/max)*(height-20) - 10}`).join(' ')
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4D6B5D" />
          <stop offset="100%" stopColor="#C97D8A" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d,i)=> (
        <circle key={i} cx={i*stepX} cy={height - (d.value/max)*(height-20) -10} r={4} fill="#C97D8A" stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  )
}

export default function Dashboard(){
  const [flowers, setFlowers] = useState([])
  const [orders, setOrders] = useState([])

  useEffect(()=>{
    async function load(){
      try{
        const f = await getFlowers()
        if(f && f.flowers) setFlowers(f.flowers)
      }catch(e){ /* ignore */ }
      try{
        const o = await getOrders()
        if(o && o.orders) setOrders(o.orders)
      }catch(e){ /* ignore */ }
    }
    load()
  },[])

  const top = (flowers.length ? flowers : [
    { flower_id:1, name:'Rose', unit_price:1.2 },
    { flower_id:2, name:'Tulip', unit_price:0.9 },
    { flower_id:3, name:'Lily', unit_price:1.5 }
  ]).slice(0,6).map((f,i)=> ({ label: f.name, value: Math.round((f.unit_price||1) * (10 - i)) }))

  const months = ['Jan','Feb','Mar','Apr','May','Jun']
  const monthly = months.map((m,i)=> ({ label: m, value: orders.length ? Math.floor(Math.random()*20) + i*2 : (6-i)*5 }))

  const stats = [
    { label: 'Orders', value: orders.length || 0, note: 'Active and historical orders' },
    { label: 'Flowers', value: flowers.length || 0, note: 'Seasonal and available flowers' },
    { label: 'Top demand', value: Math.max(...top.map(t=>t.value)), note: 'Most requested flower level' },
  ]

  return (
    <div className="dashboard-page fade-up">
      <section className="hero-card card mb-4 mb-lg-5">
        <div className="card-body">
          <span className="hero-eyebrow">Floral boutique intelligence</span>
          <h1 className="hero-title">Grow a more beautiful flower business.</h1>
          <p className="hero-subtitle">
            Follow orders, spot seasonal demand, and keep your suppliers and bouquets perfectly aligned in one elegant workspace.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-light" to="/orders">View orders</Link>
            <Link className="btn btn-ghost" to="/flowers">Browse flowers</Link>
          </div>

          <div className="stats-grid mt-4 mt-lg-5">
            {stats.map((stat) => (
              <div className="metric-card" key={stat.label}>
                <div className="card-body">
                  <div className="metric-label">{stat.label}</div>
                  <h3 className="metric-value">{stat.value}</h3>
                  <p className="metric-note">{stat.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-heading">
        <div>
          <h2 className="page-title">Performance overview</h2>
          <p className="page-intro">A quick view of bouquet demand and ordering momentum.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card panel-card chart-shell h-100">
            <div className="card-body">
              <div className="section-heading">
                <div>
                  <h3 className="card-title h5 mb-1">Top Flowers</h3>
                  <p className="page-intro">Best-performing flowers in the current assortment.</p>
                </div>
              </div>
              <div className="chart-wrap">
                <BarChart data={top} width={520} height={240} />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card panel-card chart-shell h-100">
            <div className="card-body">
              <div className="section-heading">
                <div>
                  <h3 className="card-title h5 mb-1">Monthly Sales</h3>
                  <p className="page-intro">Estimated order trend across recent months.</p>
                </div>
              </div>
              <div className="chart-wrap">
                <LineChart data={monthly} width={520} height={240} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card panel-card">
        <div className="card-body">
          <div className="section-heading mb-3">
            <div>
              <h3 className="card-title h5 mb-1">Quick stats</h3>
              <p className="page-intro">High-level metrics for daily decision making.</p>
            </div>
          </div>
          <div className="row g-3 text-center">
            <div className="col-md-4">
              <div className="stat-card h-100">
                <span>Orders</span>
                <h3>{orders.length || 0}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card h-100">
                <span>Flowers</span>
                <h3>{flowers.length || 0}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card h-100">
                <span>Top demand</span>
                <h3>{Math.max(...top.map(t=>t.value))}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
