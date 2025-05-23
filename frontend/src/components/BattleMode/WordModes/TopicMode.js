import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

function TopicMode() {
  // Simplified formatting - rely more on WordTextRenderer for dynamic wrapping
  // Pass raw text and let the renderer handle complex wrapping.
  const fetchAndPrepareData = async (endpoint) => {
    const response = await fetch(endpoint);
    const data = await response.json();
    // Return raw words directly, ensuring they are strings
    return {
      ...data,
      words: data?.words?.map(word => String(word || '')) ?? ["Error loading topic"]
    };
  };

  return (
    <BaseBattleVisualizer
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getTopic}`}
      fetchFunction={fetchAndPrepareData}
      visualMode="fire"
      // Use default styleConfig, or provide one if needed
      // styleConfig={{ fontSizeFactor: 1.3 }} // Removed, let renderer handle size fully
    />
  );
}

export default TopicMode;