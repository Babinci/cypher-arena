import React, { useState } from 'react';
import apiConfig from '../../config/apiConfig';

function ReportFeedback() {
  const [nickname, setNickname] = useState('');
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.createFeedback}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, feedback }),
      });
      if (response.ok) {
        setMessage('Feedback submitted successfully!');
        setNickname('');
        setFeedback('');
      } else {
        setMessage('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Report Feedback</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nickname">Nickname (max 100 characters):</label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 100))}
            maxLength={100}
            required
          />
        </div>
        <div>
          <label htmlFor="feedback">Feedback (max 2000 characters):</label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value.slice(0, 2000))}
            maxLength={2000}
            required
          />
        </div>
        <button type="submit">Submit Feedback</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ReportFeedback;