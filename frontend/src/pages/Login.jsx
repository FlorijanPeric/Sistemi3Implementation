import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Login(){
  const { login } = useContext(AuthContext)
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    setError('')

    try{
      const res = await login(form)
      if(res?.ok){
        navigate('/')
      } else {
        setError(res?.message || 'Login failed')
      }
    }catch(err){
      setError(err?.response?.data?.message || 'Login failed')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-12 col-md-8 col-lg-5">
        <div className="card panel-card">
          <div className="card-body">
            <div className="section-title">
              <div>
                <span className="hero-eyebrow">Sign in</span>
                <h3 className="card-title mt-2">Welcome back</h3>
                <p className="page-intro">Access your florist or supplier account.</p>
              </div>
            </div>
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Email or username</label>
                <input
                  className="form-control"
                  value={form.email}
                  onChange={e=>setForm({...form, email: e.target.value})}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={form.password}
                  onChange={e=>setForm({...form, password: e.target.value})}
                  required
                />
              </div>
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </button>
            </form>
            <div className="text-center mt-3">
              <Link to="/register">Need an account? Register</Link>
              <br />
              <Link to="/forgot-password" className="text-muted small mt-2 d-inline-block">Forgot password?</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
