"use client"

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Button } from '../ui/button';
import { MapPin, Save, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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

interface LocationPickerProps {
    businessName: string;
    currentLocation?: { latitude: number; longitude: number };
    onLocationSaved?: (location: { latitude: number; longitude: number }) => void;
    onClose?: () => void;
}

export default function LocationPicker({ 
    businessName, 
    currentLocation, 
    onLocationSaved, 
    onClose 
}: LocationPickerProps) {
    const hararePosition: [number, number] = [-17.8252, 31.0335];
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(
        currentLocation || null
    );
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Initialize map
    useEffect(() => {
        if (typeof window === 'undefined' || mapInitialized) {
            return;
        }

        const timer = setTimeout(() => {
            if (!mapContainerRef.current) {
                console.error('❌ Map container ref is null');
                return;
            }

            try {
                console.log('🗺️ Initializing location picker map...');
                
                // Clear any existing map instance
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }

                // Create new map instance
                const map = L.map(mapContainerRef.current, {
                    center: currentLocation ? [currentLocation.latitude, currentLocation.longitude] : hararePosition,
                    zoom: 15,
                    zoomControl: true,
                    scrollWheelZoom: true
                });

                // Add tile layer
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }).addTo(map);

                // Add click handler to place marker
                map.on('click', (e) => {
                    const { lat, lng } = e.latlng;
                    setSelectedLocation({ latitude: lat, longitude: lng });
                    
                    // Remove existing marker
                    if (markerRef.current) {
                        map.removeLayer(markerRef.current);
                    }
                    
                    // Add new marker
                    const marker = L.marker([lat, lng]).addTo(map);
                    marker.bindPopup(`${businessName}<br/>Lat: ${lat.toFixed(6)}<br/>Lng: ${lng.toFixed(6)}`).openPopup();
                    markerRef.current = marker;
                    
                    console.log('📍 Location selected:', { latitude: lat, longitude: lng });
                });

                // Add existing location marker if available
                if (currentLocation) {
                    const marker = L.marker([currentLocation.latitude, currentLocation.longitude]).addTo(map);
                    marker.bindPopup(`${businessName}<br/>Current Location`).openPopup();
                    markerRef.current = marker;
                }

                mapRef.current = map;
                setMapInitialized(true);
                console.log('✅ Location picker map initialized');

            } catch (error) {
                console.error('❌ Map initialization error:', error);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [mapInitialized, currentLocation, businessName]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                try {
                    mapRef.current.remove();
                    mapRef.current = null;
                    setMapInitialized(false);
                } catch (error) {
                    console.log('Map cleanup error (safe to ignore):', error);
                }
            }
        };
    }, []);

    const handleSaveLocation = async () => {
        if (!selectedLocation) {
            toast({
                title: "No Location Selected",
                description: "Please click on the map to select your business location",
                variant: "destructive",
            });
            return;
        }

        try {
            setSaving(true);
            console.log('💾 Saving business location:', selectedLocation);
            
            await adminApi.updateBusinessLocation(selectedLocation.latitude, selectedLocation.longitude);
            
            toast({
                title: "Location Saved",
                description: "Your business location has been saved successfully",
            });

            onLocationSaved?.(selectedLocation);
        } catch (error) {
            console.error('❌ Error saving location:', error);
            toast({
                title: "Error",
                description: "Failed to save location. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Set Business Location - {businessName}
                </CardTitle>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                    Click anywhere on the map to set your business location. This will help customers find you easily.
                </div>
                
                <div className="relative">
                    <div 
                        ref={mapContainerRef}
                        className="h-[400px] w-full rounded-lg bg-gray-100 border"
                        style={{ 
                            minHeight: '400px',
                            width: '100%',
                            position: 'relative',
                            zIndex: 0
                        }}
                    />
                    
                    {/* Status overlay */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded shadow-sm text-xs z-[1000]">
                        <div>Map: {mapInitialized ? '✅' : '⏳'}</div>
                        {selectedLocation && (
                            <div className="mt-1 text-green-600">
                                📍 Location Selected
                            </div>
                        )}
                    </div>
                </div>

                {selectedLocation && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <h4 className="font-medium text-green-800 mb-1">Selected Location</h4>
                        <p className="text-sm text-green-600">
                            Latitude: {selectedLocation.latitude.toFixed(6)}<br />
                            Longitude: {selectedLocation.longitude.toFixed(6)}
                        </p>
                    </div>
                )}

                <div className="flex gap-2 justify-end">
                    {onClose && (
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    )}
                    <Button 
                        onClick={handleSaveLocation} 
                        disabled={!selectedLocation || saving}
                        className="flex items-center gap-2"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Location'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
