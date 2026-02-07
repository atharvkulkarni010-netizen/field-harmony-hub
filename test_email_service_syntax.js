import { sendWelcomeEmail } from './Backend/services/emailService.js';

console.log('Successfully imported sendWelcomeEmail');
if (typeof sendWelcomeEmail === 'function') {
    console.log('sendWelcomeEmail is a function');
} else {
    console.log('sendWelcomeEmail is NOT a function');
}
