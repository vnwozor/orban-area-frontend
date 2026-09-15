import React, { useContext, useEffect, useState } from 'react'
import "./Rider.css"
import { Title } from '../../Components/Title/Title'
import { assets } from '../../assets/assets'
import { ShopContext } from '../../Context/ShopContext'
import { MapView } from '../MapView/Map'
import { LocationInput } from '../LocationInput/LocationInput'
import { Card } from '../DriverCardInfo/Card'

const API_BASE = import.meta.env.VITE_API_URL

// free reverse-geocoding — turns raw GPS coordinates into a readable address
async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    const res = await fetch(url)
    if (!res.ok) return null
    return res.json()
}

export const Rider = () => {
    const {
        currentUser,
        rideOptions,
        selectedRide,
        searchRides,
        selectRide,
        createRequest,
        cancelRequest,
        resetBooking,
    } = useContext(ShopContext)

    const storageKey = currentUser ? `orban_active_ride_${currentUser._id}` : null

    const [pickupSelection, setPickupSelection] = useState(null)
    const [dropoffSelection, setDropoffSelection] = useState(null)
    const [liveAddress, setLiveAddress] = useState('')

    useEffect(() => {
        if (!navigator.geolocation) return

        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords
            const place = await reverseGeocode(latitude, longitude)
            if (!place) return

            setLiveAddress(place.display_name)
            setPickupSelection({ address: place.display_name, lat: latitude, lng: longitude })
        })
    }, [])

    const [routeInfo, setRouteInfo] = useState(null)

    const [activeRequest, setActiveRequest] = useState(null)

    const [restoring, setRestoring] = useState(true)

    useEffect(() => {
        if (!storageKey) {
            setRestoring(false)
            return
        }

        const savedId = localStorage.getItem(storageKey)
        if (!savedId) {
            setRestoring(false)
            return
        }

        fetch(`${API_BASE}/requests/${savedId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Saved ride no longer exists')
                return res.json()
            })
            .then((request) => {
                if (['completed', 'cancelled', 'declined'].includes(request.status)) {
                    localStorage.removeItem(storageKey)
                } else {
                    setActiveRequest(request)
                }
            })
            .catch(() => localStorage.removeItem(storageKey))
            .finally(() => setRestoring(false))
    }, [storageKey])

    useEffect(() => {
        if (!storageKey) return
        if (activeRequest && !['completed', 'cancelled', 'declined'].includes(activeRequest.status)) {
            localStorage.setItem(storageKey, activeRequest._id)
        } else {
            localStorage.removeItem(storageKey)
        }
    }, [activeRequest, storageKey])

    const assignedDriver =
        activeRequest?.driverId && typeof activeRequest.driverId === 'object'
            ? activeRequest.driverId
            : null

    const routeTo = activeRequest?.status === 'accepted' ? 'driver' : 'destination'

    useEffect(() => {
        if (!activeRequest?._id) return
        if (['completed', 'declined', 'cancelled'].includes(activeRequest.status)) return

        const intervalId = setInterval(async () => {
            try {
                const res = await fetch(`${API_BASE}/requests/${activeRequest._id}`)
                if (!res.ok) return
                setActiveRequest(await res.json())
            } catch (err) {
                console.error('Failed to refresh request:', err)
            }
        }, 3000)

        return () => clearInterval(intervalId)
    }, [activeRequest?._id, activeRequest?.status])

    const handleSearch = () => {
        if (!pickupSelection || !dropoffSelection) return
        searchRides(pickupSelection, dropoffSelection)
    }

    const handleSelectRide = async () => {
        if (!selectedRide) return
        const newRequest = await createRequest()
        if (newRequest) setActiveRequest(newRequest)
    }

    const handleCancel = async () => {
        if (!activeRequest) return
        const updated = await cancelRequest(activeRequest._id)
        if (updated) setActiveRequest(updated)
    }

    if (restoring) {
        return (
            <div className='ride-main'>
                <div className='ride-sidebar'>
                    <div className='ride-top-section'>
                        <p className='ride-car-p'>Loading...</p>
                    </div>
                </div>
                <div className='ride-map-panel' />
            </div>
        )
    }

    return (
        <div className='ride-main'>
            <div className='ride-sidebar'>
                {!activeRequest && (
                    <div className='ride-top-section'>
                        <Title title="Get a Ride" />

                        <div className='ride-input-div'>
                            <LocationInput
                                placeholder="Pickup-Loaction"
                                iconSrc={assets.pickup_icon}
                                onSelect={setPickupSelection}
                                initialValue={liveAddress}
                            />

                            <LocationInput
                                placeholder="Dropoff-Loaction"
                                iconSrc={assets.dropoff_icon}
                                onSelect={setDropoffSelection}
                            />
                        </div>

                        <button onClick={handleSearch} className='ride-search-btn'>
                            Search
                        </button>
                    </div>
                )}

                {activeRequest ? (
                    <>
                        {activeRequest.status === 'pending' && (
                            <div className='ride-top-section'>
                                <Title title="Trip Status" />
                                <p className='ride-car-h'>Looking for a driver...</p>
                                <button onClick={handleCancel} className='ride-cancel-btn'>
                                    Cancel Ride
                                </button>
                            </div>
                        )}

                        {activeRequest.status === 'accepted' && assignedDriver && (
                            <>
                                <Card
                                    etaMinutes={routeInfo?.durationMin}
                                    driverName={assignedDriver.name}
                                    carModel={assignedDriver.car?.model}
                                    plateNumber={assignedDriver.car?.plateNumber}
                                    pickupAddress={activeRequest.pickupLocation?.address}
                                    dropoffAddress={activeRequest.dropoffLocation?.address}
                                    fare={activeRequest.fareEstimate}
                                />
                                <button onClick={handleCancel} className='ride-cancel-btn'>
                                    Cancel Ride
                                </button>
                            </>
                        )}

                        {activeRequest.status === 'ongoing' && assignedDriver && (
                            <>
                                <Card
                                    title="Trip in progress"
                                    etaMinutes={routeInfo?.durationMin}
                                    driverName={assignedDriver.name}
                                    carModel={assignedDriver.car?.model}
                                    plateNumber={assignedDriver.car?.plateNumber}
                                    pickupAddress={activeRequest.pickupLocation?.address}
                                    dropoffAddress={activeRequest.dropoffLocation?.address}
                                    fare={activeRequest.fareEstimate}
                                />
                                <button onClick={handleCancel} className='ride-cancel-btn'>
                                    Cancel Ride
                                </button>
                            </>
                        )}

                        {activeRequest.status === 'completed' && (
                            <div className='ride-top-section'>
                                <Title title="Trip Status" />
                                <p className='ride-car-h'>Trip completed</p>
                                <button onClick={() => setActiveRequest(null)} className='ride-search-btn'>
                                    Book Another Ride
                                </button>
                            </div>
                        )}

                        {activeRequest.status === 'cancelled' && (
                            <div className='ride-top-section'>
                                <Title title="Trip Status" />
                                <p className='ride-car-h'>Ride cancelled</p>
                                <button onClick={() => setActiveRequest(null)} className='ride-search-btn'>
                                    Book again
                                </button>
                            </div>
                        )}

                        {activeRequest.status === 'declined' && (
                            <div className='ride-top-section'>
                                <Title title="Trip Status" />
                                <p className='ride-car-h'>Driver declined — try again</p>
                                <button onClick={() => setActiveRequest(null)} className='ride-search-btn'>
                                    Book again
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    rideOptions.length > 0 && (
                        <div className='ride-top-section'>
                            <Title title="Select Ride" />

                            {rideOptions.map((option) => (
                                <div
                                    key={option.type}
                                    onClick={() => selectRide(option)}
                                    className={
                                        selectedRide?.type === option.type
                                            ? 'ride-car-div ride-car-selected'
                                            : 'ride-car-div'
                                    }
                                >
                                    <div className='ride-car-leftside'>
                                        <img className='orban-car-img' src={assets[option.image]} alt="" />
                                        <div>
                                            <p className='ride-car-h'>{option.name}</p>
                                            <p className='ride-car-p'>{option.eta}</p>
                                            <p className='ride-car-p'>Mid-size-cars</p>
                                        </div>
                                    </div>

                                    <div className='ride-car-price-div'>
                                        <img className='naira-icon' src={assets.naira_icon} />
                                        <p className='ride-price-p'>{option.fare.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}

                            <button onClick={handleSelectRide} className='ride-search-btn'>
                                Select Ride
                            </button>
                        </div>
                    )
                )}
            </div>

            <div className='ride-map-panel'>
                <MapView
                    pickup={pickupSelection}
                    dropoff={dropoffSelection}
                    driverLocation={assignedDriver?.currentLocation}
                    routeTo={routeTo}
                    onRouteInfo={setRouteInfo}
                />
            </div>
        </div>
    )
}
