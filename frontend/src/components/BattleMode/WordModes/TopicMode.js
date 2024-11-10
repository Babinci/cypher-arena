import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

function TopicMode() {
  const formatLongText = (text) => {
    // Short texts don't need formatting
    if (text.length <= 12) return text;
    
    const words = text.split(' ');
    
    // Even more restrictive line lengths to ensure text stays within circle
    let maxCharsPerLine;
    if (text.length > 40) {
      maxCharsPerLine = 8; // Very restrictive for long texts
    } else if (text.length > 25) {
      maxCharsPerLine = 10; // Moderately restrictive
    } else {
      maxCharsPerLine = 12; // Less restrictive for shorter texts
    }
    
    let currentLine = '';
    let formattedLines = [];
    
    for (const word of words) {
      // Handle long single words
      if (word.length > maxCharsPerLine) {
        // If there's a current line, push it first
        if (currentLine) {
          formattedLines.push(currentLine);
          currentLine = '';
        }
        
        // Split long word into chunks, no hyphens to save space
        for (let i = 0; i < word.length; i += maxCharsPerLine) {
          formattedLines.push(word.slice(i, i + maxCharsPerLine));
        }
        continue;
      }
      
      // Check if adding this word would exceed the line length
      if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) formattedLines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) formattedLines.push(currentLine);
    
    // Ensure we don't have too many lines which would cause overflow
    const maxLines = 3; // Restrict to 3 lines maximum to ensure better vertical centering
    if (formattedLines.length > maxLines) {
      // Try to combine lines while respecting maxCharsPerLine
      while (formattedLines.length > maxLines) {
        let bestCombineIndex = 0;
        let bestCombinedLength = Infinity;
        
        // Find the best pair of adjacent lines to combine
        for (let i = 0; i < formattedLines.length - 1; i++) {
          const combinedLength = formattedLines[i].length + formattedLines[i + 1].length + 1;
          if (combinedLength < bestCombinedLength && combinedLength <= maxCharsPerLine + 2) {
            bestCombinedLength = combinedLength;
            bestCombineIndex = i;
          }
        }
        
        // Combine the lines or force truncate if necessary
        if (bestCombinedLength < Infinity) {
          const combinedLine = formattedLines[bestCombineIndex] + ' ' + formattedLines[bestCombineIndex + 1];
          formattedLines.splice(bestCombineIndex, 2, combinedLine);
        } else {
          // If we can't combine nicely, we'll have to truncate
          formattedLines = formattedLines.slice(0, maxLines);
          const lastLine = formattedLines[maxLines - 1];
          if (lastLine.length > maxCharsPerLine) {
            formattedLines[maxLines - 1] = lastLine.slice(0, maxCharsPerLine - 2) + '..';
          }
          break;
        }
      }
    }
    
    // Add extra padding line at the start to move text up in the circle
    if (formattedLines.length > 1) {
      formattedLines.unshift('');
    }
    
    return formattedLines.join('\n');
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