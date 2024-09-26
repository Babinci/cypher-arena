import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show the back button on the home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button onClick={() => navigate(-1)} className="back-button">
      Back
    </button>
  );
}