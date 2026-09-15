import React, { useEffect, useRef, useState } from 'react'
import './LocationInput.css'


async function searchPlaces(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
    )}&countrycodes=ng&limit=5`

    const res = await fetch(url)
    if (!res.ok) return []
    return res.json()
}


export const LocationInput = ({ placeholder, iconSrc, onSelect, initialValue }) => {
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const debounceRef = useRef(null)
    const userEditedRef = useRef(false)
    const skipNextSearchRef = useRef(false)


    useEffect(() => {
        if (initialValue && !userEditedRef.current) {
            skipNextSearchRef.current = true
            setQuery(initialValue)
        }
    }, [initialValue])


    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)

        if (skipNextSearchRef.current) {
            skipNextSearchRef.current = false
            return
        }

        if (query.trim().length < 3) {
            setSuggestions([])
            return
        }

        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchPlaces(query)
                setSuggestions(results)
                setShowDropdown(true)
            } catch (err) {
                console.error('Places search failed:', err)
            }
        }, 400)

        return () => clearTimeout(debounceRef.current)
    }, [query])

    const handlePick = (place) => {
        userEditedRef.current = true
        skipNextSearchRef.current = true
        setQuery(place.display_name)
        setSuggestions([])
        setShowDropdown(false)
        onSelect({
            address: place.display_name,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
        })
    }

    return (
        <div className='location-input-wrapper'>
            <div className='ride-pickup-div'>
                <img className='pickup-img' src={iconSrc} />
                <input
                    className='pickup-inp'
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        userEditedRef.current = true
                        setQuery(e.target.value)
                    }}
                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                />
            </div>

            {showDropdown && suggestions.length > 0 && (
                <div className='location-suggestions'>
                    {suggestions.map((place) => (
                        <div
                            key={place.place_id}
                            className='location-suggestion-item'
                            onMouseDown={(e) => {
                                e.preventDefault()
                                handlePick(place)
                            }}
                        >
                            {place.display_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}