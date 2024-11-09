// TopicMode.js
import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

function TopicMode() {
  const formatLongText = (text) => {
    // If text is shorter than threshold, return as is
    if (text.length <= 20) return text;
    
    const words = text.split(' ');
    const maxCharsPerLine = 15;
    
    let currentLine = '';
    let formattedLines = [];
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) formattedLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) formattedLines.push(currentLine);
    
    // Only apply line breaks if we actually need them
    return formattedLines.length > 1 ? formattedLines.join('\n') : text;
  };

  const transformData = (data) => {
    if (!data || !data.words) return data;
    
    return {
      ...data,
      words: data.words.map(word => formatLongText(word))
    };
  };

  const fetchWithTransform = async (endpoint) => {
    const response = await fetch(endpoint);
    const data = await response.json();
    return transformData(data);
  };

  return (
    <BaseBattleVisualizer
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getTopic}`}
      fetchFunction={fetchWithTransform}
    />
  );
}

export default TopicMode;