import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Dropzone({ onFile, accept, label, multiple = false, files = [] }) {
  const onDrop = useCallback((accepted) => {
    if (multiple) onFile(accepted);
    else if (accepted[0]) onFile(accepted[0]);
  }, [onFile, multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          ...styles.zone,
          borderColor: isDragActive ? '#3182ce' : '#cbd5e0',
          background: isDragActive ? '#ebf8ff' : '#f7fafc',
        }}
      >
        <input {...getInputProps()} />
        <div style={styles.icon}>📁</div>
        <p style={styles.label}>{isDragActive ? 'Drop files here…' : label}</p>
        <p style={styles.hint}>or click to browse</p>
      </div>

      {files.length > 0 && (
        <ul style={styles.list}>
          {(Array.isArray(files) ? files : [files]).map((f, i) => (
            <li key={i} style={styles.fileItem}>
              <span style={styles.fileIcon}>📄</span>
              <span style={styles.fileName}>{f.name}</span>
              <span style={styles.fileSize}>({(f.size / 1024).toFixed(1)} KB)</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  zone: {
    border: '2px dashed', borderRadius: 12, padding: '40px 24px',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
  },
  icon: { fontSize: 40, marginBottom: 8 },
  label: { fontSize: 16, color: '#2d3748', fontWeight: 500, marginBottom: 4 },
  hint: { fontSize: 13, color: '#718096' },
  list: { listStyle: 'none', marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  fileItem: {
    display: 'flex', alignItems: 'center', gap: 8, background: '#ebf8ff',
    padding: '8px 12px', borderRadius: 8,
  },
  fileIcon: { fontSize: 16 },
  fileName: { fontSize: 14, color: '#2b6cb0', fontWeight: 500, flex: 1 },
  fileSize: { fontSize: 12, color: '#718096' },
};
