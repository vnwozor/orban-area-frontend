import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import "./Navbar.css"
import { NavLink, useNavigate } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'

export const Navbar = () => {
  const { currentUser, logout } = useContext(ShopContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='nav-main'>

        <div className='nav-left-section'>

            <NavLink to="/">
                <img className='orban-nav-logo' src={assets.orban_logo} />
            </NavLink>
            
        </div>

        <div className='nav-types'>
        
            <NavLink className='nav-route' to="/rider">
                <img className='car-icon' src={assets.car_icon} />
                <p>
                    Ride
                </p>
            </NavLink>

            <NavLink  className='nav-route' to='/package'>
                <img className='car-icon' src={assets.package_icon} />
                <p>
                    Package
                </p>
            </NavLink>

        </div>


        <div className='nav-right-section'>
            {currentUser ? (
                <>
                    <NavLink to='/settings' className='nav-icon-link'>
                        <img src={assets.settings_icon} alt="Settings" />
                    </NavLink>
                    <button onClick={handleLogout} className='nav-logout-btn'>Logout</button>
                </>
            ) : (
                <img src={assets.settings_icon} alt="" />
            )}
        </div>
    </div>
  )
}
