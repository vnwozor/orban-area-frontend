import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'


delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})


const liveLocationIcon = L.divIcon({
    className: '',
    html: '<div class="live-dot"><div class="live-dot-pulse"></div></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
})

const destinationIcon = L.divIcon({
    className: '',
    html: '<div class="pin-icon">📍</div>',
    iconSize: [30, 30],
    iconAnchor: [15, 28],
})

const driverIcon = L.divIcon({
    className: '',
    html: '<div class="car-icon">🚗</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
})


async function fetchRoute(origin, destination) {
    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    if (!data.routes || data.routes.length === 0) return null
    return {
        coords: data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        distanceKm: data.routes[0].distance / 1000,
        durationMin: Math.round(data.routes[0].duration / 60),
    }
}


function FollowPoint({ center }) {
    const map = useMap()

    useEffect(() => {
        if (center) map.setView(center, map.getZoom())
    }, [center?.[0], center?.[1]])

    return null
}



export const MapView = ({ pickup, dropoff, driverLocation, routeTo = 'destination', onRouteInfo }) => {
    const [routeCoords, setRouteCoords] = useState(null)
    const [myLocation, setMyLocation] = useState(null)

    
    const routeOrigin = pickup
    const routeDestination = routeTo === 'driver' ? driverLocation : dropoff

 
    useEffect(() => {
        if (!routeOrigin || !routeDestination) {
            setRouteCoords(null)
            return
        }
        let cancelled = false
        fetchRoute(routeOrigin, routeDestination).then((result) => {
            if (cancelled || !result) return
            setRouteCoords(result.coords)
            if (onRouteInfo) onRouteInfo({ distanceKm: result.distanceKm, durationMin: result.durationMin })
        })
        return () => {
            cancelled = true
        }
    }, [routeOrigin?.lat, routeOrigin?.lng, routeDestination?.lat, routeDestination?.lng, routeTo])

 

    useEffect(() => {
        if (!navigator.geolocation) return

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
            },
            () => {
                // permission denied or unavailable — silently skip, map still works
            },
            { enableHighAccuracy: true }
        )

        return () => navigator.geolocation.clearWatch(watchId)
    }, [])

    
    const fallbackCenter = [9.0765, 7.3986]
    const initialCenter = pickup
        ? [pickup.lat, pickup.lng]
        : myLocation
        ? [myLocation.lat, myLocation.lng]
        : fallbackCenter

    
    const followCenter = driverLocation
        ? [driverLocation.lat, driverLocation.lng]
        : myLocation
        ? [myLocation.lat, myLocation.lng]
        : pickup
        ? [pickup.lat, pickup.lng]
        : null

    return (
        <MapContainer
            center={initialCenter}
            zoom={pickup ? 13 : 12}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FollowPoint center={followCenter} />

            {myLocation && (
                <Marker position={[myLocation.lat, myLocation.lng]} icon={liveLocationIcon}>
                    <Popup>You are here</Popup>
                </Marker>
            )}

            {pickup && (
                <Marker position={[pickup.lat, pickup.lng]}>
                    <Popup>Pickup: {pickup.address}</Popup>
                </Marker>
            )}

            {dropoff && (
                <Marker position={[dropoff.lat, dropoff.lng]} icon={destinationIcon}>
                    <Popup>Dropoff: {dropoff.address}</Popup>
                </Marker>
            )}

            {driverLocation && (
                <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                    <Popup>Driver</Popup>
                </Marker>
            )}

            
            {routeOrigin && routeDestination && (
                <Polyline
                    positions={routeCoords || [[routeOrigin.lat, routeOrigin.lng], [routeDestination.lat, routeDestination.lng]]}
                    pathOptions={{ color: '#1a73e8', weight: 5, opacity: 0.9 }}
                />
            )}
        </MapContainer>
    )
}