import React, { useState, useContext } from 'react'
import logo from '../assets/orban logo.png'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'

const API_BASE = import.meta.env.VITE_API_URL

export const UserLogin = () => {
  const { setCurrentUser } = useContext(ShopContext)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      setCurrentUser(data)
      navigate('/rider')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className='signup-page'>
        <div className='signup-card'>
          <div className='logo'>
            <img src={logo} alt="Orban logo" className='logo-icon'/>
    
            <div className='logo-text'>
             <span>Orban</span>
             <small>area</small>
           </div>
          </div>
    
          <h1>Login</h1>
          <p className='logo-create'>Login to your Account</p>
    
          <form onSubmit={handleSubmit}>
    
            <div className='form-group'>
              <label htmlFor="email">Email</label>
    
              <input 
              type="email"
              id='email'
              placeholder='example@gmail.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              />
            </div>
    
            <div className='form-group'>
              <label htmlFor="password">Password</label>
    
              <input 
              type="password"
              id='password'
              placeholder='***************'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              />
            </div>

            {error && <p style={{ color: 'red', fontSize: 14 }}>{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
    
            <p className='login-text'>
              Dont Have An Account?{" "}
              <Link to="/signup">
                Sign Up
              </Link>

            
            </p>
          </form>
        </div>
    </main>
  )
}