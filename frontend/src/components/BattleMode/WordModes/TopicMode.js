// TopicMode.js
import React from 'react';
import apiConfig from '../../../config/apiConfig';
import BaseBattleVisualizer from './BaseBattleVisualizer';

function TopicMode() {
  return (
    <BaseBattleVisualizer 
      endpoint={`${apiConfig.baseUrl}${apiConfig.endpoints.getTopic}`}
    />
  );
}

export default TopicMode;