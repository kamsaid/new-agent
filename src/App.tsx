import React from 'react';
import { Link, Sparkles } from 'lucide-react';
import ChatWidget from './ChatWidget';

function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 p-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-2xl font-bold text-white">yaseen</div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0A0A] to-[#0A0A0A]"></div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Yaseen
          </h1>
          <p className="text-gray-400 text-xl mb-12">
            Your AI powered mentor.
          </p>

          {/* ChatWidget integration for Letta agent */}
          <ChatWidget />

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-2">
            <button className="bg-[#1A1A1A] text-gray-300 px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition-colors text-sm">
              Start a blog with Astro
            </button>
            <button className="bg-[#1A1A1A] text-gray-300 px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition-colors text-sm">
              Build a mobile app with NativeScript
            </button>
            <button className="bg-[#1A1A1A] text-gray-300 px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition-colors text-sm">
              Create a docs site with Vitepress
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <button className="bg-[#1A1A1A] text-gray-300 px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition-colors text-sm">
              Scaffold UI with shadcn
            </button>
            <button className="bg-[#1A1A1A] text-gray-300 px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition-colors text-sm">
              Draft a presentation with Slidev
            </button>
            <button className="bg-[#1A1A1A] text-gray-300 px-4 py-2 rounded-full hover:bg-[#2A2A2A] transition-colors text-sm">
              Code a video with Remotion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;