// WordMode.js
import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

function WordMode() {
  return (
    <BaseBattleVisualizer 
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getRandomWord}`}
      styleConfig={{ fontSizeFactor: 1.5 }}
    />
  );
}

export default WordMode;