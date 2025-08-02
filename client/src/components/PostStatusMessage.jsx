import React, { useEffect, useState } from 'react';

const PostStatusMessage = ({ message, type }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000); // Message disappears after 5 seconds
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg text-white font-semibold ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
      {message}
    </div>
  );
};

export default PostStatusMessage;