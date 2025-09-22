export interface UploadFileResponse {
  success: boolean;
  id?: number;
  message?: string;
  error?: string;
}

export interface FileStatus {
  id: number;
  fileName: string;
  status: string;
  description?: string;
  uploadDate?: string;
  size?: number;
  contentType?: string;
}

export interface FileListResponse {
  files: FileItem[];
  total: number;
}

export interface FileListParams {
  fileName?: string;
  status?: string;
}

export type FileItem = {
  id: number;
  description: string;
  status: string;
  submittedAt: string;
  tags: string;
  file: {
    id: number;
    fileName: string;
    uploadedAt: Date;
    size: number;
  };
}

const API_BASE_URL =  'http://localhost:5000';

const uploadFile = async (
  file: File,
  tags: string[] = [],
  fileName: string = '',
): Promise<UploadFileResponse> => {
  try {
    const formData = new FormData();
    formData.append('File', file);
    
    if (tags) {
      formData.append('Tags', tags.join(','));
    }

    if (fileName) {
      formData.append('FileName', fileName);
    }

    const response = await fetch(`${API_BASE_URL}/ingestion/upload-with-metadata`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());

    return {
      success: true,
      ...response.data,
    };
  } catch (error: any) {
    console.error('Upload failed:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

const getUploadStatus = async (id: number): Promise<FileStatus | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status?id=${id}`, {
      method: 'GET',
    }).then(res => res.json());

    return response.data;
  } catch (error: any) {
    console.error('Failed to get upload status:', error);
    return null;
  }
};

const getFileById = async (id: number): Promise<Blob | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/file/${id}`, {
      method: 'GET',
    }).then(res => res.blob());

    return response;
  } catch (error: any) {
    console.error('Failed to get file:', error);
    return null;
  }
};

const getFileList = async (params?: FileListParams): Promise<FileListResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ingestion/list`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json());
    const files: FileItem[] = response;

    return {
      files,
      total: files.length,
    };
  } catch (error: any) {
    console.error('Failed to get file list:', error);
    return {
      files: [],
      total: 0,
    };
  }
};


export const fileApi = {
  uploadFile,
  getUploadStatus,
  getFileById,
  getFileList,
};
