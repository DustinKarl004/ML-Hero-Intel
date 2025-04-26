import { useState } from 'react';
import { FaUser, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';

export default function HeroComments({ hero }) {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [comments, setComments] = useState(hero.comments || []);
  
  // Sort comments by timestamp (newest first)
  const sortedComments = [...comments].sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      // Create a new comment object
      const newComment = {
        userName: 'Guest User',
        userPhotoURL: null,
        content: comment,
        timestamp: new Date().toISOString()
      };
      
      // Add the new comment to the list
      setComments([...comments, newComment]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Community Discussion</h3>
      
      {/* Add comment form */}
      <div className="mb-8">
        <h4 className="text-lg font-medium mb-3">Add Your Comment</h4>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experiences, tips, or questions about this hero..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              required
            ></textarea>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="button-primary flex items-center"
              disabled={submitting}
            >
              <FaPaperPlane className="mr-2" />
              {submitting ? 'Submitting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Comments list */}
      <div>
        <h4 className="text-lg font-medium mb-3">
          {sortedComments.length} 
          {sortedComments.length === 1 ? ' Comment' : ' Comments'}
        </h4>
        
        {sortedComments.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedComments.map((comment, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                    {comment.userPhotoURL ? (
                      <img 
                        src={comment.userPhotoURL} 
                        alt={comment.userName} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <FaUser className="text-primary-600" size={14} />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{comment.userName}</span>
                    <div className="flex items-center text-gray-500 text-xs">
                      <FaCalendarAlt className="mr-1" size={10} />
                      {new Date(comment.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 