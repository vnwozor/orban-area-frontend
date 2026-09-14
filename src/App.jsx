import React, { useContext } from 'react'
import "./App.css"
import { Navbar } from './Components/NavBar/Navbar'
import { Rider } from './Components/Rider/Rider'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { Package } from './Components/Package/Package'
import Welcome from './Pages/Welcome'
import UserSignup from './Pages/UserSignup'
import { UserLogin } from './Pages/UserLogin'
import Settings from './Pages/Settings'
import { ShopContextProvider, ShopContext } from './Context/ShopContext'



function RequireUser({ children }) {
  const { currentUser } = useContext(ShopContext)
  if (!currentUser) return <Navigate to='/login' replace />
  return children
}


function AppLayout() {
  const location = useLocation()
  const hideNavbar = ['/', '/login', '/signup'].includes(location.pathname)

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div className={hideNavbar ? '' : 'page-under-nav'}>
        <Routes>
          <Route path='/' element={<Welcome />} />
          <Route path='/signup' element={<UserSignup />} />
          <Route path='/login' element={<UserLogin />} />
          <Route
            path='/rider'
            element={
              <RequireUser>
                <Rider />
              </RequireUser>
            }
          />
          <Route
            path='/package'
            element={
              <RequireUser>
                <Package />
              </RequireUser>
            }
          />
          <Route
            path='/settings'
            element={
              <RequireUser>
                <Settings />
              </RequireUser>
            }
          />
        </Routes>
      </div>
    </>
  )
}

const App = () => {
  return (
    <ShopContextProvider>
      <AppLayout />
    </ShopContextProvider>
  )
}

export default App
