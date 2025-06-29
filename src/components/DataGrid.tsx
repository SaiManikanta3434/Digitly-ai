'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Filter, Edit3, Save, X } from 'lucide-react';
import { DataEntity, ValidationError } from '@/types/data';

interface DataGridProps {
  data: {
    clients: DataEntity[];
    workers: DataEntity[];
    tasks: DataEntity[];
  };
  onDataUpdate: (entityType: 'clients' | 'workers' | 'tasks', newData: DataEntity[]) => void;
  validationErrors: ValidationError[];
  setValidationErrors: (errors: ValidationError[]) => void;
}

interface Column {
  key: string;
  label: string;
  type: 'text' | 'number' | 'array' | 'json' | 'select';
  editable: boolean;
  options?: string[];
}

export default function DataGrid({ data, onDataUpdate, validationErrors, setValidationErrors }: DataGridProps) {
  const [activeEntity, setActiveEntity] = useState<'clients' | 'workers' | 'tasks'>('clients');
  const [editingCell, setEditingCell] = useState<{ rowId: string; column: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const columns: Record<string, Column[]> = {
    clients: [
      { key: 'ClientID', label: 'Client ID', type: 'text', editable: true },
      { key: 'ClientName', label: 'Client Name', type: 'text', editable: true },
      { key: 'ClientGroup', label: 'Client Group', type: 'text', editable: true },
      { key: 'PriorityLevel', label: 'Priority Level', type: 'number', editable: true },
      { key: 'RequestedTaskIDs', label: 'Requested Tasks', type: 'array', editable: true },
      { key: 'PreferredPhases', label: 'Preferred Phases', type: 'array', editable: true },
      { key: 'MaxBudget', label: 'Max Budget', type: 'number', editable: true },
      { key: 'AttributesJSON', label: 'Attributes', type: 'json', editable: true }
    ],
    workers: [
      { key: 'WorkerID', label: 'Worker ID', type: 'text', editable: true },
      { key: 'WorkerName', label: 'Worker Name', type: 'text', editable: true },
      { key: 'WorkerGroup', label: 'Worker Group', type: 'text', editable: true },
      { key: 'Skills', label: 'Skills', type: 'array', editable: true },
      { key: 'AvailableSlots', label: 'Available Slots', type: 'array', editable: true },
      { key: 'MaxLoadPerPhase', label: 'Max Load/Phase', type: 'number', editable: true },
      { key: 'HourlyRate', label: 'Hourly Rate', type: 'number', editable: true },
      { key: 'AttributesJSON', label: 'Attributes', type: 'json', editable: true }
    ],
    tasks: [
      { key: 'TaskID', label: 'Task ID', type: 'text', editable: true },
      { key: 'TaskName', label: 'Task Name', type: 'text', editable: true },
      { key: 'Duration', label: 'Duration', type: 'number', editable: true },
      { key: 'RequiredSkills', label: 'Required Skills', type: 'array', editable: true },
      { key: 'PreferredPhases', label: 'Preferred Phases', type: 'array', editable: true },
      { key: 'PriorityLevel', label: 'Priority Level', type: 'number', editable: true },
      { key: 'Dependencies', label: 'Dependencies', type: 'array', editable: true },
      { key: 'MaxConcurrent', label: 'Max Concurrent', type: 'number', editable: true },
      { key: 'AttributesJSON', label: 'Attributes', type: 'json', editable: true }
    ]
  };

  const currentData = data[activeEntity];
  const currentColumns = columns[activeEntity];

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = currentData.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [currentData, searchTerm, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' as const }
          : null;
      }
      return { key, direction: 'asc' as const };
    });
  };

  const getCellError = (rowId: string, column: string): ValidationError | undefined => {
    return validationErrors.find(error => 
      error.entityId === rowId && error.field === column
    );
  };

  const handleCellEdit = (rowId: string, column: string) => {
    setEditingCell({ rowId, column });
  };

  const handleCellSave = (rowId: string, column: string, value: any) => {
    const updatedData = currentData.map(row => {
      if (row.id === rowId) {
        return { ...row, [column]: value };
      }
      return row;
    });

    onDataUpdate(activeEntity, updatedData);
    setEditingCell(null);
  };

  const handleCellCancel = () => {
    setEditingCell(null);
  };

  const renderCellValue = (item: DataEntity, column: Column) => {
    const value = item[column.key];
    const error = getCellError(item.id, column.key);
    const isEditing = editingCell?.rowId === item.id && editingCell?.column === column.key;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {column.type === 'array' ? (
            <input
              type="text"
              defaultValue={Array.isArray(value) ? value.join(', ') : value}
              className="flex-1 px-2 py-1 text-sm border rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const newValue = (e.target as HTMLInputElement).value.split(',').map(v => v.trim());
                  handleCellSave(item.id, column.key, newValue);
                } else if (e.key === 'Escape') {
                  handleCellCancel();
                }
              }}
              onBlur={(e) => {
                const newValue = e.target.value.split(',').map(v => v.trim());
                handleCellSave(item.id, column.key, newValue);
              }}
              autoFocus
            />
          ) : column.type === 'json' ? (
            <textarea
              defaultValue={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
              className="flex-1 px-2 py-1 text-sm border rounded"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  try {
                    const newValue = JSON.parse((e.target as HTMLTextAreaElement).value);
                    handleCellSave(item.id, column.key, newValue);
                  } catch {
                    // Keep as string if invalid JSON
                    handleCellSave(item.id, column.key, (e.target as HTMLTextAreaElement).value);
                  }
                } else if (e.key === 'Escape') {
                  handleCellCancel();
                }
              }}
              onBlur={(e) => {
                try {
                  const newValue = JSON.parse(e.target.value);
                  handleCellSave(item.id, column.key, newValue);
                } catch {
                  handleCellSave(item.id, column.key, e.target.value);
                }
              }}
              autoFocus
            />
          ) : (
            <input
              type={column.type === 'number' ? 'number' : 'text'}
              defaultValue={value}
              className="flex-1 px-2 py-1 text-sm border rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const newValue = column.type === 'number' 
                    ? parseFloat((e.target as HTMLInputElement).value)
                    : (e.target as HTMLInputElement).value;
                  handleCellSave(item.id, column.key, newValue);
                } else if (e.key === 'Escape') {
                  handleCellCancel();
                }
              }}
              onBlur={(e) => {
                const newValue = column.type === 'number' 
                  ? parseFloat(e.target.value)
                  : e.target.value;
                handleCellSave(item.id, column.key, newValue);
              }}
              autoFocus
            />
          )}
          <button
            onClick={() => handleCellSave(item.id, column.key, value)}
            className="p-1 text-green-600 hover:text-green-800"
          >
            <Save className="h-3 w-3" />
          </button>
          <button
            onClick={handleCellCancel}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      );
    }

    let displayValue = value;
    if (Array.isArray(value)) {
      displayValue = value.join(', ');
    } else if (typeof value === 'object' && value !== null) {
      displayValue = JSON.stringify(value);
    }

    return (
      <div className="flex items-center justify-between group">
        <span className={`truncate ${error ? 'text-red-600' : ''}`}>
          {displayValue}
        </span>
        {column.editable && (
          <button
            onClick={() => handleCellEdit(item.id, column.key)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600"
          >
            <Edit3 className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex space-x-4">
            {(['clients', 'workers', 'tasks'] as const).map(entity => (
              <button
                key={entity}
                onClick={() => setActiveEntity(entity)}
                className={`px-4 py-2 rounded-lg font-medium capitalize ${
                  activeEntity === entity
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {entity} ({data[entity].length})
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {currentColumns.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedData.map((item, index) => (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 ${
                  validationErrors.some(error => error.entityId === item.id)
                    ? 'bg-red-50'
                    : ''
                }`}
              >
                {currentColumns.map(column => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm text-gray-900 ${
                      getCellError(item.id, column.key) ? 'bg-red-100' : ''
                    }`}
                  >
                    {renderCellValue(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? 'No results found for your search.' : 'No data available.'}
          </p>
        </div>
      )}
    </div>
  );
} 