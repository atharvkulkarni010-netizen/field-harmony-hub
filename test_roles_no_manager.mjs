import axios from 'axios';

const testRolesNoManager = async () => {
  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Admin login successful');
    
    // Test manager registration without manager_id
    console.log('\nTesting manager registration without manager_id...');
    const managerResponse = await axios.post('http://localhost:3000/api/users/register', {
      name: 'Test Manager No Manager',
      email: 'test.manager.nomgr' + Date.now() + '@example.com',
      role: 'MANAGER'
      // No manager_id provided (should be fine for managers)
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Manager registration successful:');
    console.log('User:', managerResponse.data.user);
    console.log('Generated Password:', managerResponse.data.generatedPassword);
    
    // Test admin registration without manager_id
    console.log('\nTesting admin registration without manager_id...');
    const adminResponse = await axios.post('http://localhost:3000/api/users/register', {
      name: 'Test Admin No Manager',
      email: 'test.admin.nomgr' + Date.now() + '@example.com',
      role: 'ADMIN'
      // No manager_id provided (should be fine for admins)
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Admin registration successful:');
    console.log('User:', adminResponse.data.user);
    console.log('Generated Password:', adminResponse.data.generatedPassword);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testRolesNoManager();