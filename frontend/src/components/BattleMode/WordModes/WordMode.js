import React, { useState, useEffect, useCallback } from 'react';
import apiConfig from '../../../config/apiConfig';
import { useWordTimer, useRoundTimer } from '../TimerSettings/useTimers';

function WordMode() {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [changeInterval, setChangeInterval] = useState(10);
  const [roundDuration, setRoundDuration] = useState(90);
  const [isActive, setIsActive] = useState(true);
  const [timer, resetWordTimer] = useWordTimer(changeInterval, isActive);
  const [roundTimer, resetRoundTimer] = useRoundTimer(roundDuration, () => {
    setIsActive(false);  // Stop word changes when round ends
  });

  const fetchWords = useCallback(() => {
    fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.getRandomWord}`)
      .then(response => response.json())
      .then(data => {
        setWords(data.words);
        setCurrentWord(data.words[0]);  // Set the first word from the fetched list
      })
      .catch(error => console.error('Error fetching words:', error));
  }, []);

  useEffect(() => {
    fetchWords();
  }, [fetchWords]);

  const getNextWord = useCallback(() => {
    let wordIndex = words.indexOf(currentWord) + 1;
    if (wordIndex < words.length) {
      setCurrentWord(words[wordIndex]);
    } else {
      fetchWords();  // Fetch new words when list is exhausted
    }
  }, [words, currentWord, fetchWords]);

  useEffect(() => {
    if (timer === 0 && isActive) {
      getNextWord();
      resetWordTimer();
    }
  }, [timer, isActive, getNextWord, resetWordTimer]);

  const handleIntervalChange = useCallback((increment) => {
    const intervals = [5, 10, 20, 30, 40, 60, 90, 120, 180, 300];
    let index = intervals.indexOf(changeInterval);
    if (increment && index < intervals.length - 1) {
      setChangeInterval(intervals[index + 1]);
    } else if (!increment && index > 0) {
      setChangeInterval(intervals[index - 1]);
    }
  }, [changeInterval]);

  const handleRoundDurationChange = (event) => {
    const value = event.target.value === "300" ? Infinity : parseInt(event.target.value);
    setRoundDuration(value);
    resetRoundTimer(value);
  };

  const resetRound = () => {
    resetRoundTimer(roundDuration);
    resetWordTimer(changeInterval);
    setIsActive(true);  // Re-activate the word changes
    getNextWord();  // Move to the next word on reset
  };

  return (
    <div>
      <div className="circle">
        <div className="word">{currentWord}</div>
        <div className="timer">{timer}</div>
      </div>
      <div className="control-panel">
        <div>Current Interval: {changeInterval} seconds</div>
        <div>Total Time Left: {roundDuration === Infinity ? 'Infinity' : `${roundTimer} seconds`}</div>
        <button onClick={() => handleIntervalChange(true)}>Increase Interval</button>
        <button onClick={() => handleIntervalChange(false)}>Decrease Interval</button>
        <input type="range" min="10" max="300" value={roundDuration === Infinity ? 300 : roundDuration} onChange={handleRoundDurationChange} />
        <button onClick={resetRound}>Reset Round</button>
      </div>
    </div>
  );
}

export default WordMode;