import React, { useState } from 'react';
import './OrganizeBattle.css';

function OrganizeBattle() {
  const [battleSetup, setBattleSetup] = useState({
    name: '',
    format: '16', // '8' or '16'
    judges: [],
    battlers: [],
    currentStage: 'setup' // 'setup', 'preliminary', 'bracket', 'finished'
  });

  const [newJudge, setNewJudge] = useState('');
  const [newBattler, setNewBattler] = useState('');
  const [preliminaryScores, setPreliminaryScores] = useState({});
  const [bracketMatches, setBracketMatches] = useState([]);
  const [selectedJudge, setSelectedJudge] = useState(null);

  const addJudge = () => {
    if (newJudge.trim() && battleSetup.judges.length < 5) {
      setBattleSetup(prev => ({
        ...prev,
        judges: [...prev.judges, { id: Date.now(), name: newJudge.trim() }]
      }));
      setNewJudge('');
    }
  };

  const removeJudge = (id) => {
    setBattleSetup(prev => ({
      ...prev,
      judges: prev.judges.filter(j => j.id !== id)
    }));
  };

  const addBattler = () => {
    if (newBattler.trim()) {
      const newBattlerId = Date.now();
      setBattleSetup(prev => ({
        ...prev,
        battlers: [...prev.battlers, { id: newBattlerId, name: newBattler.trim() }]
      }));
      
      // If we're in preliminary stage, initialize scores for the new battler
      if (battleSetup.currentStage === 'preliminary') {
        setPreliminaryScores(prev => {
          const newScores = { ...prev, [newBattlerId]: {} };
          battleSetup.judges.forEach(judge => {
            newScores[newBattlerId][judge.id] = 0;
          });
          return newScores;
        });
      }
      
      setNewBattler('');
    }
  };

  const removeBattler = (id) => {
    setBattleSetup(prev => ({
      ...prev,
      battlers: prev.battlers.filter(b => b.id !== id)
    }));
  };

  const startPreliminary = () => {
    if (battleSetup.judges.length >= 1 && battleSetup.battlers.length >= 2) {
      setBattleSetup(prev => ({ ...prev, currentStage: 'preliminary' }));
      
      const initialScores = {};
      battleSetup.battlers.forEach(battler => {
        initialScores[battler.id] = {};
        battleSetup.judges.forEach(judge => {
          initialScores[battler.id][judge.id] = 0;
        });
      });
      setPreliminaryScores(initialScores);
    }
  };

  const updateScore = (battlerId, judgeId, score) => {
    setPreliminaryScores(prev => ({
      ...prev,
      [battlerId]: {
        ...prev[battlerId],
        [judgeId]: parseInt(score) || 0
      }
    }));
  };

  const calculateAverageScore = (battlerId) => {
    const scores = Object.values(preliminaryScores[battlerId] || {});
    if (scores.length === 0) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
  };

  const generateBracket = () => {
    // Sort battlers by average score (highest first)
    const sortedBattlers = [...battleSetup.battlers].sort((a, b) => {
      return calculateAverageScore(b.id) - calculateAverageScore(a.id);
    });

    // Take only the top battlers based on tournament format
    const formatSize = parseInt(battleSetup.format);
    const topBattlers = sortedBattlers.slice(0, formatSize);
    
    const matches = [];
    if (battleSetup.format === '16') {
      // 16-person tournament: 1/8 finals
      for (let i = 0; i < 8; i++) {
        matches.push({
          id: `round16-${i}`,
          round: '1/8',
          battler1: topBattlers[i],
          battler2: topBattlers[15 - i],
          votes: {},
          winner: null
        });
      }
    } else {
      // 8-person tournament: straight to semifinals
      const groupA = topBattlers.slice(0, 4);
      const groupB = topBattlers.slice(4, 8);
      
      matches.push(
        { id: 'semi-1', round: '1/2', battler1: groupA[0], battler2: groupB[1], votes: {}, winner: null },
        { id: 'semi-2', round: '1/2', battler1: groupB[0], battler2: groupA[1], votes: {}, winner: null }
      );
    }
    
    setBracketMatches(matches);
    setBattleSetup(prev => ({ ...prev, currentStage: 'bracket' }));
  };

  const submitVote = (matchId, winnerId) => {
    if (!selectedJudge && battleSetup.judges.length > 1) {
      alert('Please select a judge first');
      return;
    }
    
    // If only one judge, use their ID automatically
    const judgeId = battleSetup.judges.length === 1 ? battleSetup.judges[0].id : selectedJudge;
    
    setBracketMatches(prev => prev.map(match => {
      if (match.id === matchId) {
        const newVotes = { ...match.votes, [judgeId]: winnerId };
        const voteCounts = {};
        Object.values(newVotes).forEach(vote => {
          voteCounts[vote] = (voteCounts[vote] || 0) + 1;
        });
        
        // Determine winner based on judge count
        let winner = null;
        if (battleSetup.judges.length === 1) {
          // Single judge - immediate winner
          winner = winnerId;
        } else {
          // Multiple judges - need majority
          const majorityNeeded = Math.ceil(battleSetup.judges.length / 2);
          Object.entries(voteCounts).forEach(([battlerId, count]) => {
            if (count >= majorityNeeded) {
              winner = parseInt(battlerId);
            }
          });
        }
        
        return { ...match, votes: newVotes, winner };
      }
      return match;
    }));
  };

  const advanceToNextRound = () => {
    const currentRoundComplete = bracketMatches.every(match => match.winner !== null);
    if (!currentRoundComplete) return;

    const winners = bracketMatches
      .filter(match => match.winner)
      .map(match => battleSetup.battlers.find(b => b.id === match.winner));

    const newMatches = [];
    
    if (bracketMatches[0].round === '1/8' && winners.length === 8) {
      for (let i = 0; i < 4; i++) {
        newMatches.push({
          id: `quarter-${i}`,
          round: '1/4',
          battler1: winners[i * 2],
          battler2: winners[i * 2 + 1],
          votes: {},
          winner: null
        });
      }
    } else if (bracketMatches[0].round === '1/4' && winners.length === 4) {
      newMatches.push(
        { id: 'semi-1', round: '1/2', battler1: winners[0], battler2: winners[1], votes: {}, winner: null },
        { id: 'semi-2', round: '1/2', battler1: winners[2], battler2: winners[3], votes: {}, winner: null }
      );
    } else if (bracketMatches[0].round === '1/2' && winners.length === 2) {
      const losers = bracketMatches
        .map(match => [match.battler1, match.battler2].find(b => b.id !== match.winner))
        .filter(Boolean);
      
      newMatches.push(
        { id: 'third-place', round: '3rd Place', battler1: losers[0], battler2: losers[1], votes: {}, winner: null },
        { id: 'final', round: 'Final', battler1: winners[0], battler2: winners[1], votes: {}, winner: null }
      );
    }
    
    if (newMatches.length > 0) {
      setBracketMatches(newMatches);
    } else {
      setBattleSetup(prev => ({ ...prev, currentStage: 'finished' }));
    }
  };

  return (
    <div className="organize-battle">
      <h2>Organize Battle</h2>
      
      {battleSetup.currentStage === 'setup' && (
        <div className="setup-stage">
          <div className="battle-config">
            <label>
              Battle Name:
              <input
                type="text"
                value={battleSetup.name}
                onChange={(e) => setBattleSetup(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter battle name"
              />
            </label>
            
            <label>
              Format:
              <select
                value={battleSetup.format}
                onChange={(e) => setBattleSetup(prev => ({ ...prev, format: e.target.value }))}
              >
                <option value="8">8 Person Tournament</option>
                <option value="16">16 Person Tournament</option>
              </select>
            </label>
          </div>

          <div className="judges-section">
            <h3>Judges ({battleSetup.judges.length}/5)</h3>
            <div className="add-item">
              <input
                type="text"
                value={newJudge}
                onChange={(e) => setNewJudge(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addJudge()}
                placeholder="Judge name"
              />
              <button onClick={addJudge}>Add Judge</button>
            </div>
            <ul className="item-list">
              {battleSetup.judges.map(judge => (
                <li key={judge.id}>
                  {judge.name}
                  <button onClick={() => removeJudge(judge.id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="battlers-section">
            <h3>Battlers ({battleSetup.battlers.length})</h3>
            <div className="add-item">
              <input
                type="text"
                value={newBattler}
                onChange={(e) => setNewBattler(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBattler()}
                placeholder="Battler name"
              />
              <button onClick={addBattler}>Add Battler</button>
            </div>
            <ul className="item-list">
              {battleSetup.battlers.map(battler => (
                <li key={battler.id}>
                  {battler.name}
                  <button onClick={() => removeBattler(battler.id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>

          <button 
            className="start-button"
            onClick={startPreliminary}
            disabled={battleSetup.judges.length < 1 || battleSetup.battlers.length < 2}
          >
            Start Preliminary Stage
          </button>
        </div>
      )}

      {battleSetup.currentStage === 'preliminary' && (
        <div className="preliminary-stage">
          <h3>Preliminary Stage - Judge Scoring</h3>
          <p className="stage-info">
            Top {battleSetup.format} battlers will advance to the tournament bracket
          </p>
          
          <div className="add-battler-section">
            <h4>Add Late Battler</h4>
            <div className="add-item">
              <input
                type="text"
                value={newBattler}
                onChange={(e) => setNewBattler(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBattler()}
                placeholder="New battler name"
              />
              <button onClick={addBattler}>Add Battler</button>
            </div>
          </div>

          <div className="scoring-grid">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Battler</th>
                  {battleSetup.judges.map(judge => (
                    <th key={judge.id}>{judge.name}</th>
                  ))}
                  <th>Average</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {battleSetup.battlers
                  .sort((a, b) => calculateAverageScore(b.id) - calculateAverageScore(a.id))
                  .map((battler, index) => {
                    const qualifies = index < parseInt(battleSetup.format);
                    return (
                      <tr key={battler.id} className={qualifies ? 'qualifies' : 'eliminated'}>
                        <td>{index + 1}</td>
                        <td>{battler.name}</td>
                        {battleSetup.judges.map(judge => (
                          <td key={judge.id}>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={preliminaryScores[battler.id]?.[judge.id] || ''}
                              onChange={(e) => updateScore(battler.id, judge.id, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="average-score">{calculateAverageScore(battler.id)}</td>
                        <td className="status">
                          {qualifies ? '✓ Qualifies' : '✗ Eliminated'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <button className="advance-button" onClick={generateBracket}>
            Generate Tournament Bracket (Top {battleSetup.format})
          </button>
        </div>
      )}

      {battleSetup.currentStage === 'bracket' && (
        <div className="bracket-stage">
          <h3>Tournament Bracket - {bracketMatches[0]?.round}</h3>
          
          {battleSetup.judges.length > 1 && (
            <div className="judge-selector">
              <h4>Select Judge to Vote:</h4>
              <div className="judge-buttons">
                {battleSetup.judges.map(judge => (
                  <button
                    key={judge.id}
                    className={`judge-button ${selectedJudge === judge.id ? 'selected' : ''}`}
                    onClick={() => setSelectedJudge(judge.id)}
                  >
                    {judge.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {battleSetup.judges.length === 1 && (
            <div className="single-judge-info">
              <p>Judge: <strong>{battleSetup.judges[0].name}</strong></p>
            </div>
          )}

          <div className="matches">
            {bracketMatches.map(match => (
              <div key={match.id} className="match-card">
                <h4>{match.round}</h4>
                <div className="match-battlers">
                  <button
                    className={`battler ${match.winner === match.battler1.id ? 'winner' : ''}`}
                    onClick={() => submitVote(match.id, match.battler1.id)}
                  >
                    {match.battler1.name}
                  </button>
                  <span>VS</span>
                  <button
                    className={`battler ${match.winner === match.battler2.id ? 'winner' : ''}`}
                    onClick={() => submitVote(match.id, match.battler2.id)}
                  >
                    {match.battler2.name}
                  </button>
                </div>
                <div className="vote-status">
                  {battleSetup.judges.map(judge => (
                    <div key={judge.id} className="judge-vote">
                      <span className="judge-name">{judge.name}:</span>
                      <span className="vote-choice">
                        {match.votes[judge.id] ? 
                          battleSetup.battlers.find(b => b.id === match.votes[judge.id])?.name : 
                          'Not voted'}
                      </span>
                    </div>
                  ))}
                </div>
                {match.winner && (
                  <div className="match-result">
                    Winner: {battleSetup.battlers.find(b => b.id === match.winner)?.name}
                  </div>
                )}
              </div>
            ))}
          </div>
          {bracketMatches.every(match => match.winner !== null) && (
            <button className="advance-button" onClick={advanceToNextRound}>
              Advance to Next Round
            </button>
          )}
        </div>
      )}

      {battleSetup.currentStage === 'finished' && (
        <div className="finished-stage">
          <h3>Battle Complete!</h3>
          <div className="final-results">
            <h4>Final Results</h4>
            {bracketMatches.find(m => m.round === 'Final') && (
              <div className="result-item">
                🥇 Champion: {battleSetup.battlers.find(b => b.id === bracketMatches.find(m => m.round === 'Final').winner)?.name}
              </div>
            )}
            {bracketMatches.find(m => m.round === '3rd Place') && (
              <div className="result-item">
                🥉 3rd Place: {battleSetup.battlers.find(b => b.id === bracketMatches.find(m => m.round === '3rd Place').winner)?.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrganizeBattle;