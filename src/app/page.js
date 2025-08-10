"use client";

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Home() {
  // State management
  const [prompt, setPrompt] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [ttsLoading, setTtsLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const audioRef = useRef(null);

  // Sample prompts
  const sampleTTSPrompts = [
    'Welcome to the future of AI.',
    'A soothing voice narrating a story.',
    'A robot explaining quantum physics.',
  ];

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('ttsHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save to history function
  const saveToHistory = (newItem) => {
    const updatedHistory = [newItem, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('ttsHistory', JSON.stringify(updatedHistory));
  };

  // TTS handler
  const handleGenerateTTS = async () => {
    if (!prompt) {
      toast.error('Please enter a text prompt');
      return;
    }
    setTtsLoading(true);
    setAudioUrl('');

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: prompt }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate audio');
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      saveToHistory({ prompt, audioUrl, type: 'tts', timestamp: Date.now() });
      toast.success('Audio generated successfully!');
    } catch (err) {
      console.error('Frontend TTS error:', err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-white mb-8">
          AI Text-to-Speech Generator
        </h1>

        {/* Input Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your text prompt here..."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            rows={4}
          />
        </div>

        {/* Buttons Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <button
            onClick={handleGenerateTTS}
            disabled={ttsLoading || !prompt}
            className={`w-full p-3 text-white font-semibold rounded-lg flex items-center justify-center transition-all duration-300 ${
              ttsLoading || !prompt
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700'
            }`}
            aria-label={ttsLoading ? 'Generating audio' : 'Generate audio'}
          >
            {ttsLoading ? (
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                />
              </svg>
            ) : null}
            {ttsLoading ? 'Generating Audio...' : 'Generate Audio'}
          </button>
        </div>

        {/* Generated Audio Section */}
        {audioUrl && (
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-3">Generated Audio:</h3>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full max-w-md mx-auto rounded-lg border border-gray-200 dark:border-gray-600"
            />
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = audioUrl;
                link.download = 'generated-audio.mp3';
                link.click();
              }}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              aria-label="Download generated audio"
            >
              Download Audio
            </button>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                  <audio
                    src={item.audioUrl}
                    controls
                    className="w-full rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 truncate">{item.prompt}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}