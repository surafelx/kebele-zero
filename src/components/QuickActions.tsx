import React from 'react';
import { Plus, MessageSquare, Calendar, Trophy } from 'lucide-react';

const QuickActions: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    <button
      onClick={() => onAction('create_user')}
      className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
    >
      <Plus className="w-5 h-5 text-blue-600 mx-auto mb-1" />
      <span className="text-xs font-medium text-blue-700">Add User</span>
    </button>
    <button
      onClick={() => onAction('create_post')}
      className="p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
    >
      <MessageSquare className="w-5 h-5 text-green-600 mx-auto mb-1" />
      <span className="text-xs font-medium text-green-700">New Post</span>
    </button>
    <button
      onClick={() => onAction('create_event')}
      className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
    >
      <Calendar className="w-5 h-5 text-purple-600 mx-auto mb-1" />
      <span className="text-xs font-medium text-purple-700">Add Event</span>
    </button>
    <button
      onClick={() => onAction('create_game_score')}
      className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors"
    >
      <Trophy className="w-5 h-5 text-orange-600 mx-auto mb-1" />
      <span className="text-xs font-medium text-orange-700">Game Score</span>
    </button>
  </div>
);

export default QuickActions;