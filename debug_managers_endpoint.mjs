// Debug script to check the managers endpoint
import axios from 'axios';

async function debugManagersEndpoint() {
  try {
    console.log('Debugging managers endpoint...\n');
    
    // Step 1: Login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin logged in successfully');
    console.log('User:', loginResponse.data.user);
    console.log('');
    
    // Step 2: Check if basic users endpoint works
    console.log('2. Testing basic users endpoint...');
    const usersResponse = await axios.get('http://localhost:3000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Basic users endpoint works:');
    console.log(`Found ${usersResponse.data.length} users`);
    usersResponse.data.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('');
    
    // Step 3: Check managers specifically
    console.log('3. Testing managers endpoint...');
    const managersResponse = await axios.get('http://localhost:3000/api/users?role=MANAGER', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Managers endpoint works:');
    console.log(`Found ${managersResponse.data.length} managers`);
    managersResponse.data.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.name} (${manager.email})`);
    });
    console.log('');
    
    // Step 4: Test the specific managers-with-stats endpoint
    console.log('4. Testing managers-with-stats endpoint...');
    const managersWithStatsResponse = await axios.get('http://localhost:3000/api/users/managers-with-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ managers-with-stats endpoint works:');
    console.log(`Found ${managersWithStatsResponse.data.length} managers with stats`);
    managersWithStatsResponse.data.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.name} (${manager.email}) - ${manager.projectsCount} projects, ${manager.workersCount} workers`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
  }
}

debugManagersEndpoint();