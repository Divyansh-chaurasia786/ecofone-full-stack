async function check() {
  const url = 'https://ecofone-backend.onrender.com/api/v1';
  console.log('Checking Render Backend:', url);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error('Error:', e);
  }
}

check();
