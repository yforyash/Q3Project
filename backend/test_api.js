const db = require('./config/db');

const BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  console.log('--- STARTING AUTOMATED API INTEGRATION TEST ---');
  
  const testEmail = `user.${Date.now()}@company.com`;
  const testPassword = 'e86f78a8a3caf0b60d8e74e5942aa6d86dc150cd3c03338aef25b7d2d7e3acc7'; // SHA-256 of Admin@123

  // 1. Signup
  console.log('\n[1] Registering User...');
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: 'Test',
      last_name: 'Tester',
      email: testEmail,
      password: testPassword,
      phone: '+15550199'
    })
  });
  console.log('Status:', signupRes.status);
  console.log('Response:', await signupRes.json());

  // 2. Fetch OTP from DB
  console.log('\n[2] Harvesting OTP from PostgreSQL Database...');
  const dbRes = await db.query(
    'SELECT code FROM otps WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1',
    [testEmail, 'signup']
  );
  if (dbRes.rows.length === 0) {
    console.error('Failed to retrieve OTP from database!');
    process.exit(1);
  }
  const otpCode = dbRes.rows[0].code;
  console.log(`Harvested OTP Code: ${otpCode}`);

  // 3. Verify Email
  console.log('\n[3] Verifying Email Address via OTP...');
  const verifyRes = await fetch(`${BASE_URL}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      otp: otpCode
    })
  });
  console.log('Status:', verifyRes.status);
  console.log('Response:', await verifyRes.json());

  // 4. Login
  console.log('\n[4] Logging In User...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  console.log('Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Response:', loginData);
  const token = loginData.token;

  if (!token) {
    console.error('Login failed, no token returned!');
    process.exit(1);
  }

  // 5. Fetch Profile
  console.log('\n[5] Fetching User Profile...');
  const profileRes = await fetch(`${BASE_URL}/profile`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Status:', profileRes.status);
  console.log('Response:', await profileRes.json());

  // 6. Fetch Login History
  console.log('\n[6] Fetching Login History Log...');
  const historyRes = await fetch(`${BASE_URL}/security/login-history`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Status:', historyRes.status);
  console.log('Response:', await historyRes.json());

  console.log('\n--- INTEGRATION TESTS COMPLETED SUCCESSFULLY ---');
  db.pool.end();
}

testAPI().catch(err => {
  console.error('Test run failed:', err);
  db.pool.end();
});
