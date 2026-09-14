import React, { useContext, useEffect, useState } from 'react'
import './Package.css'
import { assets } from '../../assets/assets'
import { Title } from '../Title/Title'
import { ShopContext } from '../../Context/ShopContext'
import { MapView } from '../MapView/Map'
import { LocationInput } from '../LocationInput/LocationInput'
import { Card } from '../DriverCardInfo/Card'

const API_BASE = 'http://localhost:5000/api'

// free reverse-geocoding — turns raw GPS coordinates into a readable address
async function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    const res = await fetch(url)
    if (!res.ok) return null
    return res.json()
}

export const Package = () => {
    const {
        currentUser,
        packageOptions,
        selectedPackage,
        searchPackages,
        selectPackage,
        createPackageRequest,
        cancelRequest,
    } = useContext(ShopContext)

    const storageKey = currentUser ? `orban_active_package_${currentUser._id}` : null

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
                if (!res.ok) throw new Error('Saved delivery no longer exists')
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
        searchPackages(pickupSelection, dropoffSelection)
    }

    const handleSelectPackage = async () => {
        if (!selectedPackage) return
        const newRequest = await createPackageRequest()
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
                        <Title title="Send a Package" />

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
                                <Title title="Delivery Status" />
                                <p className='ride-car-h'>Looking for a rider...</p>
                                <button onClick={handleCancel} className='ride-cancel-btn'>
                                    Cancel Delivery
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
                                    Cancel Delivery
                                </button>
                            </>
                        )}

                        {activeRequest.status === 'ongoing' && assignedDriver && (
                            <>
                                <Card
                                    title="Delivery in progress"
                                    etaMinutes={routeInfo?.durationMin}
                                    driverName={assignedDriver.name}
                                    carModel={assignedDriver.car?.model}
                                    plateNumber={assignedDriver.car?.plateNumber}
                                    pickupAddress={activeRequest.pickupLocation?.address}
                                    dropoffAddress={activeRequest.dropoffLocation?.address}
                                    fare={activeRequest.fareEstimate}
                                />
                                <button onClick={handleCancel} className='ride-cancel-btn'>
                                    Cancel Delivery
                                </button>
                            </>
                        )}

                        {activeRequest.status === 'completed' && (
                            <div className='ride-top-section'>
                                <Title title="Delivery Status" />
                                <p className='ride-car-h'>Delivery completed</p>
                                <button onClick={() => setActiveRequest(null)} className='ride-search-btn'>
                                    Send Another Package
                                </button>
                            </div>
                        )}

                        {activeRequest.status === 'cancelled' && (
                            <div className='ride-top-section'>
                                <Title title="Delivery Status" />
                                <p className='ride-car-h'>Delivery cancelled</p>
                                <button onClick={() => setActiveRequest(null)} className='ride-search-btn'>
                                    Book again
                                </button>
                            </div>
                        )}

                        {activeRequest.status === 'declined' && (
                            <div className='ride-top-section'>
                                <Title title="Delivery Status" />
                                <p className='ride-car-h'>Rider declined — try again</p>
                                <button onClick={() => setActiveRequest(null)} className='ride-search-btn'>
                                    Book again
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    packageOptions.length > 0 && (
                        <div className='ride-top-section'>
                            <Title title="Select Ride" />

                            {packageOptions.map((option) => (
                                <div
                                    key={option.type}
                                    onClick={() => selectPackage(option)}
                                    className={
                                        selectedPackage?.type === option.type
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

                            <button onClick={handleSelectPackage} className='ride-search-btn'>
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
