import axios from 'axios';

const testWorkersAPI = async () => {
  try {
    // First login to get a token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    console.log('Login successful');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    
    // Now test the workers endpoint
    console.log('\nFetching workers...');
    const workersResponse = await axios.get('http://localhost:3000/api/users/workers', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Workers fetched successfully:');
    console.log('Count:', workersResponse.data.length);
    console.log('Workers:', workersResponse.data);
    
    // Test the managers endpoint
    console.log('\nFetching managers...');
    const managersResponse = await axios.get('http://localhost:3000/api/users/managers', {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`
      }
    });
    
    console.log('Managers fetched successfully:');
    console.log('Count:', managersResponse.data.length);
    console.log('Managers:', managersResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testWorkersAPI();