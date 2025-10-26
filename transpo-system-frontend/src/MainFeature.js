import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, Polyline } from '@react-google-maps/api';
import { FaMapMarkerAlt, FaFlag, FaKeyboard, FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { IoCloseCircleOutline } from "react-icons/io5";
import './MainFeature.css';
import switchLogo from './assets/loop.png';

const containerStyle = {
    width: '100vw',
    height: '100vh'
};


const center = {
    lat: 14.86994, // Approximate latitude of Santa Maria town center
    lng: 121.00238 // Approximate longitude of Santa Maria town center
};

const libraries = ['places'];

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
    { lat: 14.86692, lng: 120.99807 },
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
    { name: "Norzagaray Crossing", lat: 14.90581, lng: 121.03862 },
    { name: "Partida", lat: 14.893597, lng: 121.023452},
    { name: "Pulong Yantok", lat: 14.890642, lng: 121.019969 },
    { name: "Kanto of Perez", lat: 14.888687, lng: 121.017536},
    { name: "Garden Village", lat: 14.876638, lng: 121.009510},
    { name: "Tierra", lat: 14.873335992345256, lng: 121.00673970657967},
    { name: "Cityland", lat: 14.87055514685738, lng: 121.0021162271413 },
    { name: "Balasing Kanto", lat: 14.865172, lng: 120.995133},
    { name: "Bangka Bangka Kanto", lat: 14.864257, lng: 120.992826},
    { name: "Caypombo Kanto", lat: 14.847646, lng: 120.980770 },
    { name: "Sitio Bato", lat: 14.841415, lng: 120.979800},
    { name: "Malawak", lat: 14.844310, lng: 120.980725},
    { name: "Pintong Bato", lat: 14.840166, lng: 120.979607},
    { name: "Santa Maria Proper", lat: 14.818701, lng: 120.960834 },

    
    { name: "Cityland-Perez Toda", lat: 14.885105, lng: 121.000043},
    { name: "Camangyanan", lat: 14.802373, lng: 120.971376},
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

// --- START of generateInstructionGroq function ---
async function generateInstructionGroq(context) {

    const discountText = context.discountApplied 
        ? `A 20% discount (Final Fare: ₱${context.fare}, Base Fare: ₱${context.baseFare}) was applied.` 
        : `Regular fare applied.`;

    const stepsBlock = context.transfers.map((step, index) => `${index + 1}. ${step}`).join('\n');

    let finalSummary = '';
    if (context.walkability) {
        finalSummary = `\n\n**Friendly Tip:** ${context.walkability}`;
    } else if (context.transportMode === 'tricycle') {
        // Special tip for full tricycle
        finalSummary = `\n\n**Friendly Tip:** This is an estimated rate for a special trip based on distance and local norms. Always confirm the final fare with the driver before boarding.`;
    }

    // Adjust the main persona and required steps based on transport mode
    const persona = context.transportMode === 'tricycle'
        ? "You are a friendly and expert **Local Guide for Santa Maria, Bulacan Tricycle Routes**. Your directions must reflect a single, direct tricycle journey."
        : "You are a friendly and expert Public Transit Guide for the local **Norzagaray-Santa Maria, Bulacan Jeepney route**. All transfer steps (non-jeepney) should be assumed to require a tricycle.";

    const requiredStepsInstruction = context.transportMode === 'tricycle'
        ? "Your **sole task** is to convert the following raw travel steps into a clear, concise, and friendly **single instruction** for the passenger, emphasizing that the whole trip is by tricycle."
        : "Your **sole task** is to convert the following raw travel steps into a clear, concise, and friendly **numbered list of directions** for the passenger.";

    const fareContext = context.transportMode === 'tricycle'
        ? `Tricycle trip. Total Distance: ${context.distance} km. Estimated Fare: ₱${context.fare}. ${discountText}`
        : `Jeepney and Tricycle transfer. Total Distance: ${context.distance} km. Fare Calculation: Base Fare ₱${context.baseFare}. ${discountText}`;

    const prompt = `
        ${persona}

        ${requiredStepsInstruction}

        ### Required Travel Steps (MUST BE CONVERTED TO NUMBERED LIST/SINGLE INSTRUCTION):
        ${stepsBlock}

        ### Important Fare Information:
        - ${fareContext}
        - The main route for a jeepney is generally along: **${context.routeSummary}**. (Only mention this in the final output if the trip involves a jeepney).

        Provide the numbered list of directions (or a single step for tricycle) first, followed by the "Friendly Tip" at the end. Use short, action-oriented sentences and make sure to remove asterisks.
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
                return data.choices[0].message.content.trim();
            }

        } catch (err) {
            console.warn(`${model} failed`, err);
        }
    }

    throw new Error("⚠️ All Groq AI models failed. Please check your API key.");
}
// --- END of generateInstructionGroq function ---


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
            title: "You're All Set!",
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
        // Optionally save to localStorage/sessionStorage so it doesn't pop up again
        localStorage.setItem('hasSeenTutorial', 'true');
    };

    // Add this useEffect hook inside the FareCalculator component
    useEffect(() => {
        // Check local storage to see if the user has already seen the tutorial
        const hasSeen = localStorage.getItem('hasSeenTutorial');
        if (hasSeen === 'true') {
            setShowTutorial(false);
        }
    }, []);


    const fillCurrentLocationAsOrigin = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
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
                        alert("Geocoder unavailable. Please check your internet connection.");
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
                            alert("Couldn't convert location to address. Try again or check internet connection.");
                        }
                    });
                };

                tryGeocode();
            },
            (error) => {
                setIsLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    alert("Location permission denied. Please enable GPS or allow access in browser settings.");
                } else {
                    alert("Unable to retrieve location. Please make sure GPS is enabled.");
                }
            },
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

const R = 6371; // Radius of Earth in kilometers (for Haversine formula)

const processRoute = useCallback(async (route) => {
    const distanceText = route.legs[0].distance.text;
    const distanceValue = parseFloat(distanceText.replace(/[^0-9.]/g, ''));
    
    // Determine the main street name or use a default
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

    // --- LONG DISTANCE CHECK (Keep this first) ---
    if (distanceValue > 20) {
        return setTransportMode('🚗 LONG DISTANCE TRIP DETECTED! Route outside Santa Maria Bulacan is not covered by Budget Byahe.');
    }

    // --- CHECK FOR TRICYCLE ROUTE (The core fix) ---
    const passesJeepneyRoute = routePoints.some((point) => isNearJeepneyRoute(point));
    
    if (!passesJeepneyRoute) {
        // --- TRICYCLE ONLY LOGIC ---
        // A simple, placeholder fare calculation for a full tricycle trip.
        // Assume a base fare of P40 plus P8 per kilometer after the first km.
        let baseFare = 40 + Math.max(0, (distanceValue - 1) * 8);
        
        let finalFare = baseFare;
        let discountApplied = false;
        if (discountType !== 'none') {
            // Apply 20% discount to the private hire base fare
            finalFare = baseFare * 0.80; 
            discountApplied = true;
        }

        const calculatedFare = finalFare.toFixed(2);
        const baseFareFormatted = baseFare.toFixed(2);
        
        setDistanceKm(distanceValue);
        setFare(calculatedFare); 

        setIsAiProcessing(true);
        const aiSuggestion = await generateInstructionGroq({
            transportMode: 'tricycle', // New context for AI
            originOnRoute: false,
            destinationOnRoute: false,
            distance: distanceValue.toFixed(2),
            baseFare: baseFareFormatted,
            fare: calculatedFare,
            discountApplied,
            // Simple instruction for full tricycle trip
            transfers: [`Take a tricycle directly from your origin to your destination. (Estimated Fare: ₱${calculatedFare})`], 
            walkability: '', 
            routeSummary: 'local streets', 
        });

        setIsAiProcessing(false);
        // Overwrite the message to clearly state it's a full tricycle trip
        const tricycleMessage = `⚠️ TRICYCLE RIDE REQUIRED! This trip does not pass through the main jeepney route and requires a full Tricycle Ride. The fare is an (estimate) based on distance and local rates (fares can be negotiated).<br/><br/>${aiSuggestion}`;
        return setTransportMode(tricycleMessage);
    }
    
    // --- JEEPNEY ROUTE LOGIC (Original logic for mixed or full jeepney trip) ---
    
    let baseFare = Math.max(12, distanceValue * 2); 
    
    let finalFare = baseFare;
    let discountApplied = false;
    if (discountType !== 'none') {
        finalFare = baseFare * 0.80; 
        discountApplied = true;
    }
    
    const calculatedFare = finalFare.toFixed(2);
    const baseFareFormatted = baseFare.toFixed(2);

    setDistanceKm(distanceValue);
    setFare(calculatedFare); 

    const originOnRoute = isNearJeepneyRoute(originCoords);
    const destinationOnRoute = isNearJeepneyRoute(destinationCoords);

    const entryPoint = routePoints.find((p) => isNearJeepneyRoute(p));
    const exitPoint = [...routePoints].reverse().find((p) => isNearJeepneyRoute(p));

    let transferSteps = [];
    let walkabilityInfo = ''; 

    const fareDisplay = distanceValue >= 20 ? 'Estimated Fare: N/A' : `Estimated Fare: ₱${calculatedFare}`;

    if (entryPoint && !originOnRoute) {
        const pickup = getNearestTransferPoint(entryPoint);
        transferSteps.push(`Take a tricycle to the jeepney stop at ${pickup.name}`);
    }

    // Include the street name in the Jeepney step for better context
    const jeepneyStep = `Ride the Norzagaray-Santa Maria jeepney route along **${routeSummary}** (${fareDisplay})`;
    transferSteps.push(jeepneyStep);


    if (exitPoint && !destinationOnRoute) {
        const dropoff = getNearestTransferPoint(exitPoint);
        
        // --- WALKABILITY CHECK (Haversine Formula) ---
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
            walkabilityInfo = `Your destination is only about **${distanceMeters} meters** from **${dropoff.name}**. You can comfortably walk the final leg of the trip.`;
            transferSteps.push(`Alight at ${dropoff.name} and proceed on foot to your final destination.`);
        } else {
            walkabilityInfo = `Your destination is **${straightLineDistanceKm.toFixed(2)} km** from **${dropoff.name}**. A tricycle ride is highly recommended for this distance.`;
            transferSteps.push(`Alight at ${dropoff.name} and take a tricycle to your destination.`);
        }
    } else if (originOnRoute && destinationOnRoute) {
        transferSteps = [jeepneyStep];
        walkabilityInfo = "Your entire trip is on the main jeepney route. No transfers needed.";
    }
    
    setIsAiProcessing(true);

    const aiSuggestion = await generateInstructionGroq({
        transportMode: 'jeepney', // New context for AI
        originOnRoute,
        destinationOnRoute,
        distance: distanceValue.toFixed(2),
        baseFare: baseFareFormatted,
        fare: calculatedFare,
        discountApplied,
        transfers: transferSteps, 
        walkability: walkabilityInfo,
        routeSummary: routeSummary,
    });

    setIsAiProcessing(false);
    setTransportMode(aiSuggestion.replace(/\n/g, '<br/>'));
}, [discountType]);


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
    }


    const calculateRoute = () => {
        const originInput = document.getElementById('origin');
        const destinationInput = document.getElementById('destination');

        const originVal = originInput.value.trim();
        const destinationVal = destinationInput.value.trim();

        if (!originVal || !destinationVal) {
            alert('Please enter both origin and destination.');
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
        }, (result, status) => {
            setIsCalculating(false);

            if (status === window.google.maps.DirectionsStatus.OK) {
                // Sort routes by distance to get consistent ordering
                const sortedRoutes = result.routes.sort((a, b) => {
                    const distanceA = a.legs[0].distance.value;
                    const distanceB = b.legs[0].distance.value;
                    return distanceA - distanceB;
                });

                // Filter routes if needed, but keep original if no filtered routes
                const filteredRoutes = sortedRoutes.filter(route =>
                    /national|highway|main|rd|road/i.test(route.summary)
                );

                const finalRoutes = filteredRoutes.length > 0 ? filteredRoutes : sortedRoutes;

                const directionsWithFilteredRoutes = { ...result, routes: finalRoutes };
                setDirectionsResult(directionsWithFilteredRoutes);
                setSelectedRouteIndex(0);

                // Process the first route immediately
                if (finalRoutes.length > 0) {
                    processRoute(finalRoutes[0]);
                }
            } else {
                alert('Could not find route. Please check your locations and try again.');
            }
        });
    };

    // Only trigger when route index changes or discount/directions result changes
    useEffect(() => {
        if (directionsResult?.routes?.length > 0 ) {
            const route = directionsResult.routes[selectedRouteIndex];
            if (route) {
                processRoute(route);
            }
        }
    }, [selectedRouteIndex, directionsResult, discountType, processRoute]);

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

    return isLoaded ? (
        <div className="map-wrapper">
            <div className={`fare-container ${!isPanelOpen ? 'closed' : ''}`}>
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
                            <div className="input-with-icon">
                                <FaMapMarkerAlt className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="Enter Origin"
                                    ref={originRef}
                                    id='origin'
                                    onFocus={() => {
                                        if(!allowManualInput) setShowLocationModal(true);
                                    }}
                                />
                            </div>

                            <div className="input-with-icon">
                                <FaFlag className="input-icon" />
                                <input type="text" placeholder="Enter Destination" ref={destinationRef} id='destination' />
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

                    <div className="fare-details">
                        {(distanceKm > 0 || isAiProcessing) && (
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
                                        <p>Distance: {distanceKm} km</p>
                                        <p>Estimated Fare: {distanceKm >= 20 ? 'N/A' : `₱${fare}`}</p>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        </div>
                                        <div className="transport-info">
                                            <p dangerouslySetInnerHTML={{ __html: transportMode }}></p>
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {directionsResult?.routes?.length > 1 && (
                            <div className="alternative-routes">
                                <h4>Alternative Routes:</h4>
                                {directionsResult.routes.map((route, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedRouteIndex(index)}
                                        style={{
                                            margin: '4px',
                                            backgroundColor: selectedRouteIndex === index ? 'green' : '#ccc',
                                            color: selectedRouteIndex === index ? '#fff' : '#000',
                                            border: 'none',
                                            padding: '5px 10px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Route {index + 1} ({route.legs[0].distance.text})
                                    </button>
                                ))}
                            </div>
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
                                suppressMarkers: true, // Hide default A/B markers
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
                            icon={createChatBubbleMarker('Start', '#FF4444', 'white')} // Red bubble
                            title={`Origin: ${origin}`}
                        />

                        {/* Custom Destination Marker (Point B) with Chat Bubble */}
                        <Marker
                            position={{
                                lat: directionsResult.routes[selectedRouteIndex].legs[0].end_location.lat(),
                                lng: directionsResult.routes[selectedRouteIndex].legs[0].end_location.lng()
                            }}
                            icon={createChatBubbleMarker('End', '#4444FF', 'white')} // Blue bubble
                            title={`Destination: ${destination}`}
                        />
                    </>
                )}

                <Polyline
                    path={jeepneyRoutePath}
                    options={{
                        strokeColor: '#FF5733',
                        strokeOpacity: 1, // Changed to 1 to show the route clearly
                        strokeWeight: 4,
                        zIndex: 1
                    }}
                />

                {transferPoints.map((point, index) => (
                    <Marker
                        key={index}
                        position={{ lat: point.lat, lng: point.lng }}
                        label={{
                            text: point.name.charAt(0),
                            color: 'white',
                            fontWeight: 'bold'
                        }}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '#00A86B', // Green for transfer points
                            fillOpacity: 1,
                            strokeWeight: 1,
                            strokeColor: 'white'
                        }}
                        title={point.name}
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
        </div>
    ) : (<p>Loading map...</p>);
};

export default FareCalculator;