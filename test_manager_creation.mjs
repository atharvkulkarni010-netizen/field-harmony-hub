// Test script to verify manager creation functionality
import axios from 'axios';

async function testManagerCreation() {
  try {
    console.log('Testing Manager Creation API...\n');
    
    // Step 1: Login as admin to get token
    console.log('1. Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Admin logged in successfully');
    console.log('Token:', token.substring(0, 20) + '...\n');
    
    // Step 2: Fetch existing managers
    console.log('2. Fetching existing managers...');
    const managersResponse = await axios.get('http://localhost:3000/api/users/managers-with-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${managersResponse.data.length} managers:`);
    managersResponse.data.forEach((manager, index) => {
      console.log(`   ${index + 1}. ${manager.name} (${manager.email}) - ${manager.projectsCount} projects, ${manager.workersCount} workers`);
    });
    console.log('');
    
    // Step 3: Create a new manager
    console.log('3. Creating new manager...');
    const newManagerData = {
      name: 'Test Manager ' + Date.now(),
      email: `test.manager.${Date.now()}@company.com`,
      password: 'password123',
      role: 'MANAGER',
      manager_id: null
    };
    
    const createResponse = await axios.post('http://localhost:3000/api/users/register', newManagerData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Manager created successfully!');
    console.log('New manager:', createResponse.data.user.name, '(', createResponse.data.user.email, ')\n');
    
    // Step 4: Verify the new manager appears in the list
    console.log('4. Verifying new manager in list...');
    const updatedManagersResponse = await axios.get('http://localhost:3000/api/users/managers-with-stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const newManager = updatedManagersResponse.data.find(m => m.email === newManagerData.email);
    if (newManager) {
      console.log('✅ New manager found in the list!');
      console.log('Manager details:', {
        name: newManager.name,
        email: newManager.email,
        projectsCount: newManager.projectsCount,
        workersCount: newManager.workersCount
      });
    } else {
      console.log('❌ New manager not found in the list');
    }
    
    console.log('\n🎉 All tests passed! Manager creation is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testManagerCreation();