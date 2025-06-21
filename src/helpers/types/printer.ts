export interface PrinterConfig {
  id: string;
  name: string;
  host: string;
  shareName: string;
  enabled: boolean;
  priority: number;
}

export interface PrinterStatus {
  id: string;
  name: string;
  status:
    | "online"
    | "offline"
    | "busy"
    | "error"
    | "out_of_paper"
    | "door_open"
    | "ribbon_out";
  lastCheck: Date;
  currentJob?: string;
  totalJobs: number;
  failedJobs: number;
  lastError?: string;
  paperStatus?: "ok" | "low" | "out" | "unknown";
  ribbonStatus?: "ok" | "low" | "out" | "unknown";
  doorStatus?: "closed" | "open" | "unknown";
}

export interface PrintJob {
  id: string;
  codigo: string;
  zpl: string;
  status: "pending" | "processing" | "completed" | "failed" | "assigned";
  assignedPrinter?: string;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  error?: string;
  errorType?: "network" | "paper" | "ribbon" | "door" | "hardware" | "unknown";
  retryCount: number;
  maxRetries: number;
  priority: string;
}

export interface QueueStats {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  activePrinters: number;
  totalPrinters: number;
}

export interface PrinterError {
  type: "network" | "paper" | "ribbon" | "door" | "hardware" | "unknown";
  message: string;
  code?: string;
  recoverable: boolean;
}
