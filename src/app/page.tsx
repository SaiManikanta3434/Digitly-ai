'use client';

import { useState } from 'react';
import { Upload, FileText, Users, Briefcase, Settings, Download, Search, AlertCircle, X } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import DataGrid from '@/components/DataGrid';
import ValidationPanel from '@/components/ValidationPanel';
import RuleBuilder from '@/components/RuleBuilder';
import PrioritizationPanel from '@/components/PrioritizationPanel';
import AISearch from '@/components/AISearch';
import { DataEntity, ValidationError, BusinessRule, PrioritizationWeights, AISearchResult } from '@/types/data';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'upload' | 'data' | 'rules' | 'priorities' | 'export'>('upload');
  const [showAISearch, setShowAISearch] = useState(false);
  const [data, setData] = useState<{
    clients: DataEntity[];
    workers: DataEntity[];
    tasks: DataEntity[];
  }>({ clients: [], workers: [], tasks: [] });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [rules, setRules] = useState<BusinessRule[]>([]);
  const [priorities, setPriorities] = useState<PrioritizationWeights>({
    priorityLevel: 0.3,
    fulfillment: 0.25,
    fairness: 0.2,
    workload: 0.15,
    efficiency: 0.1
  });

  const tabs = [
    { id: 'upload', label: 'Upload Data', icon: Upload },
    { id: 'data', label: 'Data & Validation', icon: FileText },
    { id: 'rules', label: 'Business Rules', icon: Settings },
    { id: 'priorities', label: 'Priorities', icon: Briefcase },
    { id: 'export', label: 'Export', icon: Download },
  ];

  const handleDataUpload = (newData: { clients: DataEntity[]; workers: DataEntity[]; tasks: DataEntity[] }) => {
    setData(newData);
    setActiveTab('data');
  };

  const handleDataUpdate = (entityType: 'clients' | 'workers' | 'tasks', newData: DataEntity[]) => {
    setData(prev => ({ ...prev, [entityType]: newData }));
  };

  const handleAISearchResult = (result: AISearchResult) => {
    console.log('AI Search Result:', result);
    // You can handle the search result here, e.g., highlight matching rows in the grid
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Digitly AI</h1>
                <p className="text-sm text-gray-500">AI-Powered Data Processing & Validation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAISearch(true)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <Search className="h-4 w-4" />
                <span>AI Search</span>
              </button>
              {validationErrors.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationErrors.length} errors</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'upload' && (
          <FileUpload onDataUpload={handleDataUpload} />
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <DataGrid
                  data={data}
                  onDataUpdate={handleDataUpdate}
                  validationErrors={validationErrors}
                  setValidationErrors={setValidationErrors}
                />
              </div>
              <div>
                <ValidationPanel errors={validationErrors} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rules' && (
          <RuleBuilder
            data={data}
            rules={rules}
            setRules={setRules}
          />
        )}

        {activeTab === 'priorities' && (
          <PrioritizationPanel
            priorities={priorities}
            setPriorities={setPriorities}
          />
        )}

        {activeTab === 'export' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Export Cleaned Data</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Clients Data</h3>
                  <p className="text-sm text-gray-500">{data.clients.length} records</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Export CSV
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Workers Data</h3>
                  <p className="text-sm text-gray-500">{data.workers.length} records</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Export CSV
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Tasks Data</h3>
                  <p className="text-sm text-gray-500">{data.tasks.length} records</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Export CSV
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium">Business Rules</h3>
                  <p className="text-sm text-gray-500">{rules.length} rules configured</p>
                </div>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Export JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Search Modal */}
      {showAISearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-gray-900">AI Search</h2>
              <button
                onClick={() => setShowAISearch(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              <AISearch
                data={data}
                onSearchResult={handleAISearchResult}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
