/**
 * Geo-fence utility — Haversine formula for distance calculation
 */

const EARTH_RADIUS_METERS = 6371000; // Earth's radius in meters

/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate the distance in meters between two lat/lng points using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export function haversineDistance(lat1, lng1, lat2, lng2) {
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
}

/**
 * Check if a worker's position is within a project's geo-fence.
 * @param {number} workerLat
 * @param {number} workerLng
 * @param {number} projectLat - Geo-fence center latitude
 * @param {number} projectLng - Geo-fence center longitude
 * @param {number} radiusMeters - Geo-fence radius in meters
 * @returns {{ inside: boolean, distance: number }} Result with distance in meters
 */
export function checkGeofence(workerLat, workerLng, projectLat, projectLng, radiusMeters) {
    const distance = haversineDistance(workerLat, workerLng, projectLat, projectLng);
    return {
        inside: distance <= radiusMeters,
        distance: Math.round(distance),
    };
}

/**
 * Check worker against multiple project geo-fences.
 * Returns INSIDE if the worker is within ANY project's fence.
 * @param {number} workerLat
 * @param {number} workerLng
 * @param {Array<{geofence_latitude: number, geofence_longitude: number, geofence_radius: number, name: string}>} projects
 * @returns {{ status: 'INSIDE'|'OUTSIDE'|null, nearest_project: string|null, distance: number|null }}
 */
export function checkWorkerAgainstProjects(workerLat, workerLng, projects) {
    // Filter to only projects that have geo-fence configured
    const geoProjects = projects.filter(
        p => p.geofence_latitude != null && p.geofence_longitude != null
    );

    if (geoProjects.length === 0) {
        // No geo-fences configured — skip validation
        return { status: null, nearest_project: null, distance: null };
    }

    let nearestProject = null;
    let nearestDistance = Infinity;
    let isInsideAny = false;

    for (const project of geoProjects) {
        const result = checkGeofence(
            workerLat,
            workerLng,
            Number(project.geofence_latitude),
            Number(project.geofence_longitude),
            project.geofence_radius || 500
        );

        if (result.distance < nearestDistance) {
            nearestDistance = result.distance;
            nearestProject = project.name;
        }

        if (result.inside) {
            isInsideAny = true;
        }
    }

    return {
        status: isInsideAny ? 'INSIDE' : 'OUTSIDE',
        nearest_project: nearestProject,
        distance: nearestDistance,
    };
}
