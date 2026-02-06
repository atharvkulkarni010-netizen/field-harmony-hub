import axios from 'axios';

const testWorkerNoManager = async () => {
  try {
    // Login as admin
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Admin login successful');
    
    // Try to register worker without manager_id
    console.log('\nTesting worker registration without manager_id...');
    try {
      await axios.post('http://localhost:3000/api/users/register', {
        name: 'Test Worker No Manager',
        email: 'test.nomgr' + Date.now() + '@example.com',
        role: 'WORKER'
        // No manager_id provided
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('ERROR: Should have failed');
    } catch (error) {
      console.log('Expected error:', error.response?.data?.message);
    }
    
    // Try to register worker with valid manager_id
    console.log('\nTesting worker registration with valid manager_id...');
    const workerResponse = await axios.post('http://localhost:3000/api/users/register', {
      name: 'Test Worker With Manager',
      email: 'test.withmgr' + Date.now() + '@example.com',
      role: 'WORKER',
      manager_id: 2  // John Manager's ID
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Worker registration successful:');
    console.log('User:', workerResponse.data.user);
    console.log('Generated Password:', workerResponse.data.generatedPassword);
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testWorkerNoManager();