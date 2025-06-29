'use client';

import { useState } from 'react';
import { Search, Send, Loader2, MessageSquare, X, Filter, Users, Briefcase, FileText } from 'lucide-react';
import { DataEntity, AISearchQuery, AISearchResult } from '@/types/data';

interface AISearchProps {
  data: {
    clients: DataEntity[];
    workers: DataEntity[];
    tasks: DataEntity[];
  };
  onSearchResult?: (result: AISearchResult) => void;
}

interface SearchHistory {
  query: string;
  result: AISearchResult;
  timestamp: Date;
}

export default function AISearch({ data, onSearchResult }: AISearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<'all' | 'client' | 'worker' | 'task'>('all');

  const entityTypes = [
    { value: 'all', label: 'All Data', icon: <Search className="h-4 w-4" /> },
    { value: 'client', label: 'Clients', icon: <Users className="h-4 w-4" /> },
    { value: 'worker', label: 'Workers', icon: <Briefcase className="h-4 w-4" /> },
    { value: 'task', label: 'Tasks', icon: <FileText className="h-4 w-4" /> }
  ];

  const exampleQueries = [
    "Show me all tasks with duration greater than 2 phases",
    "Find workers who have skills in 'programming' and 'design'",
    "Which clients have priority level 5?",
    "Show tasks that require 'management' skills",
    "Find workers available in phase 1 and 2",
    "Which tasks have dependencies on task T1?",
    "Show clients with budget over $10000",
    "Find workers in the 'engineering' group"
  ];

  const processQueryWithAI = async (searchQuery: string): Promise<AISearchResult> => {
    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          data: {
            clients: data.clients,
            workers: data.workers,
            tasks: data.tasks
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        entities: result.entities || [],
        explanation: result.explanation || 'No explanation provided',
        confidence: result.confidence || 0
      };
    } catch (error) {
      console.error('AI search error:', error);
      
      // Fallback to simulated response if API fails
      return await simulateAIResponse(searchQuery, data);
    }
  };

  const simulateAIResponse = async (query: string, context: any): Promise<AISearchResult> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerQuery = query.toLowerCase();
    let entities: DataEntity[] = [];
    let explanation = '';
    let confidence = 0.8;

    // Simple keyword-based matching for demo
    if (lowerQuery.includes('task') && lowerQuery.includes('duration')) {
      entities = context.tasks.filter((task: any) => 
        task.Duration && task.Duration > 1
      );
      explanation = `Found ${entities.length} tasks with duration greater than 1 phase.`;
    } else if (lowerQuery.includes('worker') && lowerQuery.includes('skill')) {
      entities = context.workers.filter((worker: any) => 
        worker.Skills && worker.Skills.length > 0
      );
      explanation = `Found ${entities.length} workers with skills.`;
    } else if (lowerQuery.includes('client') && lowerQuery.includes('priority')) {
      entities = context.clients.filter((client: any) => 
        client.PriorityLevel && client.PriorityLevel >= 4
      );
      explanation = `Found ${entities.length} clients with high priority levels.`;
    } else if (lowerQuery.includes('budget') || lowerQuery.includes('cost')) {
      entities = context.clients.filter((client: any) => 
        client.MaxBudget && client.MaxBudget > 5000
      );
      explanation = `Found ${entities.length} clients with budgets over $5000.`;
    } else if (lowerQuery.includes('phase')) {
      entities = [...context.tasks, ...context.workers].filter((item: any) => 
        item.PreferredPhases && item.PreferredPhases.length > 0
      );
      explanation = `Found ${entities.length} items with phase preferences.`;
    } else {
      // Generic search across all entities
      const allEntities = [...context.clients, ...context.workers, ...context.tasks];
      entities = allEntities.filter((entity: any) => 
        Object.values(entity).some(value => 
          String(value).toLowerCase().includes(lowerQuery.split(' ')[0])
        )
      );
      explanation = `Found ${entities.length} items matching your search criteria.`;
      confidence = 0.6;
    }

    return { entities, explanation, confidence };
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      const result = await processQueryWithAI(query);
      
      const searchHistoryItem: SearchHistory = {
        query,
        result,
        timestamp: new Date()
      };

      setSearchHistory(prev => [searchHistoryItem, ...prev.slice(0, 9)]); // Keep last 10
      onSearchResult?.(result);
      
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Search</h3>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Ask questions about your data in natural language
        </p>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="flex space-x-2 mb-4">
          {entityTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setSelectedEntityType(type.value as any)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                selectedEntityType === type.value
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.icon}
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your data... (e.g., 'Show tasks with duration > 2')"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSearching}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              !query.trim() || isSearching
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isSearching ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {/* Example Queries */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.slice(0, 4).map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search History */}
      {showHistory && searchHistory.length > 0 && (
        <div className="border-t">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Recent Searches</h4>
              <button
                onClick={clearHistory}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {searchHistory.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        "{item.query}"
                      </p>
                      <p className="text-xs text-gray-600 mb-2">
                        {item.result.explanation}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{item.result.entities.length} results</span>
                        <span>•</span>
                        <span>Confidence: {(item.result.confidence * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setQuery(item.query)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                    >
                      <Search className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>📊 {data.clients.length} clients</span>
            <span>👥 {data.workers.length} workers</span>
            <span>📋 {data.tasks.length} tasks</span>
          </div>
          <span className="text-xs">AI-powered search</span>
        </div>
      </div>
    </div>
  );
} 