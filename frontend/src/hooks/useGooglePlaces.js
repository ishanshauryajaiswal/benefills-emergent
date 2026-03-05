import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to load the Google Maps JavaScript SDK and provide
 * Places Autocomplete for address fields.
 *
 * Also includes PIN code → City/State lookup via the free
 * India Post API (api.postalpincode.in) as a lightweight fallback
 * for when users type a PIN code directly.
 */
const useGooglePlaces = () => {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const autocompleteRef = useRef(null);

    // Load Google Maps JS SDK (same pattern as useRazorpay.js)
    const loadGoogleMapsScript = useCallback(() => {
        return new Promise((resolve) => {
            if (window.google && window.google.maps && window.google.maps.places) {
                resolve(true);
                return;
            }

            let script = document.getElementById('google-maps-script');
            if (script) {
                script.addEventListener('load', () => resolve(true));
                script.addEventListener('error', () => resolve(false));
                return;
            }

            const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                console.warn('Google Maps API key not found. Address autocomplete will be disabled.');
                resolve(false);
                return;
            }

            script = document.createElement('script');
            script.id = 'google-maps-script';
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });
    }, []);

    useEffect(() => {
        loadGoogleMapsScript().then((loaded) => {
            setScriptLoaded(loaded);
        });
    }, [loadGoogleMapsScript]);

    /**
     * Attach Google Places Autocomplete to an input element.
     *
     * @param {HTMLInputElement} inputElement - The input DOM element
     * @param {Function} onPlaceSelect - Callback with extracted address fields:
     *   { address, city, state, pincode }
     */
    const attachAutocomplete = useCallback(
        (inputElement, onPlaceSelect) => {
            if (!scriptLoaded || !inputElement) return;
            if (!window.google?.maps?.places) return;

            // Clean up previous instance
            if (autocompleteRef.current) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }

            const autocomplete = new window.google.maps.places.Autocomplete(inputElement, {
                componentRestrictions: { country: 'in' }, // Restrict to India
                fields: ['address_components', 'formatted_address'],
                types: ['address'],
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (!place.address_components) return;

                const components = place.address_components;
                let city = '';
                let state = '';
                let pincode = '';
                let streetParts = [];

                for (const component of components) {
                    const types = component.types;

                    if (types.includes('postal_code')) {
                        pincode = component.long_name;
                    } else if (types.includes('administrative_area_level_1')) {
                        state = component.long_name;
                    } else if (types.includes('locality')) {
                        city = component.long_name;
                    } else if (types.includes('administrative_area_level_2') && !city) {
                        // Fallback for city — some Indian addresses use district
                        city = component.long_name;
                    } else if (
                        types.includes('sublocality_level_1') ||
                        types.includes('sublocality') ||
                        types.includes('route') ||
                        types.includes('premise') ||
                        types.includes('street_number')
                    ) {
                        streetParts.push(component.long_name);
                    }
                }

                const address = streetParts.length > 0
                    ? streetParts.join(', ')
                    : place.formatted_address || '';

                onPlaceSelect({ address, city, state, pincode });
            });

            autocompleteRef.current = autocomplete;
        },
        [scriptLoaded]
    );

    /**
     * Look up city and state from a 6-digit Indian PIN code
     * using the free India Post API.
     *
     * @param {string} pincode - 6-digit Indian PIN code
     * @returns {Promise<{ city: string, state: string } | null>}
     */
    const lookupPincode = useCallback(async (pincode) => {
        if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
            return null;
        }

        try {
            const response = await fetch(
                `https://api.postalpincode.in/pincode/${pincode}`
            );
            const data = await response.json();

            if (
                data &&
                data[0] &&
                data[0].Status === 'Success' &&
                data[0].PostOffice &&
                data[0].PostOffice.length > 0
            ) {
                const postOffice = data[0].PostOffice[0];
                return {
                    city: postOffice.District || '',
                    state: postOffice.State || '',
                };
            }
            return null;
        } catch (error) {
            console.error('PIN code lookup failed:', error);
            return null;
        }
    }, []);

    return {
        scriptLoaded,
        attachAutocomplete,
        lookupPincode,
    };
};

export default useGooglePlaces;
