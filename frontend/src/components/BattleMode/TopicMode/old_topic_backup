import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWordTimer, useRoundTimer } from '../TimerSettings/useTimers';

function TopicMode() {
    const [numbers, setNumbers] = useState([...Array(11).keys()]);
    const [currentNumberIndex, setCurrentNumberIndex] = useState(0);
    const [changeInterval, setChangeInterval] = useState(15);
    const [roundDuration, setRoundDuration] = useState(90);
    const [isActive, setIsActive] = useState(true);
    const [timer, resetNumberTimer] = useWordTimer(changeInterval, isActive);
    const [roundTimer, resetRoundTimer] = useRoundTimer(roundDuration, () => setIsActive(false));
    const [isControlWindow, setIsControlWindow] = useState(false);
    const broadcastChannel = useRef(null);

    // Initialize broadcast channel
    useEffect(() => {
        broadcastChannel.current = new BroadcastChannel('topic-mode-channel');
        
        // Listen for messages
        broadcastChannel.current.onmessage = (event) => {
            const { type, payload } = event.data;
            
            switch (type) {
                case 'NEXT_NUMBER':
                    setCurrentNumberIndex(prevIndex => (prevIndex + 1) % numbers.length);
                    break;
                case 'CHANGE_INTERVAL':
                    setChangeInterval(payload);
                    resetNumberTimer();
                    break;
                case 'SET_ACTIVE':
                    setIsActive(payload);
                    break;
                case 'RESET_ROUND':
                    setCurrentNumberIndex(0);
                    resetRoundTimer(roundDuration);
                    resetNumberTimer();
                    setIsActive(true);
                    break;
                case 'CHANGE_ROUND_DURATION':
                    const newDuration = payload === 300 ? Infinity : payload;
                    setRoundDuration(newDuration);
                    resetRoundTimer(newDuration);
                    break;
                case 'SYNC_STATE':
                    setCurrentNumberIndex(payload.currentNumberIndex);
                    setChangeInterval(payload.changeInterval);
                    setRoundDuration(payload.roundDuration);
                    setIsActive(payload.isActive);
                    resetNumberTimer();
                    resetRoundTimer(payload.roundDuration);
                    break;
                default:
                    break;
            }
        };

        // Check if this is the control window
        const isControl = window.name === 'controlWindow';
        setIsControlWindow(isControl);

        // Request initial state if this is the control window
        if (isControl) {
            broadcastChannel.current.postMessage({ type: 'REQUEST_SYNC' });
        }

        return () => {
            broadcastChannel.current.close();
        };
    }, [numbers.length, resetNumberTimer, resetRoundTimer, roundDuration]);

    // Send message to other windows
    const sendMessage = (type, payload = null) => {
        broadcastChannel.current.postMessage({ type, payload });
    };

    const getNextNumber = useCallback(() => {
        sendMessage('NEXT_NUMBER');
        setCurrentNumberIndex(prevIndex => (prevIndex + 1) % numbers.length);
    }, [numbers.length]);

    const handleIntervalChange = useCallback((value) => {
        sendMessage('CHANGE_INTERVAL', value);
        setChangeInterval(value);
        resetNumberTimer();
    }, [resetNumberTimer]);

    const handleRoundDurationChange = useCallback((value) => {
        sendMessage('CHANGE_ROUND_DURATION', value);
        const newDuration = value === 300 ? Infinity : value;
        setRoundDuration(newDuration);
        resetRoundTimer(newDuration);
    }, [resetRoundTimer]);

    const handleResetRound = () => {
        sendMessage('RESET_ROUND');
        setCurrentNumberIndex(0);
        resetRoundTimer(roundDuration);
        resetNumberTimer();
        setIsActive(true);
    };

    const toggleActive = () => {
        sendMessage('SET_ACTIVE', !isActive);
        setIsActive(!isActive);
    };

    const openControlWindow = () => {
        const controlWindow = window.open('', 'controlWindow', 'width=800,height=400');
        controlWindow.location = window.location.href;
    };

    useEffect(() => {
        if (timer === 0 && isActive) {
            getNextNumber();
            resetNumberTimer();
        }
    }, [timer, isActive, getNextNumber, resetNumberTimer]);

    // Render number display
    const renderNumberDisplay = () => (
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '80vh' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '300px',
                height: '300px',
                border: '2px solid white',
                borderRadius: '10px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                color: 'white',
                fontSize: '120px'
            }}>
                {numbers[currentNumberIndex]}
            </div>
        </div>
    );

    return (
        <div className="number-mode" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            width: '100%', 
            height: '100vh', 
            overflow: 'hidden',
            backgroundColor: '#1a1a1a',  // Dark background
            color: 'white'
        }}>
            {!isControlWindow && (
                <>
                    {renderNumberDisplay()}
                    <button 
                        onClick={openControlWindow}
                        style={{
                            position: 'fixed',
                            top: '10px',
                            right: '10px',
                            zIndex: 1000,
                            padding: '10px',
                            backgroundColor: '#4CAF50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Open Control Panel
                    </button>
                </>
            )}
            
            <div
                className="control-panel"
                style={{
                    width: '100%',
                    padding: '20px',
                    boxSizing: 'border-box',
                    background: isControlWindow ? '#1a1a1a' : 'rgba(0,0,0,0.5)',
                    color: 'white',
                    marginTop: isControlWindow ? '20px' : '0',
                }}
            >
                {isControlWindow && (
                    <h2 style={{ 
                        textAlign: 'center', 
                        marginBottom: '20px',
                        fontSize: '24px'
                    }}>
                        Control Panel
                    </h2>
                )}
                
                <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                    <div>Number Timer: {timer} seconds</div>
                    <div>Interval: {changeInterval} seconds</div>
                    <div>Round Duration: {roundDuration === Infinity ? 'Infinity' : `${roundTimer} seconds`}</div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <input
                        type="range"
                        min="10"
                        max="300"
                        value={roundDuration === Infinity ? 300 : roundDuration}
                        onChange={(e) => handleRoundDurationChange(parseInt(e.target.value))}
                        style={{ 
                            width: '100%',
                            marginBottom: '10px',
                            accentColor: '#4CAF50'  // Green color for the slider
                        }}
                    />
                </div>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    flexWrap: 'wrap',
                    gap: '10px'  // Add space between buttons
                }}>
                    <button 
                        onClick={getNextNumber}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#FFD700',  // Golden yellow
                            color: 'black',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Next Number
                    </button>
                    <button 
                        onClick={() => handleIntervalChange(Math.max(10, changeInterval - 5))}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#FFD700',
                            color: 'black',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Decrease Interval
                    </button>
                    <button 
                        onClick={() => handleIntervalChange(Math.min(120, changeInterval + 5))}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#FFD700',
                            color: 'black',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Increase Interval
                    </button>
                    <button 
                        onClick={toggleActive}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#FFD700',
                            color: 'black',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        {isActive ? 'Pause' : 'Resume'}
                    </button>
                    <button 
                        onClick={handleResetRound}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#FFD700',
                            color: 'black',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Reset Round
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TopicMode;