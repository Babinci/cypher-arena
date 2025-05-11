import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useTranslation from '../../config/useTranslation';

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Don't show the back button on the home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button onClick={() => navigate(-1)} className="back-button">
      {t('back')}
    </button>
  );
}