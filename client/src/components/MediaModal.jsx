import React, { useState } from 'react';

const MediaModal = ({ mediaUrls, mediaTypes, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const currentUrl = mediaUrls[currentIndex];
  const currentType = mediaTypes[currentIndex];

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaUrls.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mediaUrls.length) % mediaUrls.length);
  };
  
  const renderMedia = (url, type) => {
    switch (type) {
      case 'image':
        return <img src={url} alt="Full-screen media" className="max-w-full max-h-full object-contain" />;
      case 'video':
        return <video src={url} controls className="max-w-full max-h-full" />;
      case 'audio':
        return <audio src={url} controls className="max-w-full" />;
      case 'document':
      case 'pdf':
        return <iframe src={url} className="w-full h-full border-0"></iframe>;
      default:
        return <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">Unsupported File Type</div>;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <button onClick={onClose} className="absolute top-4 right-4 text-white bg-gray-800 bg-opacity-50 hover:bg-opacity-75 transition-colors p-2 rounded-full text-xl leading-none">&times;</button>
      
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {renderMedia(currentUrl, currentType)}
        
        {mediaUrls.length > 1 && (
            <>
                <button onClick={goToPrev} className="absolute left-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 focus:outline-none">
                    &lt;
                </button>
                <button onClick={goToNext} className="absolute right-4 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 focus:outline-none">
                    &gt;
                </button>
            </>
        )}
      </div>
    </div>
  );
};

export default MediaModal;