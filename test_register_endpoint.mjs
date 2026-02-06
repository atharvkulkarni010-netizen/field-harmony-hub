import axios from 'axios';

const testRegisterEndpoint = async () => {
  try {
    // First login to get admin token
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Admin login successful');
    
    // Test 1: Register a worker with valid manager
    console.log('\nTest 1: Registering worker with valid manager...');
    const workerResponse = await axios.post('http://localhost:3000/api/users/register', {
      name: 'Test Worker',
      email: 'test.worker@example.com',
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
    
    // Test 2: Register a manager
    console.log('\nTest 2: Registering manager...');
    const managerResponse = await axios.post('http://localhost:3000/api/users/register', {
      name: 'Test Manager',
      email: 'test.manager@example.com',
      role: 'MANAGER'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Manager registration successful:');
    console.log('User:', managerResponse.data.user);
    console.log('Generated Password:', managerResponse.data.generatedPassword);
    
    // Test 3: Register an admin
    console.log('\nTest 3: Registering admin...');
    const adminResponse = await axios.post('http://localhost:3000/api/users/register', {
      name: 'Test Admin',
      email: 'test.admin@example.com',
      role: 'ADMIN'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Admin registration successful:');
    console.log('User:', adminResponse.data.user);
    console.log('Generated Password:', adminResponse.data.generatedPassword);
    
    // Test 4: Try to register worker with invalid manager
    console.log('\nTest 4: Trying to register worker with invalid manager...');
    try {
      await axios.post('http://localhost:3000/api/users/register', {
        name: 'Test Worker 2',
        email: 'test.worker2@example.com',
        role: 'WORKER',
        manager_id: 999  // Invalid manager ID
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.log('Expected error for invalid manager:', error.response?.data?.message);
    }
    
    // Test 5: Try to register worker without manager_id
    console.log('\nTest 5: Trying to register worker without manager_id...');
    try {
      await axios.post('http://localhost:3000/api/users/register', {
        name: 'Test Worker 3',
        email: 'test.worker3@example.com',
        role: 'WORKER'
        // No manager_id provided
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Worker registered without manager_id (should be null in database)');
    } catch (error) {
      console.log('Error:', error.response?.data?.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testRegisterEndpoint();