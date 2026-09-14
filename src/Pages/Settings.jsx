import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Settings.css'
import { ShopContext } from '../Context/ShopContext'

const API_BASE = 'http://localhost:5000/api'

const Settings = () => {
    const { currentUser, logout } = useContext(ShopContext)
    const navigate = useNavigate()
    const [completedRides, setCompletedRides] = useState(null)

    useEffect(() => {
        fetch(`${API_BASE}/users/${currentUser._id}/stats`)
            .then((res) => res.json())
            .then((data) => setCompletedRides(data.completedRides))
            .catch((err) => console.error('Failed to load stats:', err))
    }, [currentUser._id])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initial = currentUser.name?.charAt(0).toUpperCase() || '?'

    return (
        <main className='settings-page'>
            <h1>My Account</h1>

            <div className='settings-avatar'>{initial}</div>

            <div className='settings-card'>
                <div className='settings-row'>
                    <span className='settings-row-label'>Name</span>
                    <span className='settings-row-value'>{currentUser.name}</span>
                </div>
                <div className='settings-row'>
                    <span className='settings-row-label'>Email</span>
                    <span className='settings-row-value'>{currentUser.email}</span>
                </div>
                <div className='settings-row'>
                    <span className='settings-row-label'>Phone</span>
                    <span className='settings-row-value'>{currentUser.phone}</span>
                </div>

                <div className='settings-stat'>
                    <div className='settings-stat-number'>{completedRides ?? '—'}</div>
                    <div className='settings-stat-label'>Rides completed</div>
                </div>
            </div>

            <button onClick={handleLogout} className='settings-logout-btn'>
                Logout
            </button>
        </main>
    )
}

export default Settings
