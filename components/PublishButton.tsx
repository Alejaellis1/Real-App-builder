import React, { useState, useEffect } from 'react';

// Define the props interface for the component
interface PublishButtonProps {
  stripeCustomerId: string;
  initialUrl: string | null;
}

/**
 * A button component to publish or update the user's app.
 * It handles the API call, loading state, and displays success or error messages.
 */
const PublishButton: React.FC<PublishButtonProps> = ({ stripeCustomerId, initialUrl }) => {
  // State to manage the API request lifecycle
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(initialUrl);
  const [error, setError] = useState<string | null>(null);

  // Effect to update the URL state if the initial prop changes
  useEffect(() => {
    setLiveUrl(initialUrl);
  }, [initialUrl]);

  /**
   * Handles the button click event to initiate the publishing process.
   */
  const handlePublish = async () => {
    // Reset state and set loading to true
    setIsLoading(true);
    setError(null);

    try {
      // Call the serverless API endpoint
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stripeCustomerId }),
      });

      // Parse the JSON response from the server
      const data = await response.json();

      // Check if the request was successful
      if (!response.ok) {
        // Throw an error with the message from the API, or a default message
        throw new Error(data.message || 'An unexpected error occurred.');
      }

      // On success, store the returned live URL
      if (data.url) {
        setLiveUrl(data.url);
        // Alert the user about the successful publication
        alert("Your app is now live! For the best experience, you and your clients can add it to your phone's home screen.");
      } else {
        throw new Error('The deployment was successful, but no URL was returned.');
      }

    } catch (err: any) {
      // Set the error message to be displayed to the user
      setError(err.message);
    } finally {
      // Set loading to false once the request is complete
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4">
      <button
        onClick={handlePublish}
        disabled={isLoading}
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          backgroundColor: isLoading ? '#a5b4fc' : '#4f46e5', // Lighter indigo when disabled
          color: 'white',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: '600',
          border: 'none',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4338ca'; }}
        onMouseOut={e => { if (!isLoading) e.currentTarget.style.backgroundColor = '#4f46e5'; }}
      >
        {isLoading ? (liveUrl ? 'Updating...' : 'Publishing...') : (liveUrl ? 'Update App' : 'Publish My App')}
      </button>

      {/* Success Message: Display the live URL */}
      {liveUrl && !isLoading && !error && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-md">
          <p className="font-semibold">App is Live!</p>
          <p>
            Your app is available at:{' '}
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-mono break-all hover:text-green-900"
            >
              {liveUrl}
            </a>
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
          <p className="font-semibold">{liveUrl ? 'Update Failed' : 'Publishing Failed'}</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default PublishButton;
