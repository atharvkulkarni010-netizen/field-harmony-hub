// Test script to verify sessionStorage clearing
console.log('Before logout:');
console.log('auth_token:', sessionStorage.getItem('auth_token'));
console.log('auth_user:', sessionStorage.getItem('auth_user'));
console.log('token:', localStorage.getItem('token'));

// Simulate logout
sessionStorage.removeItem('auth_token');
sessionStorage.removeItem('auth_user');
localStorage.removeItem('token');

console.log('\nAfter logout:');
console.log('auth_token:', sessionStorage.getItem('auth_token'));
console.log('auth_user:', sessionStorage.getItem('auth_user'));
console.log('token:', localStorage.getItem('token'));