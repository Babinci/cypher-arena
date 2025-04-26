import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

const formatContrastingText = (pair) => {
  // Create a special format for vs that will be handled differently in rendering
  // We'll use a special marker "###VS###" that our renderer will recognize
  return {
    item1: pair.item1,
    item2: pair.item2,
    formatted: `${pair.item1}\n###VS###\n${pair.item2}`
  };
};

const fetchContrastPairs = async (endpoint) => {
  const response = await fetch(endpoint);
  const data = await response.json();
  
  if (data && data.results && Array.isArray(data.results)) {
    return {
      words: data.results.map(pair => formatContrastingText(pair).formatted),
      // Pass the original pairs as well for custom rendering
      originalPairs: data.results.map(pair => formatContrastingText(pair)),
      isContrastMode: true
    };
  }
  return { 
    words: ["Example\n###VS###\nContrast"],
    originalPairs: [{ item1: "Example", item2: "Contrast", formatted: "Example\n###VS###\nContrast" }],
    isContrastMode: true
  };
};

function ContrastingMode() {
  return (
    <BaseBattleVisualizer
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getContrastPairs}?count=100`}
      fetchFunction={fetchContrastPairs}
      styleConfig={{ 
        fontSizeFactor: 1.1,
        isContrastMode: true  // Flag to indicate this is contrast mode 
      }} 
    />
  );
}

export default ContrastingMode;