import { Link } from 'react-router-dom'
import logo from '../assets/orban logo.png'
import React from 'react'

const Welcome = () => {
  return (
    <main className='welcome-page'>
      <div className='welcome-card'>
        <img src={logo} alt="Orban logo" className='logo'/>

        <h1>Welcome</h1>
        <p className='to'>to</p>
        <h2>Orban area</h2>

        <div className='welcome-options'>
          <div className='option'>
            <p>Already have an Account?</p>
            <Link to="/login">
              <button>Login</button>
            </Link>
          </div>

          <div className='option'>
            <p>Don't have an Account?</p>
             <Link to="/signup">
              <button>Sign Up</button>
            </Link>
          </div>

          <div className='option'>
            <p>Want to be a Driver?</p>
             <Link to="/driver/signup">
              <button>Register</button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Welcome
