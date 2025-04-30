// WordMode.js
import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

function WordMode() {
  // Fetch function to ensure words are strings
  const fetchAndPrepareData = async (endpoint) => {
    const response = await fetch(endpoint);
    const data = await response.json();
    return {
      ...data,
      words: data?.words?.map(word => String(word || '')) ?? ["Word?"]
    };
  };

  return (
    <BaseBattleVisualizer
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getRandomWord}`}
      fetchFunction={fetchAndPrepareData}
      // No custom styleConfig needed for font size, renderer handles it
      // styleConfig={{ fontSizeFactor: 1.5 }} // Removed
    />
  );
}

export default WordMode;