
"use client"

import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Button } from '../ui/button';
import { Building } from 'lucide-react';
import { customerApi, loyaltyApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Input } from '../ui/input';
import { Search, MapPin, Star, Clock } from 'lucide-react';

// Calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

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

interface Business {
    user_id: string;
    business_name: string;
    latitude?: number;
    longitude?: number;
    business_category?: string;
    business_description?: string;
    contact_email?: string;
    contact_phone?: string;
    business_address?: string;
    offers?: Array<{
        id: string;
        offer_name: string;
        description: string;
        points_required: number;
    }>;
}

export default function MapView() {
    const hararePosition: [number, number] = [-17.8252, 31.0335];
    const mapRef = useRef<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const { toast } = useToast();

    // Callback ref function to handle map container initialization
    const mapContainerCallbackRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            mapContainerRef.current = node;
            console.log('📦 Map container ref set via callback:', {
                width: node.offsetWidth,
                height: node.offsetHeight,
                isVisible: node.offsetParent !== null
            });
            
            // Clear any existing timeout
            if (initializationTimeoutRef.current) {
                clearTimeout(initializationTimeoutRef.current);
            }
            
            // Initialize map after a small delay to ensure DOM is ready
            initializationTimeoutRef.current = setTimeout(() => {
                if (mapContainerRef.current && !mapInitialized && isMounted) {
                    console.log('🚀 Triggering map initialization from callback ref');
                    // Trigger re-render by updating a state that will cause the initialization effect to run
                    setMapInitialized(false); // Ensure it's false to trigger init
                }
            }, 100);
        } else {
            mapContainerRef.current = null;
            console.log('📦 Map container ref cleared');
        }
    }, [mapInitialized, isMounted]);

    // Track component mount status
    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
            if (initializationTimeoutRef.current) {
                clearTimeout(initializationTimeoutRef.current);
            }
        };
    }, []);

    // Search functionality
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredBusinesses([]);
            setShowSearchResults(false);
            return;
        }

        const filtered = businesses.filter(business => 
            business.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (business.business_category && business.business_category.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        setFilteredBusinesses(filtered);
        setShowSearchResults(true);
        console.log(`🔍 Search "${searchQuery}" found ${filtered.length} businesses`);
    }, [searchQuery, businesses]);

    // Fetch all businesses for search
    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                setLoading(true);
                console.log('🏢 Fetching all businesses for search...');
                const data = await customerApi.getBusinesses();
                console.log('📍 Fetched businesses for map:', data);
                setBusinesses(data || []);
            } catch (error) {
                console.error('❌ Error fetching businesses for map:', error);
                toast({
                    title: "Error",
                    description: "Failed to load businesses",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (isMounted) {
            fetchBusinesses();
        }
    }, [toast, isMounted]);

    // Initialize map manually when component mounts
    useEffect(() => {
        if (typeof window === 'undefined' || mapInitialized || !isMounted) {
            return;
        }

        let isCancelled = false;

        // Function to check and initialize map
        const initializeMap = () => {
            // Check if component was unmounted or effect was cancelled
            if (isCancelled || !isMounted) {
                console.log('🚫 Map initialization cancelled - component unmounted');
                return;
            }

            if (!mapContainerRef.current) {
                console.error('❌ Map container ref is null - DOM not ready');
                // Retry after a longer delay
                setTimeout(initializeMap, 300);
                return;
            }

            console.log('📏 Container dimensions:', {
                width: mapContainerRef.current.offsetWidth,
                height: mapContainerRef.current.offsetHeight,
                isVisible: mapContainerRef.current.offsetParent !== null
            });

            // Ensure container has dimensions
            if (mapContainerRef.current.offsetWidth === 0 || mapContainerRef.current.offsetHeight === 0) {
                console.log('⏳ Container has no dimensions, retrying...');
                setTimeout(initializeMap, 300);
                return;
            }

            try {
                console.log('🗺️ Initializing map manually...');
                console.log('📍 Container element:', mapContainerRef.current);
                
                // Clear any existing map instance
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }

                // Create new map instance centered on Harare
                const map = L.map(mapContainerRef.current, {
                    center: hararePosition,
                    zoom: 12,
                    zoomControl: true,
                    scrollWheelZoom: true
                });

                console.log('🗺️ Map instance created:', map);

                // Add tile layer
                const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                });
                
                tileLayer.addTo(map);
                console.log('🎨 Tile layer added');

                // Only set state if component is still mounted
                if (!isCancelled) {
                    mapRef.current = map;
                    setMapInitialized(true);
                    console.log('✅ Map initialized successfully');
                }

            } catch (error) {
                console.error('❌ Map initialization error:', error);
            }
        };

        // Start initialization with a small delay
        const timer = setTimeout(initializeMap, 100);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, [mapInitialized, isMounted]);

    // Update markers when selected business changes
    useEffect(() => {
        if (!mapRef.current || !mapInitialized) {
            return;
        }

        console.log('🎯 Updating map markers...');

        try {
            // Clear existing markers
            markersRef.current.forEach(marker => {
                if (mapRef.current) {
                    mapRef.current.removeLayer(marker);
                }
            });
            markersRef.current = [];

            // Show only selected business or all businesses with location data
            const businessesToShow = selectedBusiness ? 
                [selectedBusiness] : 
                businesses.filter(business => business.latitude && business.longitude);

            // Add business markers
            businessesToShow.forEach(business => {
                if (!business.latitude || !business.longitude || !mapRef.current) return;

                const marker = L.marker([business.latitude, business.longitude])
                    .addTo(mapRef.current);

                // Create popup content with business details and offers
                const popupContent = document.createElement('div');
                popupContent.className = 'space-y-3 p-3 max-w-sm';
                popupContent.innerHTML = `
                    <div class="border-b pb-2">
                        <div class="flex items-center gap-2 mb-1">
                            <div class="w-5 h-5 text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                                    <path d="M6 12H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2"/>
                                    <path d="M18 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/>
                                    <path d="M10 6h4"/>
                                    <path d="M10 10h4"/>
                                    <path d="M10 14h4"/>
                                    <path d="M10 18h4"/>
                                </svg>
                            </div>
                            <h4 class="font-bold text-lg">${business.business_name}</h4>
                        </div>
                        <p class="text-sm text-gray-600">${business.business_category || 'Business'}</p>
                        ${business.business_description ? `
                            <p class="text-xs text-gray-500 mt-1">${business.business_description}</p>
                        ` : ''}
                    </div>
                    
                    ${business.offers && business.offers.length > 0 ? `
                        <div>
                            <p class="font-medium text-sm mb-2">🎁 Current Offers:</p>
                            <div class="space-y-2">
                                ${business.offers.slice(0, 2).map(offer => `
                                    <div class="bg-green-50 border border-green-200 rounded p-2">
                                        <p class="font-medium text-sm text-green-800">${offer.offer_name}</p>
                                        <p class="text-xs text-green-600">${offer.points_required} points required</p>
                                        ${offer.description ? `<p class="text-xs text-gray-600 mt-1">${offer.description}</p>` : ''}
                                    </div>
                                `).join('')}
                                ${business.offers.length > 2 ? `
                                    <p class="text-xs text-gray-500">+${business.offers.length - 2} more offers available</p>
                                ` : ''}
                            </div>
                        </div>
                    ` : `
                        <div class="bg-gray-50 border border-gray-200 rounded p-2">
                            <p class="text-sm text-gray-600">No current offers available</p>
                        </div>
                    `}
                    
                    ${business.contact_phone || business.contact_email || business.business_address ? `
                        <div class="text-xs text-gray-500 space-y-1">
                            ${business.contact_phone ? `<p>📞 ${business.contact_phone}</p>` : ''}
                            ${business.contact_email ? `<p>✉️ ${business.contact_email}</p>` : ''}
                            ${business.business_address ? `<p>📍 ${business.business_address}</p>` : ''}
                        </div>
                    ` : ''}
                `;

                // Add view button
                const viewButton = document.createElement('button');
                viewButton.className = 'w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors font-medium';
                viewButton.textContent = 'View Full Business Profile →';
                viewButton.onclick = () => {
                    console.log('🔗 Navigating to business profile:', business.user_id);
                    window.location.href = `/customer/businesses/${business.user_id}`;
                };
                popupContent.appendChild(viewButton);

                marker.bindPopup(popupContent, { 
                    maxWidth: 350,
                    className: 'custom-popup'
                });
                markersRef.current.push(marker);
                
                // If this is a selected business, center the map on it and open popup
                if (selectedBusiness && business.user_id === selectedBusiness.user_id) {
                    mapRef.current.setView([business.latitude, business.longitude], 15);
                    marker.openPopup();
                }
            });

            console.log(`✅ Added ${markersRef.current.length} markers to map`);
        } catch (error) {
            console.error('❌ Error updating markers:', error);
        }
    }, [businesses, mapInitialized, selectedBusiness]);

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                try {
                    // Clean up all markers
                    markersRef.current.forEach(marker => {
                        mapRef.current?.removeLayer(marker);
                    });
                    markersRef.current = [];
                    
                    mapRef.current.remove();
                    mapRef.current = null;
                    setMapInitialized(false);
                    console.log('🧹 Map cleaned up');
                } catch (error) {
                    console.log('Map cleanup error (safe to ignore):', error);
                }
            }
        };
    }, []);

    if (typeof window === 'undefined' || !isMounted) {
        return (
            <div className="h-full w-full rounded-lg flex items-center justify-center bg-gray-100">
                <p className="text-sm text-muted-foreground">Initializing map...</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full w-full rounded-lg flex items-center justify-center bg-gray-200">
                <div className="space-y-2 text-center">
                    <Skeleton className="h-4 w-32 mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading businesses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative">
            {/* Search Interface */}
            <div className="absolute top-4 left-4 right-4 z-[1000]">
                <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-lg shadow-lg p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search for businesses (e.g., Chicken Inn, Restaurant, Food...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4"
                        />
                    </div>
                    
                    {/* Search Results */}
                    {showSearchResults && (
                        <div className="mt-3 max-h-60 overflow-y-auto space-y-2">
                            {filteredBusinesses.length > 0 ? (
                                <>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Found {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''}
                                    </p>
                                    {filteredBusinesses.map((business) => (
                                        <div 
                                            key={business.user_id}
                                            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => {
                                                if (business.latitude && business.longitude) {
                                                    setSelectedBusiness(business);
                                                    setShowSearchResults(false);
                                                    setSearchQuery(business.business_name);
                                                } else {
                                                    toast({
                                                        title: "Location Not Set",
                                                        description: "This business hasn't set their location on the map yet.",
                                                        variant: "destructive",
                                                    });
                                                }
                                            }}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-blue-600" />
                                                        {business.business_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {business.business_category || 'Business'}
                                                    </p>
                                                    {business.business_description && (
                                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                            {business.business_description}
                                                        </p>
                                                    )}
                                                    {business.offers && business.offers.length > 0 && (
                                                        <div className="flex items-center gap-1 mt-2">
                                                            <Star className="h-3 w-3 text-green-600" />
                                                            <span className="text-xs text-green-600">
                                                                {business.offers.length} offer{business.offers.length !== 1 ? 's' : ''} available
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-3 flex flex-col items-end">
                                                    {business.latitude && business.longitude ? (
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <MapPin className="h-3 w-3" />
                                                            <span className="text-xs">On Map</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-gray-400">
                                                            <Clock className="h-3 w-3" />
                                                            <span className="text-xs">No Location</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-500">No businesses found matching "{searchQuery}"</p>
                                    <p className="text-xs text-gray-400 mt-1">Try searching for business names or categories</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Selected Business Display */}
                    {selectedBusiness && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-blue-800">📍 Showing on map:</p>
                                    <p className="text-sm text-blue-600">{selectedBusiness.business_name}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedBusiness(null);
                                        setSearchQuery('');
                                    }}
                                    className="text-xs"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div 
                ref={mapContainerCallbackRef}
                className="h-full w-full rounded-lg bg-gray-100"
                style={{ 
                    minHeight: '500px',
                    height: '100%',
                    width: '100%',
                    position: 'relative',
                    zIndex: 0,
                    display: 'block' // Ensure container is visible
                }}
                onLoad={() => console.log('📦 Map container loaded')}
            />

                        {/* Business count indicator */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-sm z-[1000] text-xs">
                <div className="flex items-center gap-1 text-blue-600">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    {businesses.filter(b => b.latitude && b.longitude).length} businesses on map
                </div>
                {selectedBusiness && (
                    <div className="mt-1 text-green-600 text-center">
                        📍 Focused on {selectedBusiness.business_name}
                    </div>
                )}
            </div>

            {/* No businesses message */}
            {mapInitialized && businesses.length === 0 && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-lg shadow-sm z-[1000]">
                    <p className="text-sm text-muted-foreground">
                        No businesses found. Use the search box to find businesses.
                    </p>
                </div>
            )}

            {/* Instructions for first-time users */}
            {!selectedBusiness && !searchQuery && businesses.length > 0 && (
                <div className="absolute bottom-4 left-4 bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-sm z-[1000] max-w-xs">
                    <p className="text-sm text-blue-800 font-medium mb-1">💡 How to use the map:</p>
                    <ul className="text-xs text-blue-600 space-y-1">
                        <li>• Search for businesses by name or category</li>
                        <li>• Click on search results to view on map</li>
                        <li>• Click map markers for detailed business info</li>
                        <li>• Use "View Full Profile" to see complete details</li>
                    </ul>
                            </div>
            )}
                       </div>
    );
}
