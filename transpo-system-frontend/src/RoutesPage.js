import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Polyline } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaFlag, FaKeyboard, FaArrowRight, FaArrowLeft, FaGasPump, FaMoneyBillWave } from "react-icons/fa";
import { IoCloseCircleOutline, IoLocationSharp } from "react-icons/io5"; 
import { MdOutlineDirectionsBus } from "react-icons/md"; 
import { RiEBike2Line } from "react-icons/ri";
import './RoutesPage.css';
import switchLogo from './assets/loop.png';
import NotificationModal from './components/NotificationModal';

const containerStyle = {
    width: '100vw',
    height: '100vh'
};

const center = {
    lat: 14.86994, // Approximate latitude of Santa Maria town center
    lng: 121.00238 // Approximate longitude of Santa Maria town center
};

const libraries = ['places'];


// Utility function to manage recent searches in localStorage (from Section 1)
const MAX_RECENT_SEARCHES = 5;

const updateRecentSearches = (key, newValue) => {
    if (!newValue || newValue.trim() === '') return;
    const sanitizedValue = newValue.trim();

    // 1. Load existing items
    let items = JSON.parse(localStorage.getItem(key) || '[]');

    // 2. Filter out the new value (to avoid duplicates)
    items = items.filter(item => item !== sanitizedValue);

    // 3. Add the new value to the front
    items.unshift(sanitizedValue);

    // 4. Limit the array length
    items = items.slice(0, MAX_RECENT_SEARCHES);

    // 5. Save back to localStorage
    localStorage.setItem(key, JSON.stringify(items));
    return items;
};

const loadRecentSearches = (key) => {
    return JSON.parse(localStorage.getItem(key) || '[]');
};

// New component to handle the recent search list display (from Section 2)
const RecentSearchDropdown = ({ items, onSelect }) => {
    if (items.length === 0) return null;

    return (
        <div className="recent-searches-dropdown">
            <p className='dropdown-title'>Recent Searches</p>
            <ul>
                {items.map((item, index) => (
                    <li 
                        key={index} 
                        onClick={() => onSelect(item)}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// --- Inside your Map component ---

// Define your colors in one place
const COLORS = {
    terminal: '#E53E3E', // RED for TODA Terminal
    all: '#0d7a49',
    point: '#0084ff',    // BLUE for Transfer Point
    dimmed: '#999999'   // Grey for non-active/dimmed
};

const getMarkerIcon = (point, activeFilter) => {
    let color = COLORS.dimmed;
    let opacity = 0.4;
    let scale = 8; // Default small scale
    let zIndex = 1; // Default z-index

    if (activeFilter === 'all') {
        // Show all markers in their main color
        color = COLORS.all; // Use point's type color
        opacity = 1.0;
        scale = (point.type === 'terminal') ? 10 : 8; // Make terminals bigger
        zIndex = 2;
    } else if (activeFilter === point.type) {
        // Show only the active marker type, make it bright and on top
        color = COLORS[point.type]; // e.g., COLORS['terminal']
        opacity = 1.0;
        scale = 10; // Make active markers bigger
        zIndex = 10; // Bring to front
    }

    return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: scale,
        fillColor: color,
        fillOpacity: opacity,
        strokeWeight: 1,
        strokeColor: 'white',
        zIndex: zIndex
    };
};


// --- UPDATED: Function now requires the list of all points ---
const getNearestPoint = (coords, pointList) => {
    let nearest = null;
    let minDistance = Infinity;

    if (!Array.isArray(pointList) || pointList.length === 0) {
        return { point: null, distance: Infinity };
    }

    for (const item of pointList) {
        // Ensure item has valid lat/lng. Handles both terminals (lat/lng)
        // and destinations (latitude/longitude)
        const pointLat = parseFloat(item.latitude || item.lat);
        const pointLng = parseFloat(item.longitude || item.lng);

        if (isNaN(pointLat) || isNaN(pointLng)) continue; // Skip invalid data

        // Using simple squared distance for speed (faster than Math.sqrt)
        const distance =
            Math.pow(coords.lat - pointLat, 2) +
            Math.pow(coords.lng - pointLng, 2);
        
        if (distance < minDistance) {
            minDistance = distance;
            nearest = item;
        }
    }
    
    // Return distance in the same "degree" units as the threshold
    return { point: nearest, distance: Math.sqrt(minDistance) }; 
};
// --- END OF NEW HELPER FUNCTION ---

// --- START of generateInstructionGroq function (MODIFIED for guaranteed clean output) ---
async function generateInstructionGroq(context) {

    const discountText = context.discountApplied 
        ? `A 20% PWD/Student/Senior discount was applied to the total base fare (Final Fare: ₱${context.fare}, Base Fare: ₱${context.baseFare}).` 
        : `Regular fare applied.`;

    // Reverting to simpler stepsBlock creation since the raw steps from processRoute are cleaner now.
    const stepsBlock = context.transfers.map((step, index) => `${index + 1}. ${step}`).join('\n');

    let finalSummary = '';
    if (context.walkability && context.transportMode === 'jeepney') {
        // Updated walkability tip to be more direct
        finalSummary = `\n\n💰 Money-Saving Tip: ${context.walkability.replace(/Your destination is only about/, 'Since your destination is only about').replace(/Your destination is/, 'If you prefer to walk, your destination is')} (This tip is only applicable if the final step mentions walking/alighting).`;
    } else if (context.transportMode === 'tricycle') {
        // Special tip for full tricycle
        finalSummary = `\n\nFriendly Tip: This is an estimated rate for a special trip based on distance and local norms. Always confirm the final fare with the driver before boarding.`;
    }

    // --- REFINED PERSONA AND INSTRUCTION ---
    const persona = context.transportMode === 'tricycle'
        ? "You are a friendly local commuter from Santa Maria, Bulacan. Your directions must reflect a single, direct, special-trip tricycle journey."
        : "You are a friendly local commuter from Santa Maria, Bulacan, specializing in the Norzagaray-Santa Maria Jeepney route. Your tone must be simple and conversational.";

    const requiredStepsInstruction = context.transportMode === 'tricycle'
        ? "Your sole task is to convert the raw travel steps into a clear, concise, and friendly single conversational instruction for the passenger, emphasizing that they are taking a special tricycle trip directly from their origin to their destination."
        : "Your sole task is to convert the following raw travel steps into a clear, concise, and friendly numbered list of directions for the passenger. Use simple, conversational English that is easy for a local commuter to follow. Use an appropriate emoji (like 🚌 or 🛵) at the start of each step";

    // --- *** KEY IMPROVEMENT *** ---
    // Updated fareContext to clearly state the *total* fare and what it includes.
    const fareContext = context.transportMode === 'tricycle'
        ? `Tricycle trip (Special Ride). Total Distance: ${context.distance} km. Estimated Fare: ₱${context.fare}. ${discountText}`
        : `Jeepney and Tricycle transfer. Total Distance: ${context.distance} km. Total Estimated Fare: ₱${context.fare}. ${discountText} This total includes the jeepney fare and estimated fares for any necessary tricycle transfers.`;

    const prompt = `
        ${persona}

        ${requiredStepsInstruction}

        ### Raw Travel Steps (CONVERT TO NUMBERED LIST/SINGLE INSTRUCTION):
        ${stepsBlock}
        (Origin: ${context.origin}, Destination: ${context.destination})

        ### Important Fare Information:
        - ${fareContext}
        - The main jeepney route is generally along: ${context.routeSummary}. (Only mention this in the final output if the trip involves a jeepney).

        Provide the numbered list of directions (or a single step for tricycle) first, followed by the "Friendly Tip" at the end. Use short, action-oriented sentences. DO NOT include the asterisk symbols in your final output.** Ensure the tone is very friendly and local.
        ${finalSummary}
    `;

    const GROQ_MODELS = [
        "mixtral-8x7b-32768",
        "gemma-7b-it",
        "llama-3.1-8b-instant"
    ];

    for (const model of GROQ_MODELS) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: "user", content: prompt }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`${model} failed with status ${response.status}:`, errorData);
                continue;
            }

            const data = await response.json();
            
            if (data.choices?.[0]?.message?.content) {
                let cleanedContent = data.choices[0].message.content.trim();
                
                // CRITICAL FIX: Strip all remaining asterisks from the output
                // This ensures clean HTML for React's dangerouslySetInnerHTML
                cleanedContent = cleanedContent.replace(/\*\*/g, '<b>').replace(/__g/g, '</b>'); // Try to interpret ** as <b>
                cleanedContent = cleanedContent.replace(/\*\*/g, '').replace(/\*/g, ''); // Final removal just in case.
                
                return cleanedContent;
            }

        } catch (err) {
            console.warn(`${model} failed:`, err.message);
        }
    }

    // Check if API key is missing or invalid
    if (!process.env.REACT_APP_GROQ_API_KEY) {
        throw new Error("⚠️ Groq API key is missing. Please add REACT_APP_GROQ_API_KEY to your .env file.");
    }

    throw new Error("⚠️ All Groq AI models failed. Please check your API key and internet connection.");
}


const R = 6371; // Radius of Earth in kilometers (for Haversine formula)

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

const FareCalculator = () => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [directionsResult, setDirectionsResult] = useState(null);
    const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
    const [distanceKm, setDistanceKm] = useState(0);
    const [fare, setFare] = useState(0);
    const [suggestion, setSuggestion] = useState('');
    const [transportMode, setTransportMode] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);
    const originRef = useRef(null);
    const destinationRef = useRef(null);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [allowManualInput, setAllowManualInput] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [discountType, setDiscountType] = useState('none');
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const togglePanel = () => setIsPanelOpen(prev => !prev);
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const [showTutorial, setShowTutorial] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);

    // NEW STATES FOR COMPARISON & FILTER
    const [shortestRouteIndex, setShortestRouteIndex] = useState(0); 
    const [cheapestFareRouteIndex, setCheapestFareRouteIndex] = useState(0); 
    const [routeComparisons, setRouteComparisons] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'point', 'terminal'

    //new state for recent searches
    const [recentOrigins, setRecentOrigins] = useState(loadRecentSearches('recentOrigins'));
    const [recentDestinations, setRecentDestinations] = useState(loadRecentSearches('recentDestinations'));
    const [showRecentOrigins, setShowRecentOrigins] = useState(false);
    const [showRecentDestinations, setShowRecentDestinations] = useState(false);
    
    const [isMobileCollapsed, setIsMobileCollapsed] = useState(true);

    const [showNotif, setShowNotif] = useState(false);
    const [notifMessage, setNotifMessage] = useState('');
    const [notifType, setNotifType] = useState('info');

    const [jeepneyFareTable, setJeepneyFareTable] = useState([]);
    const [tricycleFareTable, setTricycleFareTable] = useState([]);
    const [isLoadingFares, setIsLoadingFares] = useState(true);

    // --- NEW STATE for fetched terminals ---
    const [dbTerminals, setDbTerminals] = useState([]);

    // --- NEW STATE for fetched transfer points ---
    const [dbTransferPoints, setDbTransferPoints] = useState([]);

    // --- NEW STATE: This state will now hold ALL routes from the DB ---
    const [allDbRoutes, setAllDbRoutes] = useState([]); 


    // --- *** NEW HELPER FUNCTION 1 *** ---
    // Calculates distance between two lat/lng points using Haversine formula
    const haversineDistance = (coords1, coords2) => {
        const lat1 = coords1.lat || coords1.latitude;
        const lng1 = coords1.lng || coords1.longitude;
        const lat2 = coords2.lat || coords2.latitude;
        const lng2 = coords2.lng || coords2.longitude;

        if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
            return 0;
        }

        const toRad = (x) => (x * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lng2 - lng1);
        
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distance in km
    };

    // --- *** NEW HELPER FUNCTION 2 *** ---
    // Centralized logic for "Special Trip" tricycle fare
    const calculateTricycleSpecialTripFare = (distance, discountType) => {
        // Base fare: ₱40 for first 1km, ₱8 for each additional km
        const baseFare = 40 + Math.max(0, (distance - 1) * 8); 
        const discountApplied = discountType !== 'none';
        const finalFare = discountApplied ? baseFare * 0.80 : baseFare;
        
        return {
            baseFare: baseFare,
            finalFare: finalFare,
            discountApplied: discountApplied
        };
    };

    // --- UPDATED: Combine DB terminals and DB transfer points ---
    const allTransferPoints = useMemo(() => {
        // Map DB terminals to the format your map expects
        const formattedDbTerminals = dbTerminals.map(terminal => ({
            id: terminal.id,
            name: terminal.name,
            lat: parseFloat(terminal.latitude),  // Ensure it's a number
            lng: parseFloat(terminal.longitude), // Ensure it's a number
            type: 'terminal' // Assign the type 'terminal'
        }));

        // Map DB transfer points to the format
        const formattedDbTransferPoints = dbTransferPoints.map(point => ({
            id: point.id,
            name: point.name,
            lat: parseFloat(point.latitude),
            lng: parseFloat(point.longitude),
            type: point.type || 'point' // Default to 'point'
        }));
        
        // Return the combined array
        return [
            ...formattedDbTransferPoints, // <-- Use dynamic points
            ...formattedDbTerminals
        ];
    }, [dbTerminals, dbTransferPoints]); // <-- UPDATED dependencies


    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenTutorial');
        if (hasSeen === 'true') {
            setShowTutorial(false);
        }

        // Fetch fare data when component mounts
        const fetchFareData = async () => {
          setIsLoadingFares(true);
          try {
            // Fetch LTFRB (Jeepney) data
            const jeepRes = await fetch(`${API_URL}/fares/LTFRB`);
            if (jeepRes.ok) {
              const jeepData = await jeepRes.json();
              setJeepneyFareTable(jeepData.data || []); // Store just the data array
            } else {
              console.error("Failed to fetch Jeepney fares");
            }

            // Fetch LGU (Tricycle) data
            const trikeRes = await fetch(`${API_URL}/fares/LGU`);
            if (trikeRes.ok) {
              const trikeData = await trikeRes.json();
              setTricycleFareTable(trikeData.data || []); // Store just the data array
            } else {
              console.error("Failed to fetch Tricycle fares");
            }

          } catch (error) {
            console.error("Error fetching fare data:", error);
            showNotification('error', 'Could not load fare data from server. Using fallback calculations.');
          } finally {
            setIsLoadingFares(false);
          }
        };

        // --- UPDATED: Fetch terminal data ---
        const fetchTerminalData = async () => {
          try {
            const res = await fetch(`${API_URL}/terminals`);
            if (res.ok) {
              const data = await res.json();
              setDbTerminals(data);
            } else {
              console.error("Failed to fetch terminals");
              showNotification('error', 'Could not load terminal locations from server.');
            }
          } catch (error) {
            console.error("Error fetching terminals:", error);
            showNotification('error', 'Could not load terminal locations from server.');
          }
        };


        // --- NEW: Fetch transfer point data ---
        const fetchTransferPointData = async () => {
          try {
            const res = await fetch(`${API_URL}/transfer-points`);
            if (res.ok) {
              const data = await res.json();
              setDbTransferPoints(data);
            } else {
              console.error("Failed to fetch transfer points");
              showNotification('error', 'Could not load transfer points from server.');
            }
          } catch (error) {
            console.error("Error fetching transfer points:", error);
            showNotification('error', 'Could not load transfer points from server.');
          }
        };

        // --- MODIFIED: This function now fetches ALL route paths ---
        const fetchAllRoutePaths = async () => {
            try {
                // Use the new endpoint you created!
                const res = await fetch(`${API_URL}/routes/all-paths`); 
                if (res.ok) {
                    const data = await res.json();
                    setAllDbRoutes(Array.isArray(data) ? data : []); // <-- Store all routes, ensure it's an array
                } else {
                    console.error("Failed to fetch all route paths");
                    setAllDbRoutes([]); // Set to empty array on error
                    showNotification('error', 'Could not load official route paths from server.');
                }
            } catch (error) {
                console.error("Error fetching route paths:", error);
                setAllDbRoutes([]); // Set to empty array on error
                showNotification('error', 'Could not load official route paths from server.');
            }
        };


        fetchFareData();
        fetchTerminalData(); // <-- Call the terminal function
        fetchTransferPointData(); // <-- Call the new transfer point function
        // --- MODIFIED: Call the new function ---
        fetchAllRoutePaths();
    }, []); // Empty array ensures this runs only once on mount

    // Helper function to trigger the notification
    const showNotification = (type, message) => {
        setNotifType(type);
        setNotifMessage(message);
        setShowNotif(true);
    };

    // Add toggle handler
    const handleMobileToggle = () => {
        setIsMobileCollapsed(prevState => !prevState);
    };

    // This will be called whenever the user clicks an input.
    const handleInputFocus = () => {
        setIsMobileCollapsed(false); // false = expanded
    };


    const tutorialSteps = [
        {
            title: "Welcome to Budget Biyahe!",
            text: "Let's quickly guide you through the main features of our transparent fare calculator.",
            elementId: 'intro',
        },
        {
            title: "1. Origin Input",
            text: "Start by typing your current location here. You can use your GPS (if enabled) or manually enter an address.",
            elementId: 'origin',
        },
        {
            title: "2. Destination Input",
            text: "Next, enter your desired drop-off destination in this field.",
            elementId: 'destination',
        },
        {
            title: "3. Select Discounts",
            text: "Apply your Student, Senior, or PWD discount here. A 20% fare reduction will be applied.",
            elementId: 'discount',
        },
        {
            title: "4. Calculate Fare",
            text: "Click this button to instantly see the suggested route, distance, and estimated fare.",
            elementId: 'calculate-btn',
        },
        {
            title: "5. All Set!",
            text: "You can now start planning your trip! This information panel can be collapsed anytime by clicking the green button to the left.",
            elementId: 'final-step',
        }
    ];

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSkip();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        setShowTutorial(false);
        localStorage.setItem('hasSeenTutorial', 'true');
    };

    useEffect(() => {
        const hasSeen = localStorage.getItem('hasSeenTutorial');
        if (hasSeen === 'true') {
            setShowTutorial(false);
        }
    }, []);


    const fillCurrentLocationAsOrigin = () => {
        if (!navigator.geolocation) {
            showNotification('error', 'Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        setShowLocationModal(false);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                const tryGeocode = (attempt = 1) => {
                    if (!window.google?.maps?.Geocoder) {
                        if (attempt < 3) {
                            setTimeout(() => tryGeocode(attempt + 1), 500);
                            return;
                        }
                        showNotification('error', 'Geocoder unavailable. Please check your internet connection.');
                        setIsLocating(false);
                        return;
                    }

                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                        setIsLocating(false);
                        if (status === "OK" && results?.length) {
                            const address = results[0].formatted_address;
                            document.getElementById("origin").value = address;
                            setOrigin(address);
                            setAllowManualInput(true);
                        } else {
                            showNotification('error', "Couldn't convert location to address. Try again or check internet connection.");
                        }
                    });
                };

                tryGeocode();
            },
            (error) => {
                setIsLocating(false);
                
                // --- NEW: More descriptive error handling ---
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        showNotification('error', 'Location permission denied. Please allow access in your browser and system settings.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        showNotification('error', 'Location information is currently unavailable. Please try again.');
                        break;
                    case error.TIMEOUT:
                        showNotification('info', 'Could not get an accurate location in time. Please try again, or move to an area with a clearer view of the sky.');
                        break;
                    default:
                        showNotification('error', 'An unknown error occurred while trying to get your location.');
                        break;
                }
            },
            // This is your (correct) options object
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
        );
    };


    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Make sure this key is secured
        libraries
    });

    useEffect(() => {
        if (isLoaded && originRef.current)
        {
            const autocompleteOrigin = new window.google.maps.places.Autocomplete(originRef.current, {
                fields: ["place_id", "formatted_address", "geometry", "name"],
            });

            autocompleteOrigin.addListener("place_changed", () => {
                const place = autocompleteOrigin.getPlace();
                setOrigin(place.formatted_address || place.name);
            });
        }

        if (isLoaded && destinationRef.current)
        {
            const autocompleteDestination = new window.google.maps.places.Autocomplete(destinationRef.current, {
                fields: ["place_id", "formatted_address", "geometry", "name"],
            });

            autocompleteDestination.addListener("place_changed", () => {
                const place = autocompleteDestination.getPlace();
                setDestination(place.formatted_address || place.name);
            });
        }
    }, [isLoaded]);


    // --- MODIFIED: This function now checks against ALL Jeepney routes ---
    const isNearAnyJeepneyRoute = (point) => {
        if (!Array.isArray(allDbRoutes) || allDbRoutes.length === 0) {
            return false; // If paths aren't loaded, nothing is "near".
        }
        
        const threshold = 0.003; // ~300 meters

        // Iterate over ALL fetched routes
        for (const route of allDbRoutes) {
            // Only check against JEEPNEY routes (type 1)
            // We assume 1 is Jeepney, 2 is Tricycle
            if (route.transport_type_id !== 1) { 
                continue; // Skip tricycle routes
            }

            // Check if the point is near any point in this specific jeepney route's path
            const isNearThisRoute = route.points.some(routePoint => {
                const distance = Math.sqrt(
                    Math.pow(point.lat - routePoint.lat, 2) +
                    Math.pow(point.lng - routePoint.lng, 2)
                );
                return distance <= threshold;
            });

            if (isNearThisRoute) {
                return true; // Found a match, no need to check other routes
            }
        }
        
        return false; // Checked all jeepney routes, no match found
    };


    const extractStepPathPoints = (route) => {
        const steps = route.legs[0].steps;
        const allPoints = [];

        for (const step of steps) {
            const stepPath = step.path;
            if (stepPath && stepPath.length > 0) {
                stepPath.forEach(p => allPoints.push({ lat: p.lat(), lng: p.lng() }));
            }
        }

        return allPoints;
    };

// --- *** MAJOR REFACTOR: processRoute *** ---
const processRoute = useCallback(async (route, index) => {
        const distanceText = route.legs[0].distance.text;
        const distanceValue = parseFloat(distanceText.replace(/[^0-9.]/g, ''));
        
        if (distanceValue > 20) {
            return {
                fare: 'N/A',
                distance: distanceValue.toFixed(2),
                baseFare: 'N/A',
                transportMode: 'LONG DISTANCE TRIP DETECTED! Route outside Santa Maria Bulacan is not covered by Budget Byahe.',
                isJeepneyRoute: false,
                discountApplied: false,
                routeIndex: index
            };
        }

        const routeSummary = route.summary || "the main public road";
        const routePoints = extractStepPathPoints(route);
        const destinationCoords = {
            lat: route.legs[0].end_location.lat(),
            lng: route.legs[0].end_location.lng(),
        };
        const originCoords = {
            lat: route.legs[0].start_location.lat(),
            lng: route.legs[0].start_location.lng(),
        };

        const passesJeepneyRoute = routePoints.some((point) => isNearAnyJeepneyRoute(point));
        
        let transportModeText, transfers, walkabilityInfo;
        let totalBaseFare = 0;
        let totalFinalFare = 0;
        let anyDiscountApplied = false;

        // --- Check if the route *never* comes near the jeepney path ---
        if (!passesJeepneyRoute) {
            
            // --- TRICYCLE ONLY LOGIC (Fixed Route or Special Trip) ---
            transportModeText = 'tricycle';
            walkabilityInfo = '';
            let foundFixedFare = false;
            
            const proximityThreshold = 0.003; // 300m threshold
            const zoneThreshold = 0.01; // ~1km zone for matching a fixed fare

            const terminals = allTransferPoints.filter(p => p.type === 'terminal');
            const nearestToda = getNearestPoint(originCoords, terminals);

            if (nearestToda.point && nearestToda.distance < proximityThreshold) {
                // Origin is near a TODA. Check its destinations.
                const todaName = nearestToda.point.association_name; 
                const destinationsForThisToda = tricycleFareTable.filter(d => d.place === todaName);

                if (destinationsForThisToda.length > 0) {
                    const nearestDestination = getNearestPoint(destinationCoords, destinationsForThisToda);
                    
                    // --- MODIFIED LOGIC ---
                    // If the user's destination is within a 1km "zone" of the closest
                    // recorded destination for this TODA, use that fixed fare.
                    if (nearestDestination.point && nearestDestination.distance < zoneThreshold) { 
                        // --- MATCH FOUND! (Fixed Route) ---
                        foundFixedFare = true;
                        totalBaseFare = parseFloat(nearestDestination.point.fare);
                        
                        totalFinalFare = totalBaseFare;
                        if (discountType !== 'none') {
                            totalFinalFare = totalBaseFare * 0.80; 
                            anyDiscountApplied = true;
                        }

                        const calculatedFare = totalFinalFare.toFixed(2);
                        const baseFareFormatted = totalBaseFare.toFixed(2);
                        
                        transfers = [
                            `Go to ${nearestToda.point.name}.`,
                            `Take a tricycle to ${nearestDestination.point.location}. (Fixed Fare: ₱${calculatedFare})`
                        ];

                        try {
                            const aiSuggestion = await generateInstructionGroq({
                                transportMode: 'tricycle', 
                                distance: distanceValue.toFixed(2),
                                baseFare: baseFareFormatted,
                                fare: calculatedFare,
                                discountApplied: anyDiscountApplied,
                                transfers, 
                                walkability: `This is a fixed route from ${todaName}.`, 
                                routeSummary: 'local streets', 
                                origin: origin,
                                destination: destination,
                            });
                            transportModeText = `✅ TRICYCLE RIDE (Fixed Route). This trip matches a known route from the ${todaName} terminal.<br/><br/>${aiSuggestion}`;
                        } catch (error) {
                             transportModeText = `✅ TRICYCLE RIDE (Fixed Route)<br/><br/>1. Go to ${nearestToda.point.name}.<br/>2. Take a tricycle to ${nearestDestination.point.location}.<br/><br/><b>Fare: ₱${calculatedFare}</b>`;
                        }

                        return {
                            fare: calculatedFare,
                            distance: distanceValue.toFixed(2),
                            baseFare: baseFareFormatted,
                            transportMode: transportModeText,
                            isJeepneyRoute: false,
                            discountApplied: anyDiscountApplied,
                            routeIndex: index
                        };
                    }
                }
            }

            // --- FALLBACK TO SPECIAL TRIP (Tricycle Only) ---
            if (!foundFixedFare) {
                // Use the new helper function
                const { baseFare, finalFare, discountApplied } = calculateTricycleSpecialTripFare(distanceValue, discountType);

                totalBaseFare = baseFare;
                totalFinalFare = finalFare;
                anyDiscountApplied = discountApplied;

                const calculatedFare = totalFinalFare.toFixed(2);
                const baseFareFormatted = totalBaseFare.toFixed(2);
                
                transfers = [`Take a tricycle (Special Trip) directly from your origin to your destination. (Estimated Fare: ₱${calculatedFare})`];

                try {
                    const aiSuggestion = await generateInstructionGroq({
                        transportMode: 'tricycle', 
                        distance: distanceValue.toFixed(2),
                        baseFare: baseFareFormatted,
                        fare: calculatedFare,
                        discountApplied: anyDiscountApplied,
                        transfers, 
                        walkability: walkabilityInfo, 
                        routeSummary: 'local streets', 
                        origin: origin,
                        destination: destination,
                    });

                    transportModeText = `⚠️ TRICYCLE RIDE (Special Trip). This trip does not match a fixed route and requires a special ride. The fare is an (estimate) based on distance.<br/><br/>${aiSuggestion}`;
                } catch (error) {
                    console.error('AI generation failed for tricycle route:', error);
                    transportModeText = `⚠️ TRICYCLE RIDE (Special Trip)<br/><br/>Take a tricycle directly from ${origin} to ${destination}. The estimated fare is ₱${calculatedFare} (rates can be negotiated).`;
                }
                
                return {
                    fare: calculatedFare,
                    distance: distanceValue.toFixed(2),
                    baseFare: baseFareFormatted,
                    transportMode: transportModeText,
                    isJeepneyRoute: false,
                    discountApplied: anyDiscountApplied,
                    routeIndex: index
                };
            }

        } else {
            // --- JEEPNEY + COMBINED ROUTE LOGIC ---
            transfers = [];
            walkabilityInfo = '';
            
            // --- 1. Calculate Jeepney Leg Fare ---
            let jeepneyBaseFare = 0;
            let jeepneyFinalFare = 0;
            let jeepneyDiscountApplied = false;
            let foundFare = false;
            let fareRow = null;
            
            if (jeepneyFareTable.length > 0) {
                const roundedDistance = Math.ceil(distanceValue); 
                const matchingFares = jeepneyFareTable.filter(f => f.distance_km <= roundedDistance);
                if (matchingFares.length > 0) {
                    fareRow = matchingFares.reduce((prev, current) => 
                        (prev.distance_km > current.distance_km) ? prev : current
                    );
                 }
                if (fareRow) {
                    jeepneyBaseFare = parseFloat(fareRow.regular_fare);
                    jeepneyFinalFare = jeepneyBaseFare;
                    if (discountType !== 'none') {
                        jeepneyFinalFare = parseFloat(fareRow.discounted_fare);
                        jeepneyDiscountApplied = true;
                    }
                    foundFare = true;
                }
            }
            if (!foundFare) { // Fallback calculation
                if (!isLoadingFares) console.warn(`No fare data for ${distanceValue}km. Using fallback.`);
                jeepneyBaseFare = Math.max(12, distanceValue * 2); // Old formula
                jeepneyFinalFare = jeepneyBaseFare;
                if (discountType !== 'none') {
                    jeepneyFinalFare = jeepneyBaseFare * 0.80; 
                    jeepneyDiscountApplied = true;
                }
            }

            totalBaseFare += jeepneyBaseFare;
            totalFinalFare += jeepneyFinalFare;
            if (jeepneyDiscountApplied) anyDiscountApplied = true;


            // --- 2. Check for Tricycle Leg 1 (Origin to Jeep Stop) ---
            const originOnRoute = isNearAnyJeepneyRoute(originCoords);
            const entryPoint = routePoints.find((p) => isNearAnyJeepneyRoute(p));

            if (entryPoint && !originOnRoute) {
                const pickup = getNearestPoint(entryPoint, allTransferPoints).point;
                // Use Haversine to get distance for this tricycle leg
                const trikeDist1 = haversineDistance(originCoords, pickup);
                
                // Use helper to get fare
                const { baseFare, finalFare } = calculateTricycleSpecialTripFare(trikeDist1, discountType);

                totalBaseFare += baseFare;
                totalFinalFare += finalFare;
                
                // Add transfer step with itemized fare
                transfers.push(`Take a tricycle to the jeepney stop at ${pickup.name} (Est. Fare: ₱${finalFare.toFixed(2)})`);
            }

            // --- 3. Add Jeepney Leg ---
            const jeepneyStep = `Ride a jeepney along ${routeSummary} (Fare: ₱${jeepneyFinalFare.toFixed(2)})`;
            transfers.push(jeepneyStep);


            // --- 4. Check for Tricycle Leg 2 (Jeep Stop to Destination) ---
            const destinationOnRoute = isNearAnyJeepneyRoute(destinationCoords);

            if (!destinationOnRoute) {
                
                // --- NEW LOGIC to find the BEST dropoff point ---
                // 1. Filter all available transfer points to find only those on/near a jeepney route
                const jeepneyTransferPoints = allTransferPoints.filter(p => isNearAnyJeepneyRoute(p));

                let dropoff = null;

                if (jeepneyTransferPoints.length > 0) {
                    // 2. From that filtered list, find the one closest to the user's FINAL destination
                    dropoff = getNearestPoint(destinationCoords, jeepneyTransferPoints).point;
                } else {
                    // FALLBACK: If no official transfer points are on the jeepney route (unlikely)
                    // Revert to the old logic: find the Google "exit point" and get the nearest transfer point to THAT.
                    const exitPoint = [...routePoints].reverse().find((p) => isNearAnyJeepneyRoute(p));
                    if (exitPoint) {
                        dropoff = getNearestPoint(exitPoint, allTransferPoints).point;
                    }
                }
                
                // If we found a dropoff point, calculate the final leg
                if (dropoff) {
                    // This calculates distance from the new, smarter 'dropoff' point
                    const straightLineDistanceKm = haversineDistance(dropoff, destinationCoords);
                    const walkabilityThresholdKm = 0.5; // 500 meters

                    // Check if it's walkable (500m or less)
                    if (straightLineDistanceKm <= walkabilityThresholdKm) {
                        const distanceMeters = Math.round(straightLineDistanceKm * 1000);
                        walkabilityInfo = `Your destination is only about ${distanceMeters} meters from ${dropoff.name}. You can comfortably walk the final leg of the trip.`;
                        transfers.push(`Get off at ${dropoff.name} and proceed on foot to your final destination.`);
                    } else {
                        // Otherwise, suggest a tricycle ride
                        walkabilityInfo = `Your destination is ${straightLineDistanceKm.toFixed(2)} km from ${dropoff.name}. A tricycle ride is highly recommended for this distance.`;
                        const { baseFare, finalFare } = calculateTricycleSpecialTripFare(straightLineDistanceKm, discountType);
                        totalBaseFare += baseFare;
                        totalFinalFare += finalFare;
                        transfers.push(`Get off at ${dropoff.name} and take a tricycle to your destination (Est. Fare: OS${finalFare.toFixed(2)})`);
                    }
                }
                // --- END OF UPDATED LOGIC ---

            } else if (originOnRoute && destinationOnRoute) {
                walkabilityInfo = "Your entire trip is on the main jeepney route. No transfers needed.";
            }
            
            // --- 5. Finalize and call AI ---
            setIsAiProcessing(true);
            const calculatedFare = totalFinalFare.toFixed(2);
            const baseFareFormatted = totalBaseFare.toFixed(2);

            try {
                const aiSuggestion = await generateInstructionGroq({
                    transportMode: 'jeepney', 
                    originOnRoute,
                    destinationOnRoute,
                    distance: distanceValue.toFixed(2),
                    baseFare: baseFareFormatted, // <-- Pass TOTAL base fare
                    fare: calculatedFare,       // <-- Pass TOTAL final fare
                    discountApplied: anyDiscountApplied,
                    transfers, // <-- Now contains itemized fares
                    walkability: walkabilityInfo,
                    routeSummary: routeSummary,
                    origin: origin,
                    destination: destination,
                });

                transportModeText = aiSuggestion.replace(/\n/g, '<br/>');
            } catch (error) {
                console.error('AI generation failed for jeepney route:', error);
                // Fallback text now shows the TOTAL fare
                let fallbackText = '<b>Route Instructions:</b><br/><br/>';
                transfers.forEach((step, idx) => {
                    fallbackText += `${idx + 1}. ${step}<br/>`;
                });
                if (walkabilityInfo) {
                    fallbackText += `<br/>${walkabilityInfo}`;
                }
                fallbackText += `<br/><br/><b>Total Estimated Fare:</b> ₱${calculatedFare} (Distance: ${distanceValue.toFixed(2)} km)`;
                transportModeText = fallbackText;
            }

            return {
                fare: calculatedFare, // <-- Return TOTAL final fare
                distance: distanceValue.toFixed(2),
                baseFare: baseFareFormatted, // <-- Return TOTAL base fare
                transportMode: transportModeText,
                isJeepneyRoute: true,
                discountApplied: anyDiscountApplied,
                routeIndex: index
            };
        }
    }, [discountType, origin, destination, jeepneyFareTable, isLoadingFares, tricycleFareTable, setIsAiProcessing, allTransferPoints, allDbRoutes]);

    const clearInput = () => {
        if(originRef.current)
        {
            originRef.current.value = '';
        }
        if(destinationRef.current)
        {
            destinationRef.current.value = '';
        }

        setOrigin('');
        setDestination('');
        setDirectionsResult('');
        setDistanceKm(0);
        setFare(0);
        setSuggestion('');
        setTransportMode('');
        setSelectedRouteIndex(0);
        setAllowManualInput(false);
        setDiscountType('none');
        setRouteComparisons([]); // Clear comparison state
        setShortestRouteIndex(0);
        setCheapestFareRouteIndex(0);
        setActiveFilter('all'); // Reset filter
    }


    const calculateRoute = () => {
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');

        const originVal = originInput.value.trim();
        const destinationVal = destinationInput.value.trim();

        // NEW: Check if fares are still loading
        if (isLoadingFares) {
            showNotification('info', 'Please wait, fare data is still loading...');
            return;
        }

        if (!originVal || !destinationVal) {
           showNotification('info', 'Please enter both origin and destination.');
            return;
        }

        // Reset states before calculation
        setIsCalculating(true);
        setDirectionsResult(null);
        setDistanceKm(0);
        setFare(0);
        setSuggestion('');
        setTransportMode('');
        setSelectedRouteIndex(0);
        setRouteComparisons([]); // Reset comparison
        setShortestRouteIndex(0);
        setCheapestFareRouteIndex(0);

        setOrigin(originVal);
        setDestination(destinationVal);


        const directionsService = new window.google.maps.DirectionsService();

        directionsService.route({
            origin: originVal,
            destination: destinationVal,
            travelMode: window.google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: true,
            avoidFerries: true,
            avoidTolls: false,
            optimizeWaypoints: false,
        }, async (result, status) => {
            setIsCalculating(false);

            if (status === window.google.maps.DirectionsStatus.OK) {

                // 💾 NEW: Update Recent Searches on successful calculation
                setRecentOrigins(updateRecentSearches('recentOrigins', originVal));
                setRecentDestinations(updateRecentSearches('recentDestinations', destinationVal));

                // Combine all routes, sort by distance, and process
                const allRoutes = result.routes;
                
                // Process all routes to get fares and distance info
                setIsAiProcessing(true);
                try {
                    const processedResults = await Promise.all(
                        allRoutes.map((route, index) => processRoute(route, index))
                    );
                    setIsAiProcessing(false);

                    setRouteComparisons(processedResults);

                    // --- Determine Shortest (Most Efficient) Route ---
                    let shortestRoute = processedResults[0];
                    for (const res of processedResults) {
                        if (parseFloat(res.distance) < parseFloat(shortestRoute.distance)) {
                            shortestRoute = res;
                        }
                    }
                    setShortestRouteIndex(shortestRoute.routeIndex);
                    
                    // --- Determine Cheapest Route ---
                    // Only consider routes with valid numeric fares (not N/A)
                    const viableRoutes = processedResults.filter(res => res.fare !== 'N/A' && parseFloat(res.fare) > 0);
                    
                    let cheapestRoute = viableRoutes.length > 0 ? viableRoutes[0] : shortestRoute; // Default to shortest if none are viable
                    for (const res of viableRoutes) {
                        if (parseFloat(res.fare) < parseFloat(cheapestRoute.fare)) {
                            cheapestRoute = res;
                        }
                    }
                    setCheapestFareRouteIndex(cheapestRoute.routeIndex);


                    // Update DirectionsResult with all routes for rendering
                    setDirectionsResult(result);
                    
                    // Default the map and text to the CHEAPEST route
                    setSelectedRouteIndex(cheapestRoute.routeIndex);
                    setDistanceKm(cheapestRoute.distance);
                    setFare(cheapestRoute.fare);
                    setTransportMode(cheapestRoute.transportMode);
                } catch (error) {
                    setIsAiProcessing(false);
                    console.error('Error processing routes with AI:', error);
                    showNotification('error', 'AI processing failed. Please check your Groq API key in the .env file.');
                }


            } else {
                showNotification('error', 'Could not find route. Please check your locations and try again.');
            }
        });
    };

    // Only trigger when selectedRouteIndex changes (for map and single display)
    useEffect(() => {
        if (directionsResult?.routes?.length > 0 && routeComparisons.length > selectedRouteIndex) {
            const selectedResult = routeComparisons[selectedRouteIndex];
            
            // Update the single display states for the currently selected route
            setDistanceKm(selectedResult.distance);
            setFare(selectedResult.fare);
            setTransportMode(selectedResult.transportMode);
        }
    }, [selectedRouteIndex, directionsResult, routeComparisons]);

    const switchLocation = () => {
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');

        const temp = originInput.value;
        originInput.value = destinationInput.value;
        destinationInput.value = temp;

        setOrigin(originInput.value);
        setDestination(destinationInput.value);

        // Calculate route immediately after switching
        setTimeout(() => {
            calculateRoute();
        }, 100); // Small delay to ensure DOM updates
    };

    const createChatBubbleMarker = (text, color = '#FF0000', textColor = 'white') => {
        const svg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="60" viewBox="0 0 50 60">
            <ellipse cx="27" cy="57" rx="12" ry="2" fill="rgba(0,0,0,0.2)"/>
            <rect x="5" y="5" width="40" height="30" rx="15" ry="15" 
                  fill="${color}" stroke="white" stroke-width="2"/>
            <polygon points="20,35 25,45 30,35" fill="${color}" stroke="white" stroke-width="1"/>
            <text x="25" y="25" text-anchor="middle" 
                  fill="${textColor}" font-family="Arial, sans-serif" 
                  font-size="12" font-weight="bold">${text}</text>
          </svg>
        `;

        return {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
            scaledSize: new window.google.maps.Size(50, 60),
            anchor: new window.google.maps.Point(25, 45) // Point where the tail touches the ground
        };
    };

    // NEW FUNCTION: Component to display the two comparison sections
    const RouteComparisonDisplay = ({ shortestIndex, cheapestIndex, comparisons }) => {
        if (!comparisons || comparisons.length === 0) return null;

        const shortest = comparisons[shortestIndex];
        const cheapest = comparisons[cheapestIndex];
        
        const isSameRoute = shortestIndex === cheapestIndex;

        return (
            <div className="route-comparison-sections">
                {/* 1. MOST EFFICIENT SECTION (Shortest Distance) */}
                <div className="comparison-section efficient-route">
                    <h4><FaGasPump /> Most Efficient Route</h4>
                    <p className='section-subtext'>Shortest distance, generally the fastest trip.</p>
                    <div className="route-summary-box" onClick={() => setSelectedRouteIndex(shortestIndex)}>
                        <div className="route-title">
                            Route {shortestIndex + 1}
                            {isSameRoute && <span className="tag primary">BEST VALUE</span>}
                            {!isSameRoute && selectedRouteIndex === shortestIndex && <span className="tag selected">SELECTED</span>}
                        </div>
                        <div className="route-metrics">
                            <span className="metric-distance">{shortest.distance} km</span>
                            <span className="metric-fare">₱{shortest.fare}</span>
                        </div>
                        <button 
                            className='select-route-btn'
                            onClick={(e) => { e.stopPropagation(); setSelectedRouteIndex(shortestIndex); }}
                            disabled={selectedRouteIndex === shortestIndex}
                        >
                            {selectedRouteIndex === shortestIndex ? 'Currently Viewing' : 'View on Map'}
                        </button>
                    </div>
                </div>

                <div className='comparison-divider'></div>
                
                {/* 2. CHEAPEST FARE SECTION */}
                {!isSameRoute && (
                    <div className="comparison-section cheapest-route">
                        <h4><FaMoneyBillWave /> Cheapest Fare Route</h4>
                        <p className='section-subtext'>Lowest estimated fare for the trip.</p>
                        <div className="route-summary-box" onClick={() => setSelectedRouteIndex(cheapestIndex)}>
                            <div className="route-title">
                                Route {cheapestIndex + 1}
                                {selectedRouteIndex === cheapestIndex && <span className="tag selected">SELECTED</span>}
                            </div>
                            <div className="route-metrics">
                                <span className="metric-distance">{cheapest.distance} km</span>
                                <span className="metric-fare">₱{cheapest.fare}</span>
                            </div>
                            <button 
                                className='select-route-btn'
                                onClick={(e) => { e.stopPropagation(); setSelectedRouteIndex(cheapestIndex); }}
                                disabled={selectedRouteIndex === cheapestIndex}
                            >
                                {selectedRouteIndex === cheapestIndex ? 'Viewing' : 'View on Map'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- UPDATED: Function now uses allTransferPoints ---
    const getFilteredTransferPoints = useCallback(() => {
        if (activeFilter === 'all') {
            return allTransferPoints;
        }
        return allTransferPoints.filter(point => {
            if (activeFilter === 'terminal') {
                return point.type === 'terminal';
            }
            if (activeFilter === 'point') {
                return point.type === 'point';
            }
            return false;
        });
    }, [activeFilter, allTransferPoints]); // <-- UPDATED dependency array


    return isLoaded ? (
        <div className="map-wrapper">
            {/* --- NEW MAP FILTER UI BLOCK --- */}
            <div className="map-filters-bar">
                <button 
                    className={`filter-btn all btn ${activeFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('all')}
                >
                    <IoLocationSharp size={20} />
                    All Points
                </button>
                <button 
                    className={`filter-btn transfer btn ${activeFilter === 'point' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('point')}
                >
                    <MdOutlineDirectionsBus size={20} />
                    Transfer Points
                </button>
                <button 
                    className={`filter-btn terminal btn ${activeFilter === 'terminal' ? 'active' : ''}`}
                    onClick={() => setActiveFilter('terminal')}
                >
                    <RiEBike2Line size={20} />
                    TODA Terminal
                </button>
            </div>


            <div className={`fare-container ${isPanelOpen ? '' : 'closed'} ${isMobileCollapsed ? 'collapsed' : ''}`}>
                <div className="mobile-toggle-handle" onClick={handleMobileToggle}>
                    {/* The icon span is here, but the handle itself is the clickable area */}
                </div>
                {/* Collapse/Expand Toggle Button */}
                <div className="panel-toggle" onClick={togglePanel}>
                    <FaArrowLeft size={20} className="toggle-icon close-icon" />
                    <FaArrowRight size={20} className="toggle-icon open-icon" />
                </div>

                <div className="fare-content" id='intro'>
                    <h2>Transport Fare Calculator & Navigator</h2>
                    <p className='fare-description'>Enter your starting point and destination to instantly calculate the estimated fare for your commute.</p>
                    <div className="input-group">
                        <div className="input-pair">
                            {/* 🌟 NEW: ORIGIN INPUT CONTAINER with Dropdown */}
                            <div className="input-container" id="recent-origin-container">
                                <div className="input-with-icon">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <input
                                        type="text"
                                        placeholder="Enter Origin"
                                        ref={originRef}
                                        id='origin'
                                        onFocus={() => {
                                            // === ADD THIS LINE ===
                                            handleInputFocus(); // This expands the panel

                                            // Your existing logic:
                                            if(!allowManualInput) setShowLocationModal(true);
                                            setShowRecentOrigins(true); 
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => setShowRecentOrigins(false), 200);
                                        }}
                                    />
                                </div>
                                {/* Conditional rendering based on showRecentOrigins state */}
                                {(recentOrigins.length > 0 && showRecentOrigins) && (
                                    <RecentSearchDropdown 
                                        items={recentOrigins}
                                        onSelect={(val) => {
                                            originRef.current.value = val;
                                            setOrigin(val); 
                                            setAllowManualInput(true);
                                            setShowRecentOrigins(false); // Hide immediately after selection
                                            originRef.current.focus(); // Keep focus on input for immediate action
                                        }}
                                    />
                                )}
                            </div>
                            
                            {/* 🌟 NEW: DESTINATION INPUT CONTAINER with Dropdown */}
                            <div className="input-container" id="recent-destination-container">
                                <div className="input-with-icon">
                                    <FaFlag className="input-icon" />
                                    <input 
                                        type="text" 
                                        placeholder="Enter Destination" 
                                        ref={destinationRef} 
                                        id='destination' 
                                        onFocus={() => {
                                            // === ADD THIS LINE ===
                                            handleInputFocus(); // This expands the panel

                                            // Your existing logic:
                                            setShowRecentDestinations(true);
                                        }}
                                        onBlur={() => {
                                            setTimeout(() => setShowRecentDestinations(false), 200);
                                        }}
                                    />
                                </div>
                                {/* Conditional rendering based on showRecentDestinations state */}
                                {(recentDestinations.length > 0 && showRecentDestinations) && (
                                    <RecentSearchDropdown 
                                        items={recentDestinations}
                                        onSelect={(val) => {
                                            destinationRef.current.value = val;
                                            setDestination(val); 
                                            setShowRecentDestinations(false); // Hide immediately after selection
                                            destinationRef.current.focus(); // Keep focus on input for immediate action
                                        }}
                                    />
                                )}
                            </div>

                            <img src={switchLogo} onClick={switchLocation} className='switch-icon' alt="Switch Locations" />
                        </div>
                        <p className='clear-input' onClick={clearInput}>Clear all</p>
                        <div className="discount-section">
                            <label>Discount Category:</label>
                            <p>A 20% discount is applied to the base fare for all selected categories.</p>
                            <select onChange={(e) => setDiscountType(e.target.value)} id='discount' value={discountType}>
                                <option value="none">Regular (No Discount)</option>
                                <option value="student">Student</option>
                                <option value="pwd">PWD</option>
                                <option value="senior">Senior Citizen</option>
                            </select>
                        </div>

                        <button onClick={calculateRoute} disabled={isCalculating} id='calculate-btn'>
                            {isCalculating ? 'Calculating...' : 'Calculate Fare'}
                        </button>
                    </div>

                    {directionsResult?.routes?.length > 1 && (
                            <div className="alternative-routes">
                                <h4>All Available Routes:</h4>
                                <p className='section-subtext'>Click a button to view the route on the map.</p>
                                {directionsResult.routes.map((route, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedRouteIndex(index)}
                                        className={`alternative-route-btn 
                                            ${selectedRouteIndex === index ? 'selected-route-btn' : ''} 
                                            ${index === shortestRouteIndex ? ' shortest-indicator' : ''}
                                            ${index === cheapestFareRouteIndex ? ' cheapest-indicator' : ''}
                                        `}
                                    >
                                        Route {index + 1} ({route.legs[0].distance.text})
                                    </button>
                                ))}
                            </div>
                        )}

                    <div className="fare-details">
                        {(routeComparisons.length > 0 || isAiProcessing) && (
                            <>
                                {isAiProcessing ? (
                                    <div className="skeleton-loader">
                                        <div className="skeleton-line skeleton-title"></div>
                                        <div className="skeleton-line skeleton-step"></div>
                                        <div className="skeleton-line skeleton-step-short"></div>
                                        <div className="skeleton-line skeleton-step"></div>
                                        <div className="skeleton-line skeleton-step-short"></div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Comparison Display */}
                                        <RouteComparisonDisplay 
                                            shortestIndex={shortestRouteIndex}
                                            cheapestIndex={cheapestFareRouteIndex}
                                            comparisons={routeComparisons}
                                        />

                                        {/* Full Details of the CURRENTLY SELECTED ROUTE */}
                                        <div className="selected-route-details">
                                            <h3>Route {selectedRouteIndex + 1} Details (Selected)</h3>
                                            <p>Distance: {distanceKm} km</p>
                                            <p>Estimated Fare: {distanceKm >= 20 ? 'N/A' : `₱${fare}`}</p>
                                            <div className="transport-info">
                                                <h4>AI Suggestions:</h4>
                                                {/* DANGER! Used dangerouslySetInnerHTML for AI-generated HTML/bold tags */}
                                                <p dangerouslySetInnerHTML={{ __html: transportMode }}></p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                        
                    </div>
                    {/* --- MODIFIED: Updated Legend Text --- */}
                    <div className="route-legend" id="final-step">
                        <h4>Map Legend</h4>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'green' }}></span>
                            <p>Suggested Trip Route</p>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#FF5733' }}></span>
                            <p>Official Jeepney Routes</p>
                        </div>
                        <div className="legend-item">
                            <span className="legend-transfer-point"></span>
                            <p>Transfer Points (Toda/Kanto)</p>
                        </div>
                    </div>
                </div>
            </div>

            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
                {directionsResult && (
                    <>
                        <DirectionsRenderer
                            directions={{
                                ...directionsResult,
                                routes: [directionsResult.routes[selectedRouteIndex]]
                            }}
                            options={{
                                suppressMarkers: true, 
                                polylineOptions: {
                                    strokeColor: 'green',
                                    strokeOpacity: 1,
                                    strokeWeight: 4,
                                    zIndex: 2
                                }
                            }}
                        />

                        {/* Custom Origin Marker (Point A) with Chat Bubble */}
                        <Marker
                            position={{
                                lat: directionsResult.routes[selectedRouteIndex].legs[0].start_location.lat(),
                                lng: directionsResult.routes[selectedRouteIndex].legs[0].start_location.lng()
                            }}
                            icon={createChatBubbleMarker('Start', '#FF4444', 'white')} 
                            title={`Origin: ${origin}`}
                        />

                        {/* Custom Destination Marker (Point B) with Chat Bubble */}
                        <Marker
                            position={{
                                lat: directionsResult.routes[selectedRouteIndex].legs[0].end_location.lat(),
                                lng: directionsResult.routes[selectedRouteIndex].legs[0].end_location.lng()
                            }}
                            icon={createChatBubbleMarker('End', '#4444FF', 'white')} 
                            title={`Destination: ${destination}`}
                        />
                    </>
                )}

                {/* --- MODIFIED: Render ALL routes, not just one --- */}
                {Array.isArray(allDbRoutes) && allDbRoutes.map(route => {
                    // Assign color based on transport type
                    let color = '#808080'; // Default grey
                    if (route.transport_type_id === 1) {
                        color = '#FF5733'; // Jeepney color
                    } else if (route.transport_type_id === 2) {
                        color = '#00AEEF'; // Tricycle color
                    }

                    return (
                        <Polyline
                            key={route.id}
                            path={route.points}
                            options={{
                                strokeColor: color,
                                strokeOpacity: 0.8, // Make them slightly transparent
                                strokeWeight: 4,
                                zIndex: 1 // Keep them under the main green route
                            }}
                        />
                    );
                })}

                {/* --- RENDER FILTERED MARKERS --- */}
                {/* This will now automatically render both hard-coded points and DB terminals */}
                {getFilteredTransferPoints().map((point, index) => (
                    <Marker
                            key={`${point.type}-${point.id || index}`} // <-- Use point.id if available
                            position={{ lat: point.lat, lng: point.lng }}
                            title={point.name + (point.type === 'terminal' ? " (TODA Terminal)" : " (Transfer Point)")}
                            
                            icon={getMarkerIcon(point, activeFilter)}
                            
                            // --- THIS IS THE CHANGE ---
                            // NEW: Label for terminals AND points
                            label={(point.type === 'terminal' || point.type === 'point') ? {
                                text: point.name.charAt(0),
                                color: 'white',
                                fontWeight: 'bold'
                            } : undefined}
                    />
                    ))}
            </GoogleMap>
            {isLocating && (
                <div className="location-loading-overlay">
                    <div className="location-spinner"></div>
                    <p>Fetching your location...</p>
                    <p className="loading-tip">Please ensure your GPS is on and browser permission is granted.</p>
                </div>
            )}

            {showLocationModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            className="modal-close-btn"
                            onClick={() => {
                                setShowLocationModal(false);
                                originRef.current?.blur();
                            }}
                        >
                            <IoCloseCircleOutline size={24} />
                        </button>

                        <h3>Choose Your Starting Point</h3>
                        <p>Would you like to use your current location?</p>

                        <div className="modal-actions">
                            <button
                                className="confirm-btn"
                                onClick={() => {
                                    setShowLocationModal(false);
                                    fillCurrentLocationAsOrigin();
                                }}
                            >
                                <FaMapMarkerAlt size={16} style={{ marginRight: "6px" }} />
                                Use My Location
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    setAllowManualInput(true);
                                    setShowLocationModal(false);
                                    setTimeout(() => {
                                        originRef.current?.focus();
                                    }, 50);
                                }}
                            >
                                <FaKeyboard size={16} style={{ marginRight: "6px" }} />
                                Enter Manually
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTutorial && currentStep < tutorialSteps.length && (
                <div className={`tutorial-window ${tutorialSteps[currentStep].elementId}`}>

                    <h3>{tutorialSteps[currentStep].title}</h3>
                    <p>{tutorialSteps[currentStep].text}</p>

                    <div className="tutorial-footer">
                        {/* Hide Skip button only on the final step */}
                        {currentStep < tutorialSteps.length - 1 && (
                            <button className="tutorial-skip-btn" onClick={handleSkip}>
                                Skip Tour
                            </button>
                        )}
                        <div className="tutorial-navigation">
                            {/* Hide Back button on the first step */}
                            {currentStep > 0 && currentStep < tutorialSteps.length - 1 && (
                                <button onClick={handleBack} className="tutorial-nav-btn back">
                                    Back
                                </button>
                            )}
                            <button onClick={handleNext} className="tutorial-nav-btn next">
                                {currentStep < tutorialSteps.length - 1 ? 'Next Step' : 'Finish'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render the notification modal when showNotif is true */}
            {showNotif && (
                <NotificationModal
                type={notifType}
                message={notifMessage}
                onClose={() => setShowNotif(false)}
                />
            )}
        </div>
    ) : (<p>Loading map...</p>);
};

export default FareCalculator;