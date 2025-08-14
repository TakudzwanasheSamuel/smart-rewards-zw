"use client"

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../ui/button';

// Fix for default icon not showing in Leaflet when used with Webpack
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;


export default function RulesMapView() {
    const hararePosition: [number, number] = [-17.8252, 31.0335];

    if (typeof window === 'undefined') {
      return null;
    }

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={hararePosition}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full rounded-lg z-0"
                >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
            </MapContainer>
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <Button variant="secondary" className="pointer-events-auto">Drop Pin and Set Radius</Button>
            </div>
        </div>
    )
}
