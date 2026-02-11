import { createProject, getProjectDetails } from '../services/projectService.js';
import pool from '../config/database.js';

async function verifyLocationFields() {
    try {
        console.log('Verifying Location Fields Implementation...');

        // 1. Create a Project with Location Data
        const mockManagerId = 1; // Assuming user ID 1 exists and is a manager, or adapt as needed. 
        // If ID 1 doesn't exist or constraint fails, we might need to find a valid user first.
        // For now, let's try to find a manager first.

        const [managers] = await pool.query("SELECT user_id FROM user WHERE role = 'MANAGER' LIMIT 1");
        if (managers.length === 0) {
            console.error('No manager found to assign project to. Skipping creation verification.');
            return;
        }
        const managerId = managers[0].user_id;

        console.log(`Using Manager ID: ${managerId}`);

        const newProject = await createProject(
            'Test Location Project',
            'A project to test location fields',
            '2023-10-01',
            '2023-12-31',
            managerId,
            'Test Site A',
            'https://maps.google.com/?q=Test+Site+A',
            'Hybrid'
        );

        console.log('Project Created:', newProject);

        if (newProject.location !== 'Test Site A') throw new Error('Location mismatch');
        if (newProject.google_maps_link !== 'https://maps.google.com/?q=Test+Site+A') throw new Error('Maps Link mismatch');
        if (newProject.location_type !== 'Hybrid') throw new Error('Location Type mismatch');

        // 2. Retrieve Project Details
        const details = await getProjectDetails(newProject.project_id);
        console.log('Project Details Retrieved:', details);

        if (details.location !== 'Test Site A') throw new Error('Retrieved Location mismatch');
        if (details.google_maps_link !== 'https://maps.google.com/?q=Test+Site+A') throw new Error('Retrieved Maps Link mismatch');
        if (details.location_type !== 'Hybrid') throw new Error('Retrieved Location Type mismatch');

        console.log('Verification Successful!');

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await pool.end();
    }
}

verifyLocationFields();
