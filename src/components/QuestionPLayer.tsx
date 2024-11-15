import React, { useEffect, useRef } from 'react';

const QuestionPlayer = ({ questions, questionPosition }) => {
  const [hasVideo, setHasVideo] = React.useState(false);
  const [audioError, setAudioError] = React.useState(null);
  const audioRefQuestion = useRef(null);

  // Function to handle audio loading with fetch first
  const loadAudio = async (audioUrl) => {
    try {
      // First try to fetch the audio to check if it's accessible
      const response = await fetch(audioUrl, {
        // Minimize headers
        headers: {
          'Accept': 'audio/*',
        },
        // Add cache control
        cache: 'force-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error pre-loading audio:', error);
      setAudioError(error.message);
      return false;
    }
  };

  useEffect(() => {
    const currentQuestion = questions[questionPosition];
    let isComponentMounted = true;
    
    const handleQuestion = async () => {
      // First determine if there's a video
      const hasVideoContent = currentQuestion?.question_video && 
                            currentQuestion.question_video.length > 0;
      
      // Update hasVideo state
      if (isComponentMounted) {
        setHasVideo(hasVideoContent);
      }

      // Only proceed with audio if there's no video
      if (!hasVideoContent && currentQuestion?.question_audio) {
        // Pre-check the audio URL
        const audioIsValid = await loadAudio(currentQuestion.question_audio);

        if (!audioIsValid || !isComponentMounted) {
          return;
        }

        try {
          if (audioRefQuestion.current) {
            console.log("Playing audio as no video is present");
            
            // Reset audio state
            audioRefQuestion.current.pause();
            audioRefQuestion.current.currentTime = 0;
            
            // Load and play with error handling
            await audioRefQuestion.current.load();
            
            const playPromise = audioRefQuestion.current.play();
            
            if (playPromise !== undefined) {
              playPromise.catch((error) => {
                console.log("Playback prevented:", error);
                if (isComponentMounted) {
                  setAudioError(error.message);
                }
              });
            }
          }
        } catch (error) {
          console.error("Error playing audio:", error);
          if (isComponentMounted) {
            setAudioError(error.message);
          }
        }
      } else {
        console.log("Audio will not play as video content exists:", hasVideoContent);
      }
    };

    handleQuestion();

    // Cleanup function
    return () => {
      isComponentMounted = false;
      if (audioRefQuestion.current) {
        audioRefQuestion.current.pause();
        audioRefQuestion.current.src = '';
      }
    };
  }, [questionPosition, questions]);

  return (
    <>
      <audio
        ref={audioRefQuestion}
        // Add these attributes for better performance
        preload="metadata"
        onError={(e) => setAudioError(e.currentTarget.error?.message)}
      />
      {audioError && (
        <div className="text-red-500 text-sm mt-2">
          Error loading audio: {audioError}
        </div>
      )}
    </>
  );
};

export default QuestionPlayer;
