/**
 * Reverse geocoding service using OpenStreetMap Nominatim API
 * No API key required for usage under 1 request/second
 */

export interface AddressResult {
    display_name: string;
    address?: {
        road?: string;
        suburb?: string;
        city?: string;
        state?: string;
        postcode?: string;
        country?: string;
    };
}

/**
 * Converts latitude and longitude to a human-readable address
 * @param lat Latitude
 * @param lng Longitude
 * @returns Promise resolving to the address string
 */
export const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            {
                headers: {
                    'User-Agent': 'FieldHarmonyHub/1.0' // Required by Nominatim policy
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Geocoding error: ${response.statusText}`);
        }

        const data = await response.json();

        // Return the full display name or fallback
        return data.display_name || 'Address not found';
    } catch (error) {
        console.error('Error fetching address:', error);
        return 'Error fetching address';
    }
};
