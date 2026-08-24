const axios = require('axios');
(async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'test123',
      phone: '+91 11111 22222'
    });
    console.log('Response:', response.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
})();
