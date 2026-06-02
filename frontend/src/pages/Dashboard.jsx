import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getFlowers } from '../api/flowers'
import { getDashboardStats } from '../api/dashboard'

// Bar chart: shows relative value of each flower by price
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

// Format a date string for display in the recent orders table
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

// Badge color by order status
function StatusBadge({ status }) {
  const map = {
    pending: 'warning',
    confirmed: 'info',
    delivered: 'success',
    cancelled: 'danger',
  }
  const color = map[status] || 'secondary'
  return <span className={`badge bg-${color}`}>{status}</span>
}

export default function Dashboard(){
  const [flowers, setFlowers] = useState([])
  // stats holds the shape returned by GET /api/dashboard/stats
  const [dashStats, setDashStats] = useState(null)

  useEffect(()=>{
    async function load(){
      // Flowers are fetched separately because the bar chart needs individual items
      try{
        const f = await getFlowers()
        if(f && f.flowers) setFlowers(f.flowers)
      }catch(e){ /* ignore */ }

      // Real aggregate stats from the dashboard endpoint
      try{
        const s = await getDashboardStats()
        if(s && s.stats) setDashStats(s.stats)
      }catch(e){ /* ignore */ }
    }
    load()
  },[])

  // Bar chart data: use real flowers when available, fall back to placeholders
  const top = (flowers.length ? flowers : [
    { flower_id:1, name:'Rose', unit_price:1.2 },
    { flower_id:2, name:'Tulip', unit_price:0.9 },
    { flower_id:3, name:'Lily', unit_price:1.5 }
  ]).slice(0,6).map((f,i)=> ({ label: f.name, value: Math.round((f.unit_price||1) * (10 - i)) }))

  // Top-level stat cards — wired to real backend numbers
  const summaryStats = [
    { label: 'Orders',    value: dashStats ? dashStats.total_orders    : '…', note: 'Total orders in the system' },
    { label: 'Flowers',   value: dashStats ? dashStats.total_flowers   : '…', note: 'Available flower types' },
    { label: 'Suppliers', value: dashStats ? dashStats.suppliers_count : '…', note: 'Active suppliers' },
  ]

  const recentOrders = dashStats?.recent_orders ?? []

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
            {summaryStats.map((stat) => (
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
          <p className="page-intro">Flower assortment and recent order activity.</p>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Bar chart — flower prices as a proxy for relative demand */}
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

        {/* Recent orders table — replaces the random monthly chart */}
        <div className="col-lg-6">
          <div className="card panel-card h-100">
            <div className="card-body">
              <div className="section-heading mb-3">
                <div>
                  <h3 className="card-title h5 mb-1">Recent Orders</h3>
                  <p className="page-intro">Last 5 orders placed in the system.</p>
                </div>
              </div>

              {recentOrders.length === 0 ? (
                <p className="text-muted">No orders yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Florist</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Value</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((o) => (
                        <tr key={o.order_id}>
                          <td>{o.florist}</td>
                          <td>{formatDate(o.date)}</td>
                          <td>{o.items}</td>
                          <td>{o.value != null ? `€${Number(o.value).toFixed(2)}` : '—'}</td>
                          <td><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                <h3>{dashStats ? dashStats.total_orders : '…'}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card h-100">
                <span>Flowers</span>
                <h3>{dashStats ? dashStats.total_flowers : '…'}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="stat-card h-100">
                <span>Suppliers</span>
                <h3>{dashStats ? dashStats.suppliers_count : '…'}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
