export interface FileMetadata {
    id: number;
    filename: string;
    tags: string[];
    size: number;
    uploadDate: Date;
}

export interface UploadProgress {
    filename: string;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    error?: string;
}

export interface FileUploadFormData {
    title: string;
    tags: string[];
}

export interface FileListProps {
    files: FileMetadata[];
    isReadOnly?: boolean;
    onDownload: (file: FileMetadata) => void;
    onEdit: (file: FileMetadata) => void;
    onDelete: (file: FileMetadata) => void;
}

export interface FileActionsProps {
    file: FileMetadata;
    onDownload: (file: FileMetadata) => void;
    onEdit: (file: FileMetadata) => void;
    onDelete: (file: FileMetadata) => void;
}

export interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: File[], metadata: FileUploadFormData) => Promise<void>;
    uploadProgress: UploadProgress[];
}

export interface EditMetadataModalProps {
    file: FileMetadata | null;
    isOpen: boolean;
    onSave: (file: FileMetadata) => void;
    onClose: () => void;
}
