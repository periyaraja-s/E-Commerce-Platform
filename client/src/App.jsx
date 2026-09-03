import React , { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

function App() {
  const [status, setStatus] = useState('Checking API...');

  useEffect(() => {
    api.get('/health')
      .then(({ data }) => setStatus(data.message))
      .catch(() => setStatus('API is unavailable'));
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: '80px auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>E-Commerce Platform</h1>
      <p>React frontend foundation is ready.</p>
      <p><strong>API status:</strong> {status}</p>
    </main>
  );
}

export default App;
