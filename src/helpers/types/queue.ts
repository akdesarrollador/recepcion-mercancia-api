export interface PrintJob {
  id: string;
  codigo: string;
  zpl: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: Date;
  processedAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface QueueStats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}
