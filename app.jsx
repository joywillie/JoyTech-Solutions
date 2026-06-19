import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/services').then(res => setServices(res.data));
    if (token) {
      axios.get('http://localhost:5000/requests', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setRequests(res.data));
    }
  }, [token]);

  const requestService = async (service_id) => {
    await axios.post('http://localhost:5000/requests', { service_id, details: 'Standard request' }, 
      { headers: { Authorization: `Bearer ${token}` } });
    alert('Requested!');
  };

  return (
    <div>
      <h1>Business Services</h1>
      {!token ? <p>Please Log In</p> : (
        <>
          <h3>Available Services</h3>
          {services.map(s => <button key={s.id} onClick={() => requestService(s.id)}>{s.title}</button>)}
          <h3>My Requests</h3>
          {requests.map(r => <p key={r.id}>Request ID: {r.id} | Status: {r.status}</p>)}
        </>
      )}
    </div>
  );
}
export default App;
