import React from "react";

export default function WelcomeScreen ({ onCreateNewChat }) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-2xl px-6 sm:px-8 pt-6">
        {/* header row that mirrors chat spacing */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black grid place-items-center text-sm font-semibold">
            AI
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              Ready to bring your idea to life?
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Tell me what product you’d like — I’ll help you spec it, price it,
              and source manufacturers.
            </p>
          </div>
        </div>

        {/* subtle empty-state body; no card chrome */}
        <div className="mt-6 space-y-6">
          {/* quick actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onCreateNewChat}
              className="inline-flex items-center gap-2 rounded-full bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-medium hover:opacity-95 cursor-pointer"
            >
              Start new chat
              <span aria-hidden>✨</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};