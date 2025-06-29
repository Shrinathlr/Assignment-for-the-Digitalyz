import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  label: string;
  onData: (data: any[], fileName: string) => void;
  accept?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({ label, onData, accept }) => {
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        onData(json, file.name);
      } catch (err) {
        setError('Failed to parse file. Please upload a valid CSV or XLSX.');
      }
    };
    reader.onerror = () => setError('Error reading file.');
    reader.readAsArrayBuffer(file);
  }, [onData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept || '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
    multiple: false,
  });

  return (
    <div style={{ border: '2px dashed #aaa', borderRadius: 8, padding: 20, marginBottom: 16 }}>
      <div {...getRootProps()} style={{ cursor: 'pointer', textAlign: 'center' }}>
        <input {...getInputProps()} />
        <p>{isDragActive ? 'Drop the file here...' : `Upload ${label} (CSV/XLSX)`}</p>
        {fileName && <p style={{ color: 'green' }}>Uploaded: {fileName}</p>}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FileUploader; 