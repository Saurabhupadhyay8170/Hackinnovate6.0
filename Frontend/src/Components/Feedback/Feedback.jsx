import React, { useState } from 'react';
import axios from 'axios';

const Feedback = ({ documentId, userId }) => {
  const [vote, setVote] = useState(5);
  const [suggestion, setSuggestion] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/feedback/submit`,
        {
          documentId,
          vote,
          suggestion,
          userId, // optional; pass if the reader is logged in
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      setMessage(response.data.message);
      setVote(5);
      setSuggestion('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setMessage('Error submitting feedback');
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">Give Your Feedback</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-medium">Vote (1 to 5):</label>
          <input
            type="number"
            min="1"
            max="5"
            value={vote}
            onChange={(e) => setVote(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium">Plot Suggestion:</label>
          <textarea
            value={suggestion}
            onChange={(e) => setSuggestion(e.target.value)}
            className="border p-2 rounded w-full"
            placeholder="Enter your plot suggestion..."
          ></textarea>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Feedback
        </button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
};

export default Feedback;
