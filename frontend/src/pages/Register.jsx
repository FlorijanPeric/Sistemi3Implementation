import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Register(){
  const { register } = useContext(AuthContext)
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'florist' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      const res = await register(form)
      if(res?.ok) navigate('/login')
      else setError(res?.message || 'Register failed')
    }catch(err){
      setError(err?.response?.data?.message || 'Register failed')
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
                <span className="hero-eyebrow">Create account</span>
                <h3 className="card-title mt-2">Register</h3>
                <p className="page-intro">Create a florist or supplier account.</p>
              </div>
            </div>
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input className="form-control" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input className="form-control" type="email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input className="form-control" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role} onChange={e=>setForm({...form, role: e.target.value})}>
                  <option value="florist">Florist</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>
              <button className="btn btn-primary w-100" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>
            <div className="text-center mt-3">
              <Link to="/login">Already have an account? Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
