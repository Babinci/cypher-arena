import React, { useState, useEffect, useCallback } from 'react';
import apiConfig from '../../../config/apiConfig';
import { useWordTimer, useRoundTimer } from '../TimerSettings/useTimers';

function ContrastingMode() {
  const [pairs, setPairs] = useState([]);
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [changeInterval, setChangeInterval] = useState(60);
  const [roundDuration, setRoundDuration] = useState(90);
  const [isActive, setIsActive] = useState(true);
  const [timer, resetPairTimer] = useWordTimer(changeInterval, isActive);
  const [roundTimer, resetRoundTimer] = useRoundTimer(roundDuration, () => setIsActive(false));
  const [highlightedRating, setHighlightedRating] = useState(null);
  const [showRatingMessage, setShowRatingMessage] = useState(false);

  const fetchPairs = useCallback(() => {
    fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.getContrastPairs}`)
      .then(response => response.json())
      .then(data => {
        setPairs(data);
      })
      .catch(error => console.error('Error fetching pairs:', error));
  }, []);

  useEffect(() => {
    fetchPairs();
  }, [fetchPairs]);

  useEffect(() => {
    if (timer === 0 && isActive) {
      getNextPair();
      resetPairTimer();
    }
  }, [timer, isActive, resetPairTimer]);

  function getNextPair() {
    setCurrentPairIndex(prevIndex => {
      let newIndex = prevIndex + 1;
      if (newIndex >= pairs.length) {
        fetchPairs();
        newIndex = 0;
      }
      return newIndex;
    });
  }

  const handleIntervalChange = useCallback((value) => {
    setChangeInterval(value);
    resetPairTimer();
  }, [resetPairTimer]);

  const handleRoundDurationChange = useCallback((value) => {
    const newDuration = value === 300 ? Infinity : value;
    setRoundDuration(newDuration);
    resetRoundTimer(newDuration);
  }, [resetRoundTimer]);

  const handleResetRound = () => {
    setPairs([]);
    setCurrentPairIndex(0);
    fetchPairs();
    resetRoundTimer(roundDuration);
    resetPairTimer();
    setIsActive(true);
  };

  const handleRating = (rating) => {
    const currentPair = pairs[currentPairIndex];
    fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.rateContrastPair}${currentPair.id}/rate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rating }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Rating submitted:', data);
        setHighlightedRating(rating);
        setShowRatingMessage(true);
        
        setPairs(prevPairs => {
          const updatedPairs = [...prevPairs];
          updatedPairs[currentPairIndex] = { ...updatedPairs[currentPairIndex], rating: rating };
          return updatedPairs;
        });

        setTimeout(() => {
          setHighlightedRating(null);
          setShowRatingMessage(false);
        }, 2000);
      })
      .catch(error => console.error('Error submitting rating:', error));
  };

  const handleAddTag = (tag) => {
    const currentPair = pairs[currentPairIndex];
    fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.addTagToContrastPair}${currentPair.id}/add_tag/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tag }),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Tag added:', data);
        // You might want to update the local state here to reflect the new tag
      })
      .catch(error => console.error('Error adding tag:', error));
  };

  return (
    <div className="contrasting-mode" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '100vh', overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '80vh' }}>
        {pairs.length > 0 && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '80%',
            height: '60%',
            border: '2px solid white',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            fontSize: '24px',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ marginBottom: '20px' }}>{pairs[currentPairIndex].item1}</div>
            <div style={{ fontSize: '36px', margin: '10px 0' }}>vs</div>
            <div>{pairs[currentPairIndex].item2}</div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                onClick={() => handleRating(i + 1)}
                style={{
                  cursor: 'pointer',
                  color: i < (pairs[currentPairIndex]?.rating || 0) ? 'yellow' : 'gray',
                  fontSize: '24px',
                  marginRight: '5px',
                  transition: 'transform 0.2s ease-in-out',
                  transform: highlightedRating === i + 1 ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                ★
              </span>
            ))}
          </div>
          {showRatingMessage && (
            <div style={{ 
              color: 'green', 
              fontSize: '14px', 
              marginTop: '5px',
              animation: 'fadeInOut 2s ease-in-out'
            }}>
              Rating submitted!
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Add a tag"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(e.target.value)}
              style={{ marginRight: '10px', padding: '5px' }}
            />
            <button onClick={() => handleAddTag(document.querySelector('input[type="text"]').value)}>Add Tag</button>
          </div>
        </div>
      </div>
      <div
        className="control-panel"
        style={{
          width: '100%',
          overflowY: 'auto',
          padding: '10px',
          boxSizing: 'border-box',
          maxHeight: '20vh',
          background: 'rgba(0,0,0,0.5)',
          color: 'white',
        }}
      >
        <div className="timer">Pair Timer: {timer} seconds</div>
        <div>Interval: {changeInterval} seconds</div>
        <div>Round Duration: {roundDuration === Infinity ? 'Infinity' : `${roundTimer} seconds`}</div>
        <input
          type="range"
          min="10"
          max="300"
          value={roundDuration === Infinity ? 300 : roundDuration}
          onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', marginBottom: '10px' }}>
          <button onClick={getNextPair}>Next Pair</button>
          <button onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}>Decrease Interval</button>
          <button onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}>Increase Interval</button>
          <button onClick={() => setIsActive(!isActive)}>{isActive ? 'Pause' : 'Resume'}</button>
          <button onClick={handleResetRound}>Reset Round</button>
        </div>
      </div>
    </div>
  );
}

export default ContrastingMode;