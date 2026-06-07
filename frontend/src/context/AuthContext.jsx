<<<<<<< HEAD
import React, { createContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, setAuthHeader, clearAuthHeader } from '../api/auth'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const storage = localStorage.getItem('flower_token')
    const userJson = localStorage.getItem('flower_user')
    if(storage){
      setToken(storage)
      setAuthHeader(storage)
    }
    if(userJson){
      try{ setUser(JSON.parse(userJson)) }catch(e){ }
    }
    setLoading(false)
  },[])

  async function login(credentials){
    const res = await apiLogin(credentials)
    if(res && res.token){
      setToken(res.token)
      setAuthHeader(res.token)
      localStorage.setItem('flower_token', res.token)
      if(res.user) localStorage.setItem('flower_user', JSON.stringify(res.user))
      setUser(res.user || null)
    }
    return res
  }

  async function register(data){
    const res = await apiRegister(data)
    return res
  }

  function logout(){
    setToken(null)
    setUser(null)
    localStorage.removeItem('flower_token')
    localStorage.removeItem('flower_user')
    clearAuthHeader()
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
=======
import React, { createContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, setAuthHeader, clearAuthHeader } from '../api/auth'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const storage = localStorage.getItem('flower_token')
    const userJson = localStorage.getItem('flower_user')
    if(storage){
      setToken(storage)
      setAuthHeader(storage)
    }
    if(userJson){
      try{ setUser(JSON.parse(userJson)) }catch(e){ }
    }
    setLoading(false)
  },[])

  async function login(credentials){
    const res = await apiLogin(credentials)
    if(res && res.token){
      setToken(res.token)
      setAuthHeader(res.token)
      localStorage.setItem('flower_token', res.token)
      if(res.user) localStorage.setItem('flower_user', JSON.stringify(res.user))
      setUser(res.user || null)
    }
    return res
  }

  async function register(data){
    const res = await apiRegister(data)
    return res
  }

  function logout(){
    setToken(null)
    setUser(null)
    localStorage.removeItem('flower_token')
    localStorage.removeItem('flower_user')
    clearAuthHeader()
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}
>>>>>>> Frontend
