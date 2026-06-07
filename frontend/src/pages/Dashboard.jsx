<<<<<<< HEAD
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
=======
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTopFlowers, getMonthlyOrders } from '../api/stats'
import { getOrders } from '../api/orders'
import { getFlowers } from '../api/flowers'

function BarChart({ data, width = 600, height = 200 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const barWidth = Math.floor(width / Math.max(data.length, 1))
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6E8B78" />
          <stop offset="100%" stopColor="#C97D8A" />
        </linearGradient>
      </defs>
      {data.map((d, i) => {
        const h = Math.max(4, (d.value / max) * (height - 28))
        return (
          <g key={i} transform={`translate(${i * barWidth},0)`}>
            <rect x={5} y={height - h - 22} width={barWidth - 10} height={h} rx="10" fill="url(#barGradient)" />
            <title>{d.label}: {d.value}</title>
            <text x={(barWidth - 10) / 2} y={height - 6} fontSize="11" textAnchor="middle" className="svg-axis-label">
              {d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function LineChart({ data, width = 600, height = 200 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  const stepX = data.length > 1 ? width / (data.length - 1) : width
  const points = data.map((d, i) => `${i * stepX},${height - (d.value / max) * (height - 20) - 10}`).join(' ')
  return (
    <svg width={width} height={height}>
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4D6B5D" />
          <stop offset="100%" stopColor="#C97D8A" />
        </linearGradient>
      </defs>
      {data.length > 1 && (
        <polyline points={points} fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      )}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={i * stepX} cy={height - (d.value / max) * (height - 20) - 10} r={4} fill="#C97D8A" stroke="#fff" strokeWidth="2" />
          <title>{d.label}: {d.value} orders</title>
          <text x={i * stepX} y={height - 2} fontSize="11" textAnchor="middle" className="svg-axis-label">{d.label}</text>
        </g>
      ))}
    </svg>
  )
}

export default function Dashboard() {
  const [topFlowers, setTopFlowers] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [orders, setOrders] = useState([])
  const [flowers, setFlowers] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const tf = await getTopFlowers()
        if (tf && tf.flowers) setTopFlowers(tf.flowers)
      } catch { /* public endpoint, ignore */ }

      try {
        const mo = await getMonthlyOrders()
        if (mo && mo.months) setMonthlyData(mo.months)
      } catch { /* public endpoint, ignore */ }

      try {
        const o = await getOrders()
        if (o && o.orders) setOrders(o.orders)
      } catch { /* requires auth, may fail */ }

      try {
        const f = await getFlowers()
        if (f && f.flowers) setFlowers(f.flowers)
      } catch { /* ignore */ }
    }
    load()
  }, [])

  // Bar chart: top flowers by actual order quantity
  const barData = topFlowers.length
    ? topFlowers.map(f => ({ label: f.name, value: f.total_qty || 1 }))
    : flowers.slice(0, 6).map((f, i) => ({ label: f.name, value: Math.max(1, 6 - i) }))

  // Line chart: monthly order counts from real data
  const lineData = monthlyData.length
    ? monthlyData.map(m => ({ label: m.label, value: m.order_count }))
    : ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({ label: m, value: 0 }))

  const stats = [
    { label: 'Orders', value: orders.length, note: 'Active and historical orders' },
    { label: 'Flowers', value: flowers.length, note: 'Seasonal and available flowers' },
    {
      label: 'Top demand',
      value: topFlowers.length ? topFlowers[0].name : '—',
      note: topFlowers.length ? `${topFlowers[0].total_qty} units ordered` : 'No orders yet',
    },
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
          <p className="page-intro">Flower demand and monthly ordering momentum based on real order history.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="card panel-card chart-shell h-100">
            <div className="card-body">
              <div className="section-heading">
                <div>
                  <h3 className="card-title h5 mb-1">Top Flowers by Orders</h3>
                  <p className="page-intro">Most ordered flowers — total quantity across all confirmed orders.</p>
                </div>
              </div>
              <div className="chart-wrap">
                {barData.every(d => d.value === 0 || d.value === 1) && topFlowers.length === 0
                  ? <p className="text-muted text-center py-4">No order data yet.</p>
                  : <BarChart data={barData} width={520} height={240} />
                }
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card panel-card chart-shell h-100">
            <div className="card-body">
              <div className="section-heading">
                <div>
                  <h3 className="card-title h5 mb-1">Monthly Orders (last 6 months)</h3>
                  <p className="page-intro">Number of confirmed orders per month.</p>
                </div>
              </div>
              <div className="chart-wrap">
                {lineData.every(d => d.value === 0)
                  ? <p className="text-muted text-center py-4">No monthly data yet.</p>
                  : <LineChart data={lineData} width={520} height={240} />
                }
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
                <h3>{orders.length}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card h-100">
                <span>Flowers</span>
                <h3>{flowers.length}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card h-100">
                <span>Most ordered</span>
                <h3>{topFlowers.length ? topFlowers[0].name : '—'}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
>>>>>>> Frontend
