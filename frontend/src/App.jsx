import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Flowers from './pages/Flowers'
import Recommendations from './pages/Recommendations'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Suppliers from './pages/Suppliers'
import Admin from './pages/Admin'
import { AuthContext } from './context/AuthContext'

function AppShell(){
  const { user, logout, token } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <BrowserRouter>
      <header className="brand-strip">
        <div className="container-xl brand-strip-inner">
          <Link className="brand-mark" to="/" aria-label="Bloom and Blossom home">
            <span className="brand-mark-icon">✿</span>
            <span className="brand-mark-text">
              <strong>Bloom &amp; Blossom</strong>
              <small>Elegant floral ordering for boutique shops</small>
            </span>
          </Link>
          <div className="brand-strip-copy d-none d-md-block">
            <span className="brand-strip-eyebrow">Premium florist workspace</span>
            <p>Track orders, discover seasonal flowers, and keep suppliers in sync.</p>
          </div>
        </div>
      </header>

      <nav className="navbar navbar-expand-lg premium-navbar">
        <div className="container-xl">
          <button
            className="navbar-toggler premium-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-lg-2">
              <li className="nav-item"><Link className="nav-link premium-nav-link" to="/">Dashboard</Link></li>
              <li className="nav-item"><Link className="nav-link premium-nav-link" to="/flowers">Flowers</Link></li>
              <li className="nav-item"><Link className="nav-link premium-nav-link" to="/suppliers">Suppliers</Link></li>
              <li className="nav-item"><Link className="nav-link premium-nav-link" to="/orders">Orders</Link></li>
              <li className="nav-item"><Link className="nav-link premium-nav-link" to="/recommendations">Recommendations</Link></li>
              {user?.role === 'admin' && (
                <li className="nav-item"><Link className="nav-link premium-nav-link" to="/admin">Admin</Link></li>
              )}
            </ul>
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
              {token ? (
                <>
                  <li className="nav-item">
                    <span className="nav-link user-pill">{user?.username || 'User'}</span>
                  </li>
                  <li className="nav-item">
                    <button className="btn btn-ghost btn-sm" onClick={logout} type="button">
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item"><Link className="nav-link premium-nav-link" to="/login">Login</Link></li>
                  <li className="nav-item"><Link className="nav-link premium-nav-link" to="/register">Register</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <main className="app-shell container-xl py-4 py-lg-5">
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/flowers" element={<Flowers/>} />
          <Route path="/suppliers" element={<Suppliers/>} />
          <Route path="/orders" element={<ProtectedRoute><Orders/></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><Recommendations/></ProtectedRoute>} />
          <Route path="/admin" element={<Admin/>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default function App(){
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
