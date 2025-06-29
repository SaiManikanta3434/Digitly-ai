// Data Entity Types
export interface DataEntity {
  id: string;
  [key: string]: any;
}

export interface Client extends DataEntity {
  ClientID: string;
  ClientName: string;
  ClientGroup: string;
  PriorityLevel: number;
  RequestedTaskIDs: string[];
  PreferredPhases: number[];
  MaxBudget: number;
  AttributesJSON: string;
}

export interface Worker extends DataEntity {
  WorkerID: string;
  WorkerName: string;
  WorkerGroup: string;
  Skills: string[];
  AvailableSlots: number[];
  MaxLoadPerPhase: number;
  HourlyRate: number;
  AttributesJSON: string;
}

export interface Task extends DataEntity {
  TaskID: string;
  TaskName: string;
  Duration: number;
  RequiredSkills: string[];
  PreferredPhases: number[];
  PriorityLevel: number;
  Dependencies: string[];
  MaxConcurrent: number;
  AttributesJSON: string;
}

// Validation Error Types
export interface ValidationError {
  id: string;
  entityType: 'client' | 'worker' | 'task';
  entityId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestedFix?: string;
  rowIndex?: number;
  columnIndex?: number;
}

// Business Rule Types
export interface BusinessRule {
  id: string;
  type: 'coRun' | 'slotRestriction' | 'loadLimit' | 'phaseWindow' | 'patternMatch' | 'precedenceOverride';
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  parameters: Record<string, any>;
  naturalLanguage?: string; // For AI-generated rules
}

export interface CoRunRule extends BusinessRule {
  type: 'coRun';
  parameters: {
    taskIds: string[];
  };
}

export interface SlotRestrictionRule extends BusinessRule {
  type: 'slotRestriction';
  parameters: {
    groupType: 'client' | 'worker';
    groupName: string;
    minCommonSlots: number;
  };
}

export interface LoadLimitRule extends BusinessRule {
  type: 'loadLimit';
  parameters: {
    workerGroup: string;
    maxSlotsPerPhase: number;
  };
}

export interface PhaseWindowRule extends BusinessRule {
  type: 'phaseWindow';
  parameters: {
    taskId: string;
    allowedPhases: number[];
  };
}

export interface PatternMatchRule extends BusinessRule {
  type: 'patternMatch';
  parameters: {
    regex: string;
    ruleTemplate: string;
    parameters: Record<string, any>;
  };
}

export interface PrecedenceOverrideRule extends BusinessRule {
  type: 'precedenceOverride';
  parameters: {
    globalRules: string[];
    specificRules: Record<string, string[]>;
    priorityOrder: string[];
  };
}

// Prioritization Types
export interface PrioritizationWeights {
  priorityLevel: number;
  fulfillment: number;
  fairness: number;
  workload: number;
  efficiency: number;
}

export interface PrioritizationProfile {
  id: string;
  name: string;
  description: string;
  weights: PrioritizationWeights;
}

// File Upload Types
export interface FileUploadResult {
  success: boolean;
  data?: {
    clients: Client[];
    workers: Worker[];
    tasks: Task[];
  };
  errors?: string[];
  warnings?: string[];
}

// AI Search Types
export interface AISearchQuery {
  query: string;
  entityType?: 'client' | 'worker' | 'task' | 'all';
  filters?: Record<string, any>;
}

export interface AISearchResult {
  entities: DataEntity[];
  explanation: string;
  confidence: number;
}

// Export Types
export interface ExportConfig {
  includeValidation: boolean;
  includeRules: boolean;
  includePriorities: boolean;
  format: 'csv' | 'xlsx' | 'json';
}

export interface ExportResult {
  success: boolean;
  files: {
    name: string;
    content: string | Blob;
    type: string;
  }[];
  errors?: string[];
} 