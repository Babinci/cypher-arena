// WordMode.js
import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

function WordMode() {
  return (
    <BaseBattleVisualizer 
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getRandomWord}`}
    />
  );
}

export default WordMode;