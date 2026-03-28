import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapPin, Navigation } from 'lucide-react'

// Fix for Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})
L.Marker.prototype.options.icon = DefaultIcon

function LocationMarker({ position, setPosition }) {
  const map = useMap()

  useMapEvents({
    click(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export default function LocationPicker({ onLocationSelect, initialPosition = null }) {
  const [position, setPosition] = useState(initialPosition || { lat: 20.5937, lng: 78.9629 }) // Default to Center of India

  useEffect(() => {
    if (onLocationSelect && position) {
      onLocationSelect(position)
    }
  }, [position, onLocationSelect])

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setPosition(newPos)
    })
  }

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button 
          type="button" 
          onClick={handleLocate}
          style={{ 
            background: 'white', border: 'none', padding: 10, borderRadius: 8, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            color: '#10b981'
          }}
          title="Use My Current Location"
        >
          <Navigation size={20} />
        </button>
      </div>
      
      <MapContainer 
        center={position} 
        zoom={position.lat === 20.5937 ? 5 : 13} 
        style={{ height: '300px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      
      <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <MapPin size={16} color="#10b981" />
        {position ? `Selected: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : "Click on map to pick location"}
      </div>
    </div>
  )
}
