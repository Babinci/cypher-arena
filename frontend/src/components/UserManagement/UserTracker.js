// components/UserManagement/UserTracker.js
import { useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../../config/apiConfig';

const getUserDeviceInfo = () => {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  
  // Basic device detection
  const isMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(userAgent);
  const isTablet = /Tablet|iPad/i.test(userAgent);
  const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');
  
  return {
    deviceType,
    platform,
    userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
  };
};

const UserTracker = () => {
  useEffect(() => {
    const trackUserVisit = async () => {
      try {
        // Get user's location using IP Geolocation API
        const locationResponse = await fetch('https://ipapi.co/json/');
        const locationData = await locationResponse.json();
        
        const deviceInfo = getUserDeviceInfo();
        
        // Send data to your backend
        await axios.post(`${apiConfig.baseUrl}${apiConfig.endpoints.trackUserVisit}`, {
          location: {
            city: locationData.city,
            region: locationData.region,
            country: locationData.country_name,
            ip: locationData.ip,
          },
          device: deviceInfo,
          timestamp: new Date().toISOString(),
          path: window.location.pathname,
        });
      } catch (error) {
        console.error('Error tracking user visit:', error);
      }
    };

    trackUserVisit();
  }, []);

  return null; // This component doesn't render anything
};

export default UserTracker;
