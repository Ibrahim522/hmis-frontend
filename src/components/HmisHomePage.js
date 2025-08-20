// src/pages/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const HmisHomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to HMIS</h1>
      <p>Please choose an option to register:</p>
      <div style={{ marginTop: '30px' }}>
        <button
          style={{ padding: '10px 20px', marginRight: '20px', fontSize: '16px' }}
          onClick={() => navigate('/register-patient')}
        >
          Register as Patient
        </button>

        <button
          style={{ padding: '10px 20px', fontSize: '16px' }}
          onClick={() => navigate('/register-doctor')}
        >
          Register as Doctor
        </button>
      </div>
    </div>
  );
};

export default HmisHomePage;
