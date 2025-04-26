import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

function TopicMode() {
  const formatLongText = (text) => {
    // Short texts don't need formatting
    if (text.length <= 12) return text;
    
    const words = text.split(' ');
    
    // More adaptive line lengths based on text characteristics
    let maxCharsPerLine;
    
    // Detect if on mobile (rough estimation - will be refined by BaseBattleVisualizer)
    const isMobileView = window.innerWidth <= 768;
    
    if (isMobileView) {
      // More restrictive character limits for mobile
      if (text.length > 40) {
        maxCharsPerLine = 8; // Very restrictive for long text on mobile
      } else if (text.length > 25) {
        maxCharsPerLine = 10; // Restrictive for medium text on mobile
      } else {
        maxCharsPerLine = 12; // For shorter text on mobile
      }
    } else {
      // Desktop character limits (slightly increased from original)
      if (text.length > 40) {
        maxCharsPerLine = 12; // For very long text
      } else if (text.length > 25) {
        maxCharsPerLine = 14; // For medium text
      } else {
        maxCharsPerLine = 16; // For shorter text
      }
    }
    
    let currentLine = '';
    let formattedLines = [];
    
    for (const word of words) {
      // Handle long single words with more aggressive splitting
      if (word.length > maxCharsPerLine) {
        // If there's a current line, push it first
        if (currentLine) {
          formattedLines.push(currentLine);
          currentLine = '';
        }
        
        // Split long word into chunks
        for (let i = 0; i < word.length; i += maxCharsPerLine) {
          const chunk = word.slice(i, i + maxCharsPerLine);
          // Add hyphen for chunks in the middle (not for last chunk)
          if (i + maxCharsPerLine < word.length) {
            formattedLines.push(chunk + "-");
          } else {
            formattedLines.push(chunk);
          }
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
    
    // Adaptive line count based on device and text length
    const maxLines = isMobileView ? 4 : 5;
    
    if (formattedLines.length > maxLines) {
      // Try to combine lines while respecting maxCharsPerLine
      let attempts = 0;
      const maxAttempts = 10; // Prevent infinite loops
      
      while (formattedLines.length > maxLines && attempts < maxAttempts) {
        let bestCombineIndex = 0;
        let bestCombinedLength = Infinity;
        
        // Find the best pair of adjacent lines to combine
        for (let i = 0; i < formattedLines.length - 1; i++) {
          const combinedLength = formattedLines[i].length + formattedLines[i + 1].length + 1;
          // Allow slightly longer combined lines to reduce overall line count
          const lengthThreshold = maxCharsPerLine + (isMobileView ? 2 : 4);
          
          if (combinedLength < bestCombinedLength && combinedLength <= lengthThreshold) {
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
          formattedLines = formattedLines.slice(0, maxLines - 1);
          formattedLines.push("...");
          break;
        }
        
        attempts++;
      }
    }
    
    // Don't add padding line for mobile views (save vertical space)
    // Only add padding for desktop with multiple lines
    if (!isMobileView && formattedLines.length > 1 && formattedLines.length < 4) {
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
      styleConfig={{ fontSizeFactor: 1.3 }} // Reduced from 1.5 for better mobile fit
    />
  );
}

export default TopicMode;