import axios from 'axios';

const testManagersAPI = async () => {
  try {
    // First login to get a token
    console.log('Logging in...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    console.log('Login successful');
    console.log('Token:', loginResponse.data.token.substring(0, 50) + '...');
    
    // Now test the managers endpoint
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

testManagersAPI();