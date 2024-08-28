import React, { useState, useEffect } from 'react';
import apiConfig from '../../config/apiConfig';

function ReportFeedback() {
  const [nickname, setNickname] = useState('');
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Function to get CSRF token from cookies
    const getCsrfToken = () => {
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
    };

    setCsrfToken(getCsrfToken());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.endpoints.createFeedback}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ nickname, feedback }),
        credentials: 'include', // This is important for including cookies in the request
      });
      if (response.ok) {
        setMessage('Feedback submitted successfully!');
        setNickname('');
        setFeedback('');
      } else {
        const errorData = await response.json();
        setMessage(`Failed to submit feedback. ${errorData.detail || 'Please try again.'}`);
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