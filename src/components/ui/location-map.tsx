"use client";

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Locate } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Define types for the map components
interface LatLng {
  lat: number;
  lng: number;
}

interface LocationMapProps {
  onLocationSelect: (location: LatLng) => void;
  initialLocation?: LatLng;
  height?: string;
  className?: string;
}

// Default location (Zimbabwe coordinates)
const DEFAULT_LOCATION: LatLng = {
  lat: -19.015438,
  lng: 29.154857
};

export default function LocationMap({
  onLocationSelect,
  initialLocation = DEFAULT_LOCATION,
  height = "400px",
  className = ""
}: LocationMapProps) {
  const [selectedLocation, setSelectedLocation] = useState<LatLng>(initialLocation);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Fix for default markers in Leaflet with webpack
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Initialize map
        if (!mapRef.current) {
          const map = L.map('location-map').setView([selectedLocation.lat, selectedLocation.lng], 13);

          // Add tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          // Add marker
          const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
            draggable: true
          }).addTo(map);

          // Handle marker drag
          marker.on('dragend', (e: any) => {
            const newPos = e.target.getLatLng();
            const newLocation = { lat: newPos.lat, lng: newPos.lng };
            setSelectedLocation(newLocation);
            onLocationSelect(newLocation);
          });

          // Handle map click
          map.on('click', (e: any) => {
            const newLocation = { lat: e.latlng.lat, lng: e.latlng.lng };
            marker.setLatLng([newLocation.lat, newLocation.lng]);
            setSelectedLocation(newLocation);
            onLocationSelect(newLocation);
          });

          mapRef.current = map;
          markerRef.current = marker;
        }

        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading map:', error);
        toast({
          title: "Map Error",
          description: "Failed to load the map. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    loadMap();

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([newLocation.lat, newLocation.lng], 15);
          markerRef.current.setLatLng([newLocation.lat, newLocation.lng]);
        }

        setIsLocating(false);
        toast({
          title: "Location found",
          description: "Your current location has been set.",
        });
      },
      (error) => {
        setIsLocating(false);
        let message = "Failed to get your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }

        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Business Location
          </div>
          <Button
            onClick={getCurrentLocation}
            disabled={isLocating}
            variant="outline"
            size="sm"
          >
            <Locate className="mr-2 h-4 w-4" />
            {isLocating ? 'Locating...' : 'Use Current Location'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Click on the map or drag the marker to set your business location. You can also use your current location.
          </p>
          
          <div 
            id="location-map" 
            style={{ height, width: '100%' }}
            className="rounded-lg border"
          />
          
          {selectedLocation && (
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded">
              <strong>Selected Location:</strong><br />
              Latitude: {selectedLocation.lat.toFixed(6)}<br />
              Longitude: {selectedLocation.lng.toFixed(6)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
