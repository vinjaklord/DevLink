interface DecodedToken {
  id: string;
  [key: string]: any;
}

interface ApiResponse<T> {
  status: number;
  data: T;
}

interface ApiError {
  response?: {
    data: {
      message?: string;
    };
  };
  message: string;
}

interface Alert {
  type?: 'success' | 'error' | 'warning' | 'info'; // Maps to Sonner toast types
  title?: string;
  description?: string; // Replaces 'text'
  duration?: number; // In milliseconds
}

export type { DecodedToken, ApiResponse, ApiError, Alert };
