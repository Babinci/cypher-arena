import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

const fetchContrastPairs = async (endpoint) => {
  const response = await fetch(endpoint);
  const data = await response.json();
  // Format as lines: "item1\nvs\nitem2"
  if (data && data.results && Array.isArray(data.results)) {
    return {
      words: data.results.map(pair => `${pair.item1}\nvs\n${pair.item2}`)
    };
  }
  return { words: ["Example\nvs\nContrast"] };
};

function ContrastingMode() {
  return (
    <BaseBattleVisualizer
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getContrastPairs}?count=100`}
      fetchFunction={fetchContrastPairs}
      styleConfig={{ fontSizeFactor: 1.2 }}
    />
  );
}

export default ContrastingMode;