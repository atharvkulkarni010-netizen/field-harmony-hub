import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function testEmailRegistration() {
  console.log('Starting Email Service Verification...');
  try {
     // 1. Login
    console.log('Attempting to login as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@ngo.com',
      password: 'admin123'
    });
    
    if (loginRes.status !== 200) {
        console.error('Login Failed');
        return;
    }
    const token = loginRes.data.token;
    console.log('✅ Login Successful');

    // 2. Create Manager (triggers email)
    const uniqueId = Date.now();
    console.log(`Creating Test Manager (manager_${uniqueId}@test.com)...`);
    
    const managerRes = await axios.post(`${API_URL}/users/register`, {
      name: `Test Manager ${uniqueId}`,
      email: `manager_${uniqueId}@test.com`,
      role: 'MANAGER'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (managerRes.status === 201) {
        console.log('✅ Manager Registration Success');
        console.log('Response Message:', managerRes.data.message);
        if(managerRes.data.generatedPassword) {
            console.log('Generated Password (Email Content):', managerRes.data.generatedPassword);
        }
    } else {
        console.error('❌ Manager Registration Failed', managerRes.data);
    }

    // 3. Create Worker (triggers email)
    // Need a manager ID first. We can use the one created above.
    const managerId = managerRes.data.user.user_id;
    console.log(`Creating Test Worker (worker_${uniqueId}@test.com) assigned to Manager ${managerId}...`);
    
    const workerRes = await axios.post(`${API_URL}/users/register`, {
      name: `Test Worker ${uniqueId}`,
      email: `worker_${uniqueId}@test.com`,
      role: 'WORKER',
      manager_id: managerId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (workerRes.status === 201) {
        console.log('✅ Worker Registration Success');
        console.log('Response Message:', workerRes.data.message);
        if(workerRes.data.generatedPassword) {
            console.log('Generated Password (Email Content):', workerRes.data.generatedPassword);
        }
    } else {
        console.error('❌ Worker Registration Failed', workerRes.data);
    }

    console.log('Check backend console logs for "Mock Email Sent" messages.');

  } catch (error) {
    console.error('❌ Email Test Failed:', error.response?.data || error.message);
  }
}

testEmailRegistration();
