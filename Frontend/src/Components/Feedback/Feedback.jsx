import React, { useState, useEffect } from "react";
import axios from "axios";

const FeedbackDisplay = ({ feedbacks }) => {
  if (!feedbacks?.length) {
    return <p className="text-gray-500">No feedback received yet.</p>;
  }

  return (
    <div className="space-y-4">
      {feedbacks.map((feedback, index) => (
        <div key={index} className="border p-4 rounded-lg bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-600">
                {feedback.username || 'Anonymous'}
              </span>
              <span className="text-gray-400">•</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-xl ${
                      i < feedback.vote ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(feedback.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-2">
            <p className="text-gray-700">{feedback.suggestion}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const Feedback = ({ documentId, userId, userRole }) => {
  const [vote, setVote] = useState(5);
  const [suggestion, setSuggestion] = useState("");
  const [message, setMessage] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get username from localStorage when component mounts
    const user = JSON.parse(localStorage.getItem('user'));
    setUsername(user?.username || 'Anonymous');
    
    if (userRole === "author") {
      fetchFeedbacks();
    }
  }, [documentId, userRole]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/feedback/${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Fetched feedbacks:', response.data);
      setFeedbacks(response.data);
    } catch (error) {
      console.error("Error fetching feedbacks:", error);
      setError("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userId) {
      setMessage("Please log in to submit feedback");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/feedback/submit`,
        {
          documentId,
          vote,
          suggestion,
          userId,
          username,
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Feedback submitted:', response.data);
      setMessage("Feedback submitted successfully!");
      setVote(5);
      setSuggestion("");
      
      // Refresh feedbacks if user is author
      if (userRole === "author") {
        fetchFeedbacks();
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError(error.response?.data?.message || "Error submitting feedback");
      setMessage("Error submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  if (userRole && userRole !== "reader" && userRole !== "author") {
    return null;
  }

  return (
    <div className="p-4 border rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">
        {userRole === "author" ? "Reader Feedbacks" : "Submit Feedback"}
      </h3>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {userRole === "author" ? (
        <FeedbackDisplay feedbacks={feedbacks} />
      ) : (
        <>
          {!userId ? (
            <p className="text-red-600 mb-4">
              Please log in to submit feedback
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-medium">Rating (1 to 5):</label>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setVote(index + 1)}
                      className="text-2xl focus:outline-none"
                    >
                      <span
                        className={`${
                          index < vote ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block font-medium">Feedback:</label>
                <textarea
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  className="border p-2 rounded w-full min-h-[100px]"
                  placeholder="Enter your feedback..."
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 text-white px-4 py-2 rounded ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          )}
          {message && (
            <p
              className={`mt-4 ${
                message.includes("Error") ? "text-red-600" : "text-green-600"
              }`}
            >
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default Feedback;
