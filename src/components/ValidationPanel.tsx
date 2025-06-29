'use client';

import { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle, XCircle, Lightbulb, Zap, Filter } from 'lucide-react';
import { ValidationError } from '@/types/data';

interface ValidationPanelProps {
  errors: ValidationError[];
}

export default function ValidationPanel({ errors }: ValidationPanelProps) {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [expandedError, setExpandedError] = useState<string | null>(null);

  const filteredErrors = useMemo(() => {
    if (filterSeverity === 'all') return errors;
    return errors.filter(error => error.severity === filterSeverity);
  }, [errors, filterSeverity]);

  const errorStats = useMemo(() => {
    const stats = { error: 0, warning: 0, info: 0 };
    errors.forEach(error => {
      stats[error.severity]++;
    });
    return stats;
  }, [errors]);

  const getSeverityIcon = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getSeverityTextColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
    }
  };

  const handleApplySuggestion = (error: ValidationError) => {
    // This would typically trigger a callback to update the data
    // For now, we'll just show a success message
    console.log('Applying suggestion for error:', error.id);
  };

  const handleDismissError = (errorId: string) => {
    // This would typically trigger a callback to remove the error
    console.log('Dismissing error:', errorId);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Validation Results</h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All ({errors.length})</option>
              <option value="error">Errors ({errorStats.error})</option>
              <option value="warning">Warnings ({errorStats.warning})</option>
              <option value="info">Info ({errorStats.info})</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex space-x-4 mt-3">
          <div className="flex items-center space-x-1">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-gray-600">{errorStats.error} errors</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm text-gray-600">{errorStats.warning} warnings</span>
          </div>
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">{errorStats.info} info</span>
          </div>
        </div>
      </div>

      {/* Error List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredErrors.length === 0 ? (
          <div className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">
              {filterSeverity === 'all' 
                ? 'No validation issues found!' 
                : `No ${filterSeverity}s found.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredErrors.map((error) => (
              <div
                key={error.id}
                className={`p-4 border-l-4 ${getSeverityColor(error.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-sm font-medium ${getSeverityTextColor(error.severity)}`}>
                          {error.entityType.charAt(0).toUpperCase() + error.entityType.slice(1)}: {error.entityId}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{error.field}</span>
                      </div>
                      <p className={`text-sm ${getSeverityTextColor(error.severity)}`}>
                        {error.message}
                      </p>
                      
                      {error.suggestedFix && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-1 mb-1">
                            <Lightbulb className="h-3 w-3 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-800">Suggested Fix:</span>
                          </div>
                          <p className="text-xs text-yellow-700 mb-2">{error.suggestedFix}</p>
                          <button
                            onClick={() => handleApplySuggestion(error)}
                            className="flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          >
                            <Zap className="h-3 w-3" />
                            <span>Apply Fix</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissError(error.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {errors.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredErrors.length} of {errors.length} issues shown
            </span>
            <div className="flex space-x-2">
              <button className="text-blue-600 hover:text-blue-800">
                Export Report
              </button>
              <button className="text-blue-600 hover:text-blue-800">
                View All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 