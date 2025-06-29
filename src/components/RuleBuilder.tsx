'use client';

import { useState } from 'react';
import { Plus, Settings, MessageSquare, Lightbulb, Save, Trash2, Copy, Check } from 'lucide-react';
import { BusinessRule, DataEntity } from '@/types/data';

interface RuleBuilderProps {
  data: {
    clients: DataEntity[];
    workers: DataEntity[];
    tasks: DataEntity[];
  };
  rules: BusinessRule[];
  setRules: (rules: BusinessRule[]) => void;
}

interface RuleFormData {
  type: BusinessRule['type'];
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  parameters: Record<string, any>;
  naturalLanguage?: string;
}

export default function RuleBuilder({ data, rules, setRules }: RuleBuilderProps) {
  const [activeTab, setActiveTab] = useState<'visual' | 'natural'>('visual');
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<BusinessRule | null>(null);
  const [formData, setFormData] = useState<RuleFormData>({
    type: 'coRun',
    name: '',
    description: '',
    enabled: true,
    priority: 1,
    parameters: {}
  });
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const ruleTypes = [
    {
      type: 'coRun' as const,
      label: 'Co-Run Rule',
      description: 'Tasks that must run together',
      icon: <Copy className="h-5 w-5" />
    },
    {
      type: 'slotRestriction' as const,
      label: 'Slot Restriction',
      description: 'Minimum common slots for groups',
      icon: <Settings className="h-5 w-5" />
    },
    {
      type: 'loadLimit' as const,
      label: 'Load Limit',
      description: 'Maximum load per phase for worker groups',
      icon: <Settings className="h-5 w-5" />
    },
    {
      type: 'phaseWindow' as const,
      label: 'Phase Window',
      description: 'Allowed phases for specific tasks',
      icon: <Settings className="h-5 w-5" />
    },
    {
      type: 'patternMatch' as const,
      label: 'Pattern Match',
      description: 'Regex-based rule matching',
      icon: <Settings className="h-5 w-5" />
    },
    {
      type: 'precedenceOverride' as const,
      label: 'Precedence Override',
      description: 'Override rule priorities',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  const handleCreateRule = () => {
    setEditingRule(null);
    setFormData({
      type: 'coRun',
      name: '',
      description: '',
      enabled: true,
      priority: 1,
      parameters: {}
    });
    setShowForm(true);
  };

  const handleEditRule = (rule: BusinessRule) => {
    setEditingRule(rule);
    setFormData({
      type: rule.type,
      name: rule.name,
      description: rule.description,
      enabled: rule.enabled,
      priority: rule.priority,
      parameters: rule.parameters,
      naturalLanguage: rule.naturalLanguage
    });
    setShowForm(true);
  };

  const handleSaveRule = () => {
    const newRule: BusinessRule = {
      id: editingRule?.id || `rule-${Date.now()}`,
      type: formData.type,
      name: formData.name,
      description: formData.description,
      enabled: formData.enabled,
      priority: formData.priority,
      parameters: formData.parameters,
      naturalLanguage: formData.naturalLanguage
    };

    if (editingRule) {
      setRules(rules.map(rule => rule.id === editingRule.id ? newRule : rule));
    } else {
      setRules([...rules, newRule]);
    }

    setShowForm(false);
    setEditingRule(null);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const handleNaturalLanguageSubmit = async () => {
    if (!naturalLanguageInput.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      // Mock AI response - in real implementation, this would call an AI service
      const mockRule: BusinessRule = {
        id: `rule-${Date.now()}`,
        type: 'coRun',
        name: 'AI Generated Rule',
        description: naturalLanguageInput,
        enabled: true,
        priority: 1,
        parameters: { taskIds: [] },
        naturalLanguage: naturalLanguageInput
      };

      setRules([...rules, mockRule]);
      setNaturalLanguageInput('');
      setIsProcessing(false);
    }, 2000);
  };

  const renderRuleForm = () => {
    const renderParameterInputs = () => {
      switch (formData.type) {
        case 'coRun':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task IDs (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.parameters.taskIds?.join(', ') || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      taskIds: e.target.value.split(',').map(id => id.trim())
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="T1, T2, T3"
                />
              </div>
            </div>
          );

        case 'slotRestriction':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Type
                </label>
                <select
                  value={formData.parameters.groupType || 'client'}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      groupType: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="client">Client Group</option>
                  <option value="worker">Worker Group</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={formData.parameters.groupName || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      groupName: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Group name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Common Slots
                </label>
                <input
                  type="number"
                  value={formData.parameters.minCommonSlots || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      minCommonSlots: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1"
                />
              </div>
            </div>
          );

        case 'loadLimit':
          return (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Worker Group
                </label>
                <input
                  type="text"
                  value={formData.parameters.workerGroup || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      workerGroup: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Worker group name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Slots Per Phase
                </label>
                <input
                  type="number"
                  value={formData.parameters.maxSlotsPerPhase || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parameters: {
                      ...prev.parameters,
                      maxSlotsPerPhase: parseInt(e.target.value)
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
            </div>
          );

        default:
          return (
            <div className="text-gray-500 text-sm">
              Parameter configuration for this rule type will be implemented soon.
            </div>
          );
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingRule ? 'Edit Rule' : 'Create New Rule'}
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rule Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as BusinessRule['type'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ruleTypes.map(ruleType => (
                  <option key={ruleType.type} value={ruleType.type}>
                    {ruleType.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rule Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter rule name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe what this rule does"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parameters
              </label>
              {renderParameterInputs()}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
                  Enabled
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t flex justify-end space-x-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRule}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Rule</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Rules</h2>
          <p className="text-gray-600">Create rules to control how your data is processed and allocated.</p>
        </div>
        <button
          onClick={handleCreateRule}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Rule</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('visual')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'visual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Visual Builder</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('natural')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'natural'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Natural Language</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'visual' ? (
        <div className="space-y-6">
          {/* Rule Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ruleTypes.map(ruleType => (
              <div
                key={ruleType.type}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: ruleType.type }));
                  setShowForm(true);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-600">{ruleType.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{ruleType.label}</h3>
                    <p className="text-sm text-gray-500">{ruleType.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Existing Rules */}
          {rules.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Existing Rules</h3>
              <div className="space-y-3">
                {rules.map(rule => (
                  <div
                    key={rule.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-gray-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            rule.enabled 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rule.enabled ? 'Active' : 'Inactive'}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Priority {rule.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        {rule.naturalLanguage && (
                          <p className="text-xs text-gray-500 mt-1">
                            <Lightbulb className="h-3 w-3 inline mr-1" />
                            AI Generated: "{rule.naturalLanguage}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <Settings className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Natural Language Input */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Describe Your Rule</h3>
            <p className="text-gray-600 mb-4">
              Use natural language to describe the business rule you want to create. Our AI will understand and convert it to a proper rule.
            </p>
            <div className="space-y-4">
              <textarea
                value={naturalLanguageInput}
                onChange={(e) => setNaturalLanguageInput(e.target.value)}
                placeholder="Example: Tasks T1 and T2 must always run together in the same phase"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleNaturalLanguageSubmit}
                disabled={!naturalLanguageInput.trim() || isProcessing}
                className={`px-4 py-2 rounded-md flex items-center space-x-2 ${
                  !naturalLanguageInput.trim() || isProcessing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    <span>Generate Rule</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Suggestions</h3>
            <p className="text-gray-600 mb-4">
              Based on your data, here are some rule suggestions:
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Co-run Rule:</strong> Tasks T1 and T2 have similar dependencies and could benefit from running together.
                </p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                  Apply Suggestion
                </button>
              </div>
              <div className="p-3 bg-white rounded border border-blue-200">
                <p className="text-sm text-gray-700">
                  <strong>Load Limit:</strong> Workers in the "Sales" group are frequently overloaded. Consider setting a max load limit.
                </p>
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-800">
                  Apply Suggestion
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rule Form Modal */}
      {showForm && renderRuleForm()}
    </div>
  );
} 