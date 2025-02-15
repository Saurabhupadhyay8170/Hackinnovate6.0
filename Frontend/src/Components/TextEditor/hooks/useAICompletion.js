import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const useAICompletion = (editor) => {
  const [aiConfig, setAIConfig] = useState({
    isEnabled: false,
    isLoading: false,
    suggestion: '',
    context: '',
    showSuggestion: false,
    cursorPosition: { x: 0, y: 0 }
  });

  const abortControllerRef = useRef(null);
  const contextCache = useRef(new Map());

  // Pre-warm the API connection
  useEffect(() => {
    const preWarmConnection = async () => {
      try {
        await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          { contents: [{ parts: [{ text: "Hello" }] }] }
        );
      } catch (error) {
        console.error("Pre-warm connection failed:", error);
      }
    };
    preWarmConnection();
  }, []);

  const getSmartPrompt = (text, previousContext) => {
    const words = text.split(' ');
    const lastWords = words.slice(-10).join(' '); // Get last 10 words for immediate context
    
    return `Given the current writing context:
    Previous text: "${previousContext}"
    Current text: "${lastWords}"

    Task: Continue this text naturally by predicting the next few words.
    Requirements:
    - Match the writing style exactly
    - Keep the same technical level
    - Maintain consistent tone
    - Be concise and direct
    - Focus on completing the current thought
    - No repetition

    Provide ONLY the continuation text without any explanations or quotes.`;
  };

  const fetchSuggestion = async (text, signal) => {
    const cacheKey = text.trim();
    if (contextCache.current.has(cacheKey)) {
      return contextCache.current.get(cacheKey);
    }

    const previousContext = text.split('\n').slice(-2, -1)[0] || '';
    const prompt = getSmartPrompt(text, previousContext);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 50,
            topP: 0.8,
            topK: 40,
            stopSequences: ["\n", ".", "!", "?"],
            candidateCount: 1,
            streamingResponse: true
          }
        },
        {
          signal,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const suggestion = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (suggestion) {
        contextCache.current.set(cacheKey, suggestion);
        if (contextCache.current.size > 100) {
          const firstKey = contextCache.current.keys().next().value;
          contextCache.current.delete(firstKey);
        }
      }
      return suggestion;
    } catch (error) {
      if (error.name === 'AbortError') {
        return null;
      }
      throw error;
    }
  };

  const debouncedFetch = useCallback(
    debounce(async (text, updateState) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const suggestion = await fetchSuggestion(text, abortControllerRef.current.signal);
        if (suggestion) {
          updateState(suggestion);
        }
      } catch (error) {
        console.error("Error fetching AI completion:", error);
      }
    }, 150), // Reduced debounce time for faster response
    []
  );

  const triggerAISuggestion = useCallback(async () => {
    if (!editor) return;
    
    setAIConfig(prev => ({ ...prev, isLoading: true }));
    const selection = editor.state.selection;
    const pos = editor.view.coordsAtPos(selection.anchor);
    const text = editor.getText();

    debouncedFetch(text, (suggestion) => {
      setAIConfig(prev => ({
        ...prev,
        suggestion,
        showSuggestion: true,
        isLoading: false,
        context: text.split('\n').pop() || '',
        cursorPosition: { x: pos.left, y: pos.top }
      }));
    });
  }, [editor, debouncedFetch]);

  const handleKeyboardShortcuts = useCallback((event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === '/') {
      event.preventDefault();
      setAIConfig(prev => {
        const newState = { ...prev, isEnabled: !prev.isEnabled };
        if (!newState.isEnabled) {
          newState.showSuggestion = false;
          newState.suggestion = '';
          newState.context = '';
        } else {
          // Immediately trigger suggestion when enabling
          setTimeout(() => triggerAISuggestion(), 0);
        }
        return newState;
      });
    }
  }, [triggerAISuggestion]);

  const acceptSuggestion = useCallback(() => {
    if (!editor || !aiConfig.suggestion) return;
    
    editor.commands.insertContent(aiConfig.suggestion);
    setAIConfig(prev => ({
      ...prev,
      showSuggestion: false,
      suggestion: '',
      context: ''
    }));

    // Immediately trigger next suggestion
    setTimeout(() => triggerAISuggestion(), 0);
  }, [editor, aiConfig.suggestion, triggerAISuggestion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      contextCache.current.clear();
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  return {
    aiConfig,
    setAIConfig,
    triggerAISuggestion,
    handleKeyboardShortcuts,
    acceptSuggestion
  };
}; 