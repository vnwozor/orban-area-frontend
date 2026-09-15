import React, { createContext, useState, useEffect } from 'react'

export const ShopContext = createContext()

const API_BASE = import.meta.env.VITE_API_URL


function getDistanceKm(a, b) {
    if (!a || !b) return 0
    const R = 6371
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLng = ((b.lng - a.lng) * Math.PI) / 180
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) *
            Math.cos((b.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}


const rideTiers = [
    { type: 'economy', name: 'Orban', pricePerKm: 15, image: 'orban_comfort' },
    { type: 'comfort', name: 'Orban Comfort', pricePerKm: 20, image: 'orban_car' },
]


const packageTiers = [
    { type: 'bike', name: 'Orban Rider', pricePerKm: 10, image: 'orban_bike' },
]

export const ShopContextProvider = ({ children }) => {
    const [currentUser, setCurrentUserState] = useState(() => {
        const saved = localStorage.getItem('currentUser')
        return saved ? JSON.parse(saved) : null
    })

    const setCurrentUser = (user) => {
        setCurrentUserState(user)
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user))
        } else {
            localStorage.removeItem('currentUser')
        }
    }

    const logout = () => setCurrentUser(null)

    const [pickup, setPickup] = useState(null)
    const [dropoff, setDropoff] = useState(null)
    const [rideOptions, setRideOptions] = useState([])
    const [selectedRide, setSelectedRide] = useState(null)

    const [packageOptions, setPackageOptions] = useState([])
    const [selectedPackage, setSelectedPackage] = useState(null)

    
    const searchRides = (pickupLoc, dropoffLoc) => {
        setPickup(pickupLoc)
        setDropoff(dropoffLoc)

        const distanceKm = getDistanceKm(pickupLoc, dropoffLoc) || 5

        const options = rideTiers.map((tier) => ({
            ...tier,
            eta: '14mins',
            fare: Math.round(distanceKm * tier.pricePerKm),
        }))

        setRideOptions(options)
    }

    const selectRide = (option) => {
        setSelectedRide(option)
    }

    
    const createRequest = async () => {
        if (!selectedRide || !pickup || !dropoff || !currentUser) return null

        try {
            const res = await fetch(`${API_BASE}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser._id,
                    pickupLocation: pickup,
                    dropoffLocation: dropoff,
                    fareEstimate: selectedRide.fare,
                    serviceType: 'ride',
                }),
            })
            if (!res.ok) throw new Error('Failed to create request')
            return await res.json()
        } catch (err) {
            console.error(err)
            return null
        }
    }

    const searchPackages = (pickupLoc, dropoffLoc) => {
        setPickup(pickupLoc)
        setDropoff(dropoffLoc)

        const distanceKm = getDistanceKm(pickupLoc, dropoffLoc) || 5

        const options = packageTiers.map((tier) => ({
            ...tier,
            eta: '14mins',
            fare: Math.round(distanceKm * tier.pricePerKm),
        }))

        setPackageOptions(options)
    }

    const selectPackage = (option) => {
        setSelectedPackage(option)
    }

    const createPackageRequest = async () => {
        if (!selectedPackage || !pickup || !dropoff || !currentUser) return null

        try {
            const res = await fetch(`${API_BASE}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser._id,
                    pickupLocation: pickup,
                    dropoffLocation: dropoff,
                    fareEstimate: selectedPackage.fare,
                    serviceType: 'package',
                }),
            })
            if (!res.ok) throw new Error('Failed to create package request')
            return await res.json()
        } catch (err) {
            console.error(err)
            return null
        }
    }

    const resetBooking = () => {
        setPickup(null)
        setDropoff(null)
        setRideOptions([])
        setSelectedRide(null)
        setPackageOptions([])
        setSelectedPackage(null)
    }

    
    const cancelRequest = async (requestId) => {
        try {
            const res = await fetch(`${API_BASE}/requests/${requestId}/cancel`, {
                method: 'PATCH',
            })
            if (!res.ok) throw new Error('Failed to cancel request')
            return await res.json()
        } catch (err) {
            console.error(err)
            return null
        }
    }

    const value = {
        currentUser,
        setCurrentUser,
        logout,

        pickup,
        dropoff,
        rideOptions,
        selectedRide,
        packageOptions,
        selectedPackage,

        searchRides,
        selectRide,
        createRequest,
        searchPackages,
        selectPackage,
        createPackageRequest,
        cancelRequest,
        resetBooking,
    }

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
