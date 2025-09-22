import { useState, useCallback, useRef } from 'react';
import { FileUploadFormData, UploadProgress } from './types';

export interface UseFileUploadProps {
  onUpload: (files: File[], metadata: FileUploadFormData) => Promise<void>;
  uploadProgress: UploadProgress[];
}

export interface UseFileUploadReturn {
  selectedFiles: File[];
  
  uploadTitle: string;
  uploadTags: string[];
  tagInput: string;
  
  isDragOver: boolean;
  
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dropZoneRef: React.RefObject<HTMLDivElement | null>;
  
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeSelectedFile: (index: number) => void;
  
  handleDragOver: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  
  setUploadTitle: (title: string) => void;
  setTagInput: (tag: string) => void;
  addTag: () => void;
  removeTag: (tagToRemove: string) => void;
  
  handleUpload: () => Promise<void>;
  resetForm: () => void;
  
  hasUploadInProgress: boolean;
  formatFileSize: (bytes: number) => string;
}

export function useFileUpload({ onUpload, uploadProgress }: UseFileUploadProps): UseFileUploadReturn {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(newFiles);
      setUploadTitle(newFiles[0]?.name || '');
    }
  }, []);

  const removeSelectedFile = useCallback((index: number) => {
    resetForm();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const addTag = useCallback(() => {
    if (tagInput.trim() && !uploadTags.includes(tagInput.trim())) {
      setUploadTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, uploadTags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setUploadTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    const metadata: FileUploadFormData = {
      title: uploadTitle,
      tags: uploadTags,
    };

    try {
      await onUpload(selectedFiles, metadata);
      
      setSelectedFiles([]);
      setUploadTitle('');
      setUploadTags([]);
      setTagInput('');
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [selectedFiles, uploadTitle, uploadTags, onUpload]);

  const resetForm = useCallback(() => {
    setSelectedFiles([]);
    setUploadTitle('');
    setUploadTags([]);
    setTagInput('');
    setUploadTags([]);
    setTagInput('');
    setIsDragOver(false);
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const hasUploadInProgress = uploadProgress.some(p => p.status === 'uploading');

  return {
    selectedFiles,
    
    uploadTitle,
    uploadTags,
    tagInput,
    
    isDragOver,
    
    fileInputRef,
    dropZoneRef,
    
    handleFileSelect,
    removeSelectedFile,
    
    handleDragOver,
    handleDragLeave,
    handleDrop,
    
    setUploadTitle,
    setTagInput,
    addTag,
    removeTag,
    
    handleUpload,
    resetForm,
    
    hasUploadInProgress,
    formatFileSize,
  };
}
