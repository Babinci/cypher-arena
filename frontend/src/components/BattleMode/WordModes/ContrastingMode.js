import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

const formatContrastingText = (pair) => {
  // Check if we're likely on a mobile device
  const isMobileView = window.innerWidth <= 768;
  
  // Insert blank lines for better spacing on desktop
  if (!isMobileView) {
    return `${pair.item1}\n\nvs\n\n${pair.item2}`;
  } else {
    // More compact format for mobile
    return `${pair.item1}\nvs\n${pair.item2}`;
  }
};

const fetchContrastPairs = async (endpoint) => {
  const response = await fetch(endpoint);
  const data = await response.json();
  
  if (data && data.results && Array.isArray(data.results)) {
    return {
      words: data.results.map(pair => formatContrastingText(pair))
    };
  }
  return { words: ["Example\nvs\nContrast"] };
};

function ContrastingMode() {
  return (
    <BaseBattleVisualizer
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getContrastPairs}?count=100`}
      fetchFunction={fetchContrastPairs}
      styleConfig={{ fontSizeFactor: 1.1 }} // Reduced from 1.2 for better mobile display
    />
  );
}

export default ContrastingMode;