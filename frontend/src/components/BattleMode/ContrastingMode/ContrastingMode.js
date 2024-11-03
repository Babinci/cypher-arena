import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FullScreen } from 'react-full-screen';
import apiConfig from '../../../config/apiConfig';
import { useTimerControl } from '../SharedControls/useTimerControl';
import { TimerControls } from '../SharedControls/TimerControls';

function ContrastingMode() {
  const [pairs, setPairs] = useState([]);
  const [highlightedRating, setHighlightedRating] = useState(null);
  const [showRatingMessage, setShowRatingMessage] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  const containerRef = useRef(null);

  // Initialize timer control with pair-specific configuration
  const {
    timer,
    roundTimer,
    changeInterval,
    roundDuration,
    isActive,
    currentIndex,
    isControlWindow,
    isFullScreen,
    fullScreenHandle,
    getNextItem,
    handleIntervalChange,
    handleRoundDurationChange,
    handleResetRound: baseHandleResetRound,
    toggleActive,
    openControlWindow,
    toggleFullScreen,
  } = useTimerControl({
    defaultInterval: 60,
    defaultRoundDuration: 90,
    defaultIsActive: true,
    itemCount: pairs.length,
    onNextItem: () => {
      if (currentIndex >= pairs.length - 5) {
        fetchPairs();
      }
    },
  });

  const getCsrfToken = useCallback(() => {
    const name = 'csrftoken=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i].trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return '';
  }, []);

  useEffect(() => {
    setCsrfToken(getCsrfToken());
  }, [getCsrfToken]);

  const fetchPairs = useCallback(async () => {
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.getContrastPairs}`, {
        headers: {
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPairs(data);
      } else {
        console.error('Error fetching pairs:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching pairs:', error);
    }
  }, [csrfToken]);

  useEffect(() => {
    fetchPairs();
  }, [fetchPairs]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      if (['1', '2', '3', '4', '5'].includes(key)) {
        handleRating(parseInt(key));
      }
    };

    const container = containerRef.current;
    if (container) {
      container.focus();
    }

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [currentIndex, pairs]);

  // Custom reset handler that combines timer reset with pairs reset
  const handleResetRound = useCallback(() => {
    setPairs([]);
    fetchPairs();
    baseHandleResetRound();
  }, [fetchPairs, baseHandleResetRound]);

  const handleRating = async (rating) => {
    const currentPair = pairs[currentIndex];
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.rateContrastPair}${currentPair.id}/rate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ rating }),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Rating submitted:', data);
        setHighlightedRating(rating);
        setShowRatingMessage(true);
        
        setPairs(prevPairs => {
          const updatedPairs = [...prevPairs];
          updatedPairs[currentIndex] = { ...updatedPairs[currentIndex], rating: rating };
          return updatedPairs;
        });
        
        setTimeout(() => {
          setHighlightedRating(null);
          setShowRatingMessage(false);
          getNextItem();
        }, 300);
      } else {
        console.error('Error submitting rating:', await response.text());
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleAddTag = async (tag) => {
    const currentPair = pairs[currentIndex];
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.addTagToContrastPair}${currentPair.id}/add_tag/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ tag }),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Tag added:', data);
      } else {
        console.error('Error adding tag:', await response.text());
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  // Render control buttons for fullscreen and control panel
  const renderControlButtons = () => (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 1000,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isFullScreen ? 0 : 1,
      }}
      onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0')}
    >
      <button
        onClick={openControlWindow}
        style={{
          marginBottom: '10px',
          display: 'block',
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Open Control Panel
      </button>
      <button
        onClick={toggleFullScreen}
        style={{
          display: 'block',
          padding: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        {isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
      </button>
    </div>
  );

  return (
    <FullScreen handle={fullScreenHandle}>
      <div 
        className="contrasting-mode" 
        style={{ 
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#1a1a1a'
        }}
        ref={containerRef}
        tabIndex={0}
      >
        {!isControlWindow && (
          <>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              padding: '20px'
            }}>
              {pairs.length > 0 && currentIndex < pairs.length && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '800px',
                  border: '2px solid white',
                  borderRadius: '10px',
                  padding: '20px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontSize: '24px',
                  textAlign: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ marginBottom: '20px' }}>{pairs[currentIndex].item1}</div>
                  <div style={{ fontSize: '36px', margin: '10px 0' }}>vs</div>
                  <div>{pairs[currentIndex].item2}</div>
                </div>
              )}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                opacity: isFullScreen ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onMouseEnter={(e) => isFullScreen && (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => isFullScreen && (e.currentTarget.style.opacity = '0')}
              >
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px' }}>
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      onClick={() => handleRating(i + 1)}
                      style={{
                        cursor: 'pointer',
                        color: i < (pairs[currentIndex]?.rating || 0) ? 'yellow' : 'gray',
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
                  <button onClick={() => handleAddTag(document.querySelector('input[type="text"]').value)}>
                    Add Tag
                  </button>
                </div>
              </div>
            </div>
            {renderControlButtons()}
          </>
        )}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}>
          <TimerControls
            timer={timer}
            roundTimer={roundTimer}
            changeInterval={changeInterval}
            roundDuration={roundDuration}
            isActive={isActive}
            handleRoundDurationChange={handleRoundDurationChange}
            getNextItem={getNextItem}
            handleIntervalChange={handleIntervalChange}
            toggleActive={toggleActive}
            handleResetRound={handleResetRound}
            isControlWindow={isControlWindow}
            isFullScreen={isFullScreen}
          />
        </div>
      </div>
    </FullScreen>
  );
}

export default ContrastingMode;