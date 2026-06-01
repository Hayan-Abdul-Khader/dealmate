import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page home-page">
      <h1>Welcome to DealMate</h1>
      <p>Find the best deals around you. We are setting up the foundation for your application.</p>
      <br />
      <Link to="/login" className="btn-primary">Go to Login</Link>
    </div>
  );
}

export default Home;
