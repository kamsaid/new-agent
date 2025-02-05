import React, { useState, useEffect } from 'react';
import { LettaClient, LettaError } from '@letta-ai/letta-client';
import {
  AssistantMessage,
  ReasoningMessage,
  ToolCallMessage,
  ToolReturnMessage,
} from '@letta-ai/letta-client/api/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  reasoning?: string; // Add reasoning for displaying agent thoughts
}

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [client, setClient] = useState<LettaClient | null>(null);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeLetta = async () => {
      try {
        // Initialize the Letta client
        const newClient = new LettaClient({
          ...(import.meta.env.VITE_LETTA_API_KEY && {
            token: import.meta.env.VITE_LETTA_API_KEY
          }),
          baseUrl: import.meta.env.DEV ? '' : import.meta.env.VITE_LETTA_BASE_URL,
          maxRetries: 2,
          timeoutInSeconds: 30
        });
        
        setClient(newClient);

        // Create a new agent with proper configuration
        const agent = await newClient.agents.create({
          model: import.meta.env.VITE_LETTA_MODEL || 'openai/gpt-4',
          embedding: 'openai/text-embedding-ada-002',
          memoryBlocks: [
            {
              value: 'You are Yaseen, an AI powered mentor. You are helpful, friendly, and knowledgeable.',
              label: 'system'
            }
          ]
        });

        console.log('Created agent with name:', agent.name);
        setAgentId(agent.id);
        setError(null);
      } catch (err) {
        console.error('Error initializing Letta:', err);
        if (err instanceof LettaError) {
          setError(`Failed to initialize chat: ${err.message}`);
        } else {
          setError('Failed to initialize chat. Please try again later.');
        }
      }
    };

    initializeLetta();

    return () => {
      if (client && agentId) {
        client.agents.delete(agentId).catch(console.error);
      }
    };
  }, []);

  const createMessage = (text: string, sender: 'user' | 'agent', reasoning?: string): Message => ({
    id: new Date().toISOString(),
    text,
    sender,
    timestamp: new Date(),
    reasoning
  });

  const handleSendMessage = async () => {
    if (!input.trim() || !client || !agentId) return;

    const userMessage = createMessage(input.trim(), 'user');
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Send user message to the Letta agent API
      const response = await client.agents.messages.create(agentId, {
        messages: [
          {
            role: 'user',
            content: userMessage.text,
          },
        ],
      });

      // Log the response for debugging purposes
      console.log('Response from Letta agent:', response);

      // Ensure that we received at least one message from the agent
      if (response.messages && response.messages.length > 0) {
        let assistantMessage: AssistantMessage; // This will hold the AI's reply
        let reasoning: string | undefined = undefined; // Optionally hold reasoning text

        // If more than one message exists, assume first is reasoning and second is reply
        if (response.messages.length > 1) {
          reasoning = (response.messages[0] as ReasoningMessage).reasoning;
          assistantMessage = response.messages[1] as AssistantMessage;
        } else {
          // If only one message is present, use it as the assistant reply
          assistantMessage = response.messages[0] as AssistantMessage;
        }

        // Process the assistant's message content ensuring a valid string is obtained
        let content: string;
        if (typeof assistantMessage.content === 'string') {
          content = assistantMessage.content; // Directly use string content
        } else if (Array.isArray(assistantMessage.content)) {
          // Concatenate text from array of content blocks if necessary
          content = assistantMessage.content
            .filter(block => block.type === 'text')
            .map(block => block.text)
            .join(' ');
        } else {
          // Throw an error if content format is unexpected
          throw new Error('Unexpected content format');
        }

        // Create and append the assistant's message to the chat
        const agentMessage = createMessage(content, 'agent', reasoning);
        setMessages(prev => [...prev, agentMessage]);
      } else {
        // Throw an error if no messages were returned from the API
        throw new Error('No valid messages received from the agent');
      }
    } catch (err) {
      // Log detailed error information for debugging
      console.error('Error communicating with Letta agent:', err);
      // Display user-friendly error messages based on the type of error encountered
      if (err instanceof LettaError) {
        setError(`Failed to get response: ${err.message}`);
      } else {
        setError('Failed to get response from AI. Please try again.');
      }
      
      // Append a message to the chat notifying the user of the error
      const errorMessage = createMessage(
        'Sorry, I encountered an error. Please try again.',
        'agent'
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false); // Stop loading spinner once processing is complete
    }
  };

  return (
    <div className="bg-[#1A1A1A] rounded-lg p-4 flex flex-col" aria-label="Chat widget">
      {error && (
        <div className="bg-red-500/10 text-red-500 p-2 rounded mb-4" role="alert">
          {error}
        </div>
      )}

      <div 
        className="mb-4 h-64 overflow-y-auto flex flex-col space-y-2" 
        tabIndex={0}
        role="log"
        aria-label="Chat history"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.sender === 'user' 
                ? 'bg-blue-600 ml-auto' 
                : 'bg-gray-700 mr-auto'
            }`}
            aria-label={`${msg.sender} message`}
          >
            {msg.reasoning && (
              <div className="text-xs text-gray-400 mb-2 italic">
                Thinking: {msg.reasoning}
              </div>
            )}
            <p className="text-white">{msg.text}</p>
            <time 
              className="text-xs opacity-50"
              dateTime={msg.timestamp.toISOString()}
            >
              {msg.timestamp.toLocaleTimeString()}
            </time>
          </div>
        ))}
      </div>

      <div className="flex mt-auto">
        <textarea
          className="flex-grow bg-transparent text-white placeholder-gray-500 border border-gray-600 rounded-l-lg p-2 outline-none resize-none"
          placeholder={agentId ? "Type your message..." : "Initializing chat..."}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={loading || !client || !agentId}
          aria-label="Message input"
        />
        <button
          className={`px-4 rounded-r-lg transition-colors ${
            loading || !client || !agentId
              ? 'bg-blue-600/50 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={handleSendMessage}
          disabled={loading || !client || !agentId}
          aria-label="Send message"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;