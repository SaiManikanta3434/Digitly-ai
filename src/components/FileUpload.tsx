'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, Users, Briefcase, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { FileUploadResult, Client, Worker, Task } from '@/types/data';

interface FileUploadProps {
  onDataUpload: (data: { clients: Client[]; workers: Worker[]; tasks: Task[] }) => void;
}

interface FileUploadState {
  clients: File | null;
  workers: File | null;
  tasks: File | null;
}

export default function FileUpload({ onDataUpload }: FileUploadProps) {
  const [files, setFiles] = useState<FileUploadState>({
    clients: null,
    workers: null,
    tasks: null
  });
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<FileUploadResult | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleFileSelect = useCallback((entityType: keyof FileUploadState, file: File) => {
    setFiles(prev => ({ ...prev, [entityType]: file }));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, entityType: string) => {
    e.preventDefault();
    setDragOver(entityType);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, entityType: keyof FileUploadState) => {
    e.preventDefault();
    setDragOver(null);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.xlsx'))) {
      handleFileSelect(entityType, droppedFile);
    }
  }, [handleFileSelect]);

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
            } else {
              resolve(results.data);
            }
          },
          error: (error) => reject(error)
        });
      } else if (file.name.endsWith('.xlsx')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  };

  const mapHeaders = (rawData: any[], entityType: 'clients' | 'workers' | 'tasks'): any[] => {
    if (rawData.length === 0) return rawData;

    const firstRow = rawData[0];
    const headerMapping: Record<string, string> = {};

    // AI-powered header mapping logic
    const headerMappings = {
      clients: {
        'Client ID': 'ClientID',
        'Client Name': 'ClientName',
        'Client Group': 'ClientGroup',
        'Priority Level': 'PriorityLevel',
        'Requested Task IDs': 'RequestedTaskIDs',
        'Preferred Phases': 'PreferredPhases',
        'Max Budget': 'MaxBudget',
        'Attributes JSON': 'AttributesJSON'
      },
      workers: {
        'Worker ID': 'WorkerID',
        'Worker Name': 'WorkerName',
        'Worker Group': 'WorkerGroup',
        'Skills': 'Skills',
        'Available Slots': 'AvailableSlots',
        'Max Load Per Phase': 'MaxLoadPerPhase',
        'Hourly Rate': 'HourlyRate',
        'Attributes JSON': 'AttributesJSON'
      },
      tasks: {
        'Task ID': 'TaskID',
        'Task Name': 'TaskName',
        'Duration': 'Duration',
        'Required Skills': 'RequiredSkills',
        'Preferred Phases': 'PreferredPhases',
        'Priority Level': 'PriorityLevel',
        'Dependencies': 'Dependencies',
        'Max Concurrent': 'MaxConcurrent',
        'Attributes JSON': 'AttributesJSON'
      }
    };

    const currentMapping = headerMappings[entityType];
    
    // Map headers
    Object.keys(firstRow).forEach(originalHeader => {
      const normalizedHeader = originalHeader.trim().toLowerCase();
      
      // Find the best match
      for (const [mappedHeader, targetField] of Object.entries(currentMapping)) {
        if (normalizedHeader.includes(mappedHeader.toLowerCase().replace(/\s+/g, ''))) {
          headerMapping[originalHeader] = targetField;
          break;
        }
      }
      
      // If no match found, keep original
      if (!headerMapping[originalHeader]) {
        headerMapping[originalHeader] = originalHeader;
      }
    });

    // Transform data with mapped headers
    return rawData.map(row => {
      const transformedRow: any = {};
      Object.keys(row).forEach(key => {
        const newKey = headerMapping[key];
        if (newKey) {
          transformedRow[newKey] = row[key];
        }
      });
      return transformedRow;
    });
  };

  const processData = (rawData: any[], entityType: 'clients' | 'workers' | 'tasks'): any[] => {
    return rawData.map((row, index) => {
      const processedRow = { ...row, id: row[`${entityType.slice(0, -1)}ID`] || `temp-${index}` };
      
      // Process specific fields based on entity type
      switch (entityType) {
        case 'clients':
          processedRow.RequestedTaskIDs = typeof row.RequestedTaskIDs === 'string' 
            ? row.RequestedTaskIDs.split(',').map((id: string) => id.trim())
            : row.RequestedTaskIDs || [];
          processedRow.PreferredPhases = typeof row.PreferredPhases === 'string'
            ? row.PreferredPhases.split(',').map((phase: string) => parseInt(phase.trim()))
            : row.PreferredPhases || [];
          processedRow.PriorityLevel = parseInt(row.PriorityLevel) || 1;
          processedRow.MaxBudget = parseFloat(row.MaxBudget) || 0;
          break;
          
        case 'workers':
          processedRow.Skills = typeof row.Skills === 'string'
            ? row.Skills.split(',').map((skill: string) => skill.trim())
            : row.Skills || [];
          processedRow.AvailableSlots = typeof row.AvailableSlots === 'string'
            ? row.AvailableSlots.split(',').map((slot: string) => parseInt(slot.trim()))
            : row.AvailableSlots || [];
          processedRow.MaxLoadPerPhase = parseInt(row.MaxLoadPerPhase) || 1;
          processedRow.HourlyRate = parseFloat(row.HourlyRate) || 0;
          break;
          
        case 'tasks':
          processedRow.RequiredSkills = typeof row.RequiredSkills === 'string'
            ? row.RequiredSkills.split(',').map((skill: string) => skill.trim())
            : row.RequiredSkills || [];
          processedRow.PreferredPhases = typeof row.PreferredPhases === 'string'
            ? row.PreferredPhases.split(',').map((phase: string) => parseInt(phase.trim()))
            : row.PreferredPhases || [];
          processedRow.Dependencies = typeof row.Dependencies === 'string'
            ? row.Dependencies.split(',').map((dep: string) => dep.trim())
            : row.Dependencies || [];
          processedRow.Duration = parseInt(row.Duration) || 1;
          processedRow.PriorityLevel = parseInt(row.PriorityLevel) || 1;
          processedRow.MaxConcurrent = parseInt(row.MaxConcurrent) || 1;
          break;
      }
      
      return processedRow;
    });
  };

  const handleUpload = async () => {
    if (!files.clients || !files.workers || !files.tasks) {
      setUploadResult({
        success: false,
        errors: ['Please upload all three required files: clients, workers, and tasks']
      });
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    
    try {
      const results = await Promise.all([
        parseFile(files.clients),
        parseFile(files.workers),
        parseFile(files.tasks)
      ]);

      const [clientsRaw, workersRaw, tasksRaw] = results;
      
      // Map headers and process data
      const clients = processData(mapHeaders(clientsRaw, 'clients'), 'clients');
      const workers = processData(mapHeaders(workersRaw, 'workers'), 'workers');
      const tasks = processData(mapHeaders(tasksRaw, 'tasks'), 'tasks');

      const result: FileUploadResult = {
        success: true,
        data: { clients, workers, tasks },
        warnings: []
      };

      setUploadResult(result);
      setUploadStatus('success');
      
      // Pass data to parent component
      onDataUpload({ clients, workers, tasks });
      
    } catch (error) {
      setUploadResult({
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });
      setUploadStatus('error');
    }
  };

  const renderFileUploadArea = (entityType: keyof FileUploadState, label: string, icon: React.ReactNode) => {
    const file = files[entityType];
    const isDragOver = dragOver === entityType;
    
    return (
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : file 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={(e) => handleDragOver(e, entityType)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, entityType)}
      >
        <div className="flex flex-col items-center space-y-2">
          {icon}
          <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            {file ? (
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">{file.name}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Drag and drop CSV or XLSX file here, or{' '}
                <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(entityType, e.target.files[0])}
                  />
                </label>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Data</h1>
        <p className="text-lg text-gray-600">
          Upload CSV or XLSX files for clients, workers, and tasks. Our AI will help map headers and validate your data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderFileUploadArea('clients', 'Clients Data', <Users className="h-8 w-8 text-blue-500" />)}
        {renderFileUploadArea('workers', 'Workers Data', <Briefcase className="h-8 w-8 text-green-500" />)}
        {renderFileUploadArea('tasks', 'Tasks Data', <FileText className="h-8 w-8 text-purple-500" />)}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          disabled={!files.clients || !files.workers || !files.tasks || uploadStatus === 'uploading'}
          className={`px-8 py-3 rounded-lg font-medium text-white flex items-center space-x-2 ${
            uploadStatus === 'uploading' || (!files.clients || !files.workers || !files.tasks)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {uploadStatus === 'uploading' ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5" />
              <span>Process Data</span>
            </>
          )}
        </button>
      </div>

      {uploadResult && (
        <div className={`p-4 rounded-lg ${
          uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {uploadResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className={`font-medium ${
                uploadResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
              </h3>
              {uploadResult.success && uploadResult.data && (
                <div className="mt-2 text-sm text-green-700">
                  <p>• {uploadResult.data.clients.length} clients loaded</p>
                  <p>• {uploadResult.data.workers.length} workers loaded</p>
                  <p>• {uploadResult.data.tasks.length} tasks loaded</p>
                </div>
              )}
              {uploadResult.errors && (
                <div className="mt-2 text-sm text-red-700">
                  {uploadResult.errors.map((error, index) => (
                    <p key={index}>• {error}</p>
                  ))}
                </div>
              )}
              {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                <div className="mt-2 text-sm text-yellow-700">
                  {uploadResult.warnings.map((warning, index) => (
                    <p key={index}>• {warning}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 