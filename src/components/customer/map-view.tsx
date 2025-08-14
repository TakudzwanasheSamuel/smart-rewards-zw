
"use client"

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '../ui/button';
import { Building } from 'lucide-react';

// Mock data for business locations
const businesses = [
    { id: 1, name: 'Chicken Inn', position: [-17.8252, 31.0335], offer: 'Free side with combo' },
    { id: 2, name: 'Cafe Nush', position: [-17.829, 31.0489], offer: '2-for-1 Coffee' },
    { id: 3, name: 'OK Mart', position: [-17.8639, 31.0297], offer: '10% off groceries' },
    { id: 4, 'name': 'Joina City', position: [-17.831, 31.0522], offer: 'Various retail discounts' },
];

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

export default function MapView() {
    const hararePosition: [number, number] = [-17.8252, 31.0335]; // Default center to Harare

    return (
        <MapContainer center={hararePosition} zoom={13} scrollWheelZoom={true} className="h-full w-full rounded-lg z-0">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {businesses.map(business => (
                <Marker key={business.id} position={[business.position[0], business.position[1]]}>
                    <Popup>
                       <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-primary" />
                                <h4 className="font-bold">{business.name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{business.offer}</p>
                            <Button size="sm" className="w-full">View Offer</Button>
                       </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}

    