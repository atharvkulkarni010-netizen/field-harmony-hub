import axios from 'axios';

const testProjectsAPI = async () => {
  try {
    // First login to get admin token
    console.log('Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Admin login successful');
    
    // Test 1: Fetch all projects
    console.log('\nTest 1: Fetching all projects...');
    const projectsResponse = await axios.get('http://localhost:3000/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Projects fetched successfully:');
    console.log('Count:', projectsResponse.data.length);
    console.log('Projects:', projectsResponse.data);
    
    // Test 2: Fetch managers
    console.log('\nTest 2: Fetching managers...');
    const managersResponse = await axios.get('http://localhost:3000/api/users/managers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Managers fetched successfully:');
    console.log('Count:', managersResponse.data.length);
    console.log('Managers:', managersResponse.data);
    
    // Test 3: Create a new project
    console.log('\nTest 3: Creating a new project...');
    const createResponse = await axios.post('http://localhost:3000/api/projects', {
      name: 'Test Project API',
      description: 'This is a test project created via API',
      start_date: '2024-06-01',
      end_date: '2024-12-31',
      assigned_manager_id: managersResponse.data[0].user_id
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Project created successfully:');
    console.log('Project:', createResponse.data.project);
    
    // Test 4: Fetch projects again to verify the new project
    console.log('\nTest 4: Fetching projects again...');
    const projectsResponse2 = await axios.get('http://localhost:3000/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Projects after creation:');
    console.log('Count:', projectsResponse2.data.length);
    console.log('New project included:', projectsResponse2.data.some(p => p.name === 'Test Project API'));
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
};

testProjectsAPI();