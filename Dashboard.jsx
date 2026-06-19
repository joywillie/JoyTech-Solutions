import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/requests', {
      headers: { Authorization: `Bearer ${user.token}` }
    }).then(res => setRequests(res.data));
  }, [user]);

  return (
    <div>
      <h1>Customer Dashboard</h1>
      {requests.map(r => (
        <div key={r.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
          <p>Service ID: {r.service_id}</p>
          <p>Status: <strong>{r.status}</strong></p>
        </div>
      ))}
    </div>
  );
}
