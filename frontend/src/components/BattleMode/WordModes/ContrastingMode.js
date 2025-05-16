import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

const formatContrastingText = (pair) => {
  // Use the special marker "###VS###" for the renderer
  // Ensure items are strings and trimmed
  const item1 = String(pair?.item1 || '').trim();
  const item2 = String(pair?.item2 || '').trim();
  return `${item1}\n###VS###\n${item2}`;
};

const fetchContrastPairs = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    if (data && data.results && Array.isArray(data.results)) {
      return {
        words: data.results.map(pair => formatContrastingText(pair)),
        // No longer need to pass original pairs or isContrastMode flag here
        // WordTextRenderer detects "###VS###" format automatically
      };
    }
  } catch (error) {
     console.error("Error fetching contrast pairs:", error);
  }
  // Default fallback
  return {
    words: ["Example\n###VS###\nContrast"],
  };
};

function ContrastingMode() {
  return (
    <BaseBattleVisualizer
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getContrastPairs}?count=100`}
      fetchFunction={fetchContrastPairs}
      visualMode="fire"
      // No custom styleConfig needed for font size, renderer handles it
      // styleConfig={{
      //   fontSizeFactor: 1.1, // Removed
      //   isContrastMode: true // Removed - detected by renderer
      // }}
    />
  );
}

export default ContrastingMode;