import logo from '../assets/orban logo.png'
import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'

const API_BASE = import.meta.env.VITE_API_URL

const UserSignup = () => {
  const { setCurrentUser } = useContext(ShopContext)
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${surname}`.trim(),
          email,
          phone,
          password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

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

      <h1>Sign Up</h1>
      <p className='logo-create'>Create An Account</p>

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor="firstName">Full Name</label>

          <div className='name-inputs'>
            <input 
            type="text" 
            id="firstName"
            placeholder='First Name'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
           />

            <input 
            type="text" 
            id="surname"
            placeholder='Surname'
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            />
          </div>
        </div>

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
          <label htmlFor="phone">Phone Number</label>

          <input 
          type="tel"
          id='phone'
          placeholder='+234 1234567890'
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className='login-text'>
          Already have an Account?{" "}
          <a href="/login">Login</a>
        </p>
      </form>
    </div>
    </main>
  )
}

export default UserSignup