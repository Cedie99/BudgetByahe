import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Polyline } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaFlag, FaKeyboard, FaArrowRight, FaArrowLeft, FaGasPump, FaMoneyBillWave } from "react-icons/fa";
import { IoCloseCircleOutline, IoLocationSharp } from "react-icons/io5"; 
import { MdOutlineDirectionsBus } from "react-icons/md"; 
import { RiEBike2Line } from "react-icons/ri";
import './MainFeature.css';
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
    point: '#0084ff',    // GREEN for Transfer Point (from your code)
    dimmed: '#999999'   // Grey for non-active/dimmed
};

const getMarkerIcon = (point, activeFilter) => {
    let color = COLORS.dimmed;
    let opacity = 0.4;
    let scale = 8; // Default small scale
    let zIndex = 1; // Default z-index

    if (activeFilter === 'all') {
        // Show all markers in their main color
        color = COLORS.all;
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
    // If the filter is 'point' but the type is 'terminal', 
    // it will just use the default dimmed values, which is what we want.

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

const jeepneyRoutePath = [
    { lat: 14.818701, lng: 120.960834 },
    { lat: 14.82239, lng: 120.96436 },
    { lat: 14.8225, lng: 120.96658 },
    { lat: 14.82485, lng: 120.96898 },
    { lat: 14.8292, lng: 120.97199 },
    { lat: 14.83209, lng: 120.974 },
    { lat: 14.83445, lng: 120.97565 },
    { lat: 14.83564, lng: 120.9762 },
    { lat: 14.83826, lng: 120.97812 },
    { lat: 14.84139, lng: 120.9799 },
    { lat: 14.84326, lng: 120.98037 },
    { lat: 14.84515, lng: 120.98068 },
    { lat: 14.84762, lng: 120.98084 },
    { lat: 14.84964, lng: 120.98159 },
    { lat: 14.85091, lng: 120.98355 },
    { lat: 14.85247, lng: 120.98507 },
    { lat: 14.85407, lng: 120.98645 },
    { lat: 14.85539, lng: 120.98742 },
    { lat: 14.85769, lng: 120.98911 },
    { lat: 14.85873, lng: 120.9898 },
    { lat: 14.86002, lng: 120.99041 },
    { lat: 14.86191, lng: 120.99126 },
    { lat: 14.86319, lng: 120.99189 },
    { lat: 14.86427, lng: 120.99306 },
    { lat: 14.86497, lng: 120.99475 },
    { lat: 14.86594, lng: 120.99661 },
    { lat: 14.86692, lng: 121.00007 },
    { lat: 14.86794, lng: 121.00006 },
    { lat: 14.8706, lng: 121.00216 },
    { lat: 14.87186, lng: 121.00504 },
    { lat: 14.87374, lng: 121.00705 },
    { lat: 14.87731, lng: 121.00992 },
    { lat: 14.88144, lng: 121.01217 },
    { lat: 14.88721, lng: 121.01612 },
    { lat: 14.89081, lng: 121.02019 },
    { lat: 14.89277, lng: 121.02316 },
    { lat: 14.89666, lng: 121.02583 },
    { lat: 14.89771, lng: 121.02889 },
    { lat: 14.89973, lng: 121.03412 },
    { lat: 14.90155, lng: 121.036 },
    { lat: 14.9057, lng: 121.03863 },
    { lat: 14.90581, lng: 121.03882 },
    { lat: 14.90595, lng: 121.03867 },
    { lat: 14.90581, lng: 121.03862 },
];

const transferPoints = [
    { name: "Norzagaray Crossing", lat: 14.90581, lng: 121.03862, type: 'point' }, 
    { name: "Partida", lat: 14.893597, lng: 121.023452, type: 'point' },
    { name: "Pulong Yantok", lat: 14.890642, lng: 121.019969, type: 'point' },
    { name: "Kanto of Perez", lat: 14.888687, lng: 121.017536, type: 'point' },
    { name: "Garden Village", lat: 14.876638, lng: 121.009510, type: 'point' },
    { name: "Tierra", lat: 14.873335992345256, lng: 121.00673970657967, type: 'point' },
    { name: "Cityland", lat: 14.87055514685738, lng: 121.0021162271413, type: 'point' },
    { name: "Balasing", lat: 14.865172, lng: 120.995133, type: 'point' },
    { name: "Bangka Bangka", lat: 14.864257, lng: 120.992826, type: 'point' },
    { name: "Caypombo", lat: 14.847646, lng: 120.980770, type: 'point' },
    { name: "Sitio Bato", lat: 14.841415, lng: 120.979800, type: 'point' },
    { name: "Malawak", lat: 14.844310, lng: 120.980725, type: 'point' },
    { name: "Pintong Bato", lat: 14.840166, lng: 120.979607, type: 'point' },
    { name: "Santa Maria Jeepney Dropoff", lat: 14.818701, lng: 120.960834, type: 'point' }, 

    { name: "SMB TODA", lat: 14.81947, lng: 120.96096, type: 'terminal' }, 
    { name: "SMNG TODA (Guyong)", lat: 14.836540, lng: 120.976779, type: 'terminal' }, 
    { name: "Cityland-Perez TODA Terminal", lat: 14.885105, lng: 121.000043, type: 'terminal' }, 
];

const getNearestTransferPoint = (point) => {
    let nearest = null;
    let minDistance = Infinity;

    for (const transfer of transferPoints) {
        const distance = Math.sqrt(
            Math.pow(point.lat - transfer.lat, 2) +
            Math.pow(point.lng - transfer.lng, 2)
        );
        if (distance < minDistance) {
            minDistance = distance;
            nearest = transfer;
        }
    }
    return nearest;
};

// --- START of generateInstructionGroq function (MODIFIED for guaranteed clean output) ---
async function generateInstructionGroq(context) {

    const discountText = context.discountApplied 
        ? `A 20% PWD/Student/Senior discount (Final Fare: ₱${context.fare}, Base Fare: ₱${context.baseFare}) was applied.` 
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

    const fareContext = context.transportMode === 'tricycle'
        ? `Tricycle trip (Special Ride). Total Distance: ${context.distance} km. Estimated Fare: ₱${context.fare}. ${discountText}`
        : `Jeepney and Tricycle transfer. Total Distance: ${context.distance} km. Fare Calculation: Base Fare ₱${context.baseFare}. ${discountText}`;

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
            console.warn(`${model} failed`, err);
        }
    }

    throw new Error("⚠️ All Groq AI models failed. Please check your API key.");
}
// --- END of generateInstructionGroq function ---


const R = 6371; // Radius of Earth in kilometers (for Haversine formula)

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

    // Helper function to trigger the notification
    const showNotification = (type, message) => {
        setNotifType(type);
        setNotifMessage(message);
        setShowNotif(true);
    };

    // Add toggle handler
    const handleMobileToggle = () => {
    // === 1. ADD THIS CONSOLE.LOG FOR DEBUGGING ===
    console.log('Toggling panel. New state will be:', !isMobileCollapsed);
    setIsMobileCollapsed(prevState => !prevState);
    };

    // === 2. CREATE A NEW "EXPAND" HANDLER ===
    // This will be called whenever the user clicks an input.
    const handleInputFocus = () => {
        console.log('Input focused, ensuring panel is expanded.');
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
        googleMapsApiKey: 'AIzaSyAZH_hOOhFn__misPTBpWebZ7R10PPOKEA',
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

    const isNearJeepneyRoute = (point) => {
        const threshold = 0.003;
        return jeepneyRoutePath.some(routePoint => {
            const distance = Math.sqrt(
                Math.pow(point.lat - routePoint.lat, 2) +
                Math.pow(point.lng - routePoint.lng, 2)
            );
            return distance <= threshold;
        });
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

    const passesJeepneyRoute = routePoints.some((point) => isNearJeepneyRoute(point));
    
    let baseFare, finalFare, transportModeText, transfers, walkabilityInfo, discountApplied = false;

    if (!passesJeepneyRoute) {
        // --- TRICYCLE ONLY LOGIC ---
        baseFare = 40 + Math.max(0, (distanceValue - 1) * 8);
        
        finalFare = baseFare;
        if (discountType !== 'none') {
            finalFare = baseFare * 0.80; 
            discountApplied = true;
        }

        const calculatedFare = finalFare.toFixed(2);
        const baseFareFormatted = baseFare.toFixed(2);
        
        transportModeText = 'tricycle';
        transfers = [`Take a tricycle directly from your origin to your destination. (Estimated Fare: ₱${calculatedFare})`];
        walkabilityInfo = '';

        const aiSuggestion = await generateInstructionGroq({
            transportMode: 'tricycle', 
            originOnRoute: false,
            destinationOnRoute: false,
            distance: distanceValue.toFixed(2),
            baseFare: baseFareFormatted,
            fare: calculatedFare,
            discountApplied,
            transfers, 
            walkability: walkabilityInfo, 
            routeSummary: 'local streets', 
            origin: origin, // ADDED
            destination: destination, // ADDED
        });

        transportModeText = `⚠️ TRICYCLE RIDE REQUIRED! This trip does not pass through the main jeepney route and requires a full Tricycle Ride. The fare is an (estimate) based on distance and local rates (fares can be negotiated).<br/><br/>${aiSuggestion}`;
        
        return {
            fare: calculatedFare,
            distance: distanceValue.toFixed(2),
            baseFare: baseFareFormatted,
            transportMode: transportModeText,
            isJeepneyRoute: false,
            discountApplied,
            routeIndex: index
        };

    } else {
        // --- JEEPNEY ROUTE LOGIC ---
        
        baseFare = Math.max(12, distanceValue * 2); 
        
        finalFare = baseFare;
        if (discountType !== 'none') {
            finalFare = baseFare * 0.80; 
            discountApplied = true;
        }
        
        const calculatedFare = finalFare.toFixed(2);
        const baseFareFormatted = baseFare.toFixed(2);

        const originOnRoute = isNearJeepneyRoute(originCoords);
        const destinationOnRoute = isNearJeepneyRoute(destinationCoords);

        const entryPoint = routePoints.find((p) => isNearJeepneyRoute(p));
        const exitPoint = [...routePoints].reverse().find((p) => isNearJeepneyRoute(p));

        transfers = [];
        walkabilityInfo = ''; 

        const fareDisplay = distanceValue >= 20 ? 'Estimated Fare: N/A' : `Estimated Fare: ₱${calculatedFare}`;

        if (entryPoint && !originOnRoute) {
            const pickup = getNearestTransferPoint(entryPoint);
            transfers.push(`Take a tricycle to the jeepney stop at ${pickup.name}`);
        }

        // NOTE: No asterisks here, AI must handle the bolding
        const jeepneyStep = `Ride the Norzagaray-Santa Maria jeepney route along ${routeSummary} (${fareDisplay})`;
        transfers.push(jeepneyStep);


        if (exitPoint && !destinationOnRoute) {
            const dropoff = getNearestTransferPoint(exitPoint);
            
            const lastStopCoords = { lat: dropoff.lat, lng: dropoff.lng };
            
            const dLat = (destinationCoords.lat - lastStopCoords.lat) * (Math.PI / 180);
            const dLon = (destinationCoords.lng - lastStopCoords.lng) * (Math.PI / 180);
            const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lastStopCoords.lat * (Math.PI / 180)) * Math.cos(destinationCoords.lat * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const straightLineDistanceKm = R * c; 
            
            const walkabilityThresholdKm = 0.5; // 500 meters

            if (straightLineDistanceKm <= walkabilityThresholdKm) {
                const distanceMeters = Math.round(straightLineDistanceKm * 1000);
                walkabilityInfo = `Your destination is only about ${distanceMeters} meters from ${dropoff.name}. You can comfortably walk the final leg of the trip.`;
                transfers.push(`Get off at ${dropoff.name} and proceed on foot to your final destination.`);
            } else {
                walkabilityInfo = `Your destination is ${straightLineDistanceKm.toFixed(2)} km from ${dropoff.name}. A tricycle ride is highly recommended for this distance.`;
                transfers.push(`Get off at ${dropoff.name} and take a tricycle to your destination.`);
            }
        } else if (originOnRoute && destinationOnRoute) {
            transfers = [jeepneyStep];
            walkabilityInfo = "Your entire trip is on the main jeepney route. No transfers needed.";
        }
        
        setIsAiProcessing(true);

        const aiSuggestion = await generateInstructionGroq({
            transportMode: 'jeepney', 
            originOnRoute,
            destinationOnRoute,
            distance: distanceValue.toFixed(2),
            baseFare: baseFareFormatted,
            fare: calculatedFare,
            discountApplied,
            transfers, 
            walkability: walkabilityInfo,
            routeSummary: routeSummary,
            origin: origin, // ADDED
            destination: destination, // ADDED
        });

        transportModeText = aiSuggestion.replace(/\n/g, '<br/>');

        return {
            fare: calculatedFare,
            distance: distanceValue.toFixed(2),
            baseFare: baseFareFormatted,
            transportMode: transportModeText,
            isJeepneyRoute: true,
            discountApplied,
            routeIndex: index
        };
    }
}, [discountType, origin, destination]); // Dependency array updated

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
                // Set the selected route to the most efficient (shortest) one initially
                setSelectedRouteIndex(shortestRoute.routeIndex);

                // Update the single display states for the selected route
                setDistanceKm(shortestRoute.distance);
                setFare(shortestRoute.fare);
                setTransportMode(shortestRoute.transportMode);


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

    // NEW FUNCTION: Filter points based on active filter state
    const getFilteredTransferPoints = useCallback(() => {
        if (activeFilter === 'all') {
            return transferPoints;
        }
        return transferPoints.filter(point => {
            if (activeFilter === 'terminal') {
                return point.type === 'terminal';
            }
            if (activeFilter === 'point') {
                return point.type === 'point';
            }
            return false;
        });
    }, [activeFilter]);


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
                    <div className="route-legend">
                        <h4>Map Legend</h4>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: 'green' }}></span>
                            <p>Suggested Trip Route (Jeepney/Tricycle)</p>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color" style={{ backgroundColor: '#FF5733' }}></span>
                            <p>Official Jeepney Route (Norzagaray-Sta. Maria)</p>
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

                <Polyline
                    path={jeepneyRoutePath}
                    options={{
                        strokeColor: '#FF5733',
                        strokeOpacity: 1, 
                        strokeWeight: 4,
                        zIndex: 1
                    }}
                />

                {/* --- RENDER FILTERED MARKERS --- */}
                {getFilteredTransferPoints().map((point, index) => (
                    <Marker
                            key={index}
                            position={{ lat: point.lat, lng: point.lng }}
                            title={point.name + (point.type === 'terminal' ? " (TODA Terminal)" : " (Transfer Point)")}
                            
                            // 👇 This is the only part that changes
                            icon={getMarkerIcon(point, activeFilter)}
                            
                            label={{
                                text: point.name.charAt(0),
                                color: 'white',
                                fontWeight: 'bold'
                            }}
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