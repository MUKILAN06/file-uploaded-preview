import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const MAX_SIZE = 10 * 1024 * 1024; 
const MAX_FILES = 10;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'Too large (>10MB)' };
  }
  return { valid: true, error: null };
}

function App() {
  const [files, setFiles] = useState([]);
  const [replaceIndex, setReplaceIndex] = useState(-1);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);

  useEffect(() => {
    return () => {
      files.forEach(item => {
        if (item.url) URL.revokeObjectURL(item.url);
      });
    };
  }, []);

  const handleFileChange = (e) => {
    setErrorMsg('');
    setSuccessMsg('');
    const newFiles = Array.from(e.target.files);

    if (files.length + newFiles.length > MAX_FILES) {
      setErrorMsg(`You can only upload up to ${MAX_FILES} files.`);
      return;
    }

    const processedFiles = newFiles.map(f => {
      const validation = validateFile(f);
      const url = URL.createObjectURL(f);
      return { file: f, valid: validation.valid, error: validation.error, url };
    });

    setFiles(prev => [...prev, ...processedFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };

  const handleReplaceChange = (e) => {
    if (replaceIndex === -1 || !e.target.files.length) return;
    setErrorMsg('');
    setSuccessMsg('');

    const newFile = e.target.files[0];
    const validation = validateFile(newFile);
    const url = URL.createObjectURL(newFile);

    setFiles(prev => {
      const newFilesArray = [...prev];
      const oldItem = newFilesArray[replaceIndex];
      if (oldItem.url) {
        URL.revokeObjectURL(oldItem.url);
      }
      newFilesArray[replaceIndex] = {
        file: newFile,
        valid: validation.valid,
        error: validation.error,
        url: url
      };
      return newFilesArray;
    });

    setReplaceIndex(-1);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
  };

  const handleRemove = (index) => {
    setFiles(prev => {
      const newFilesArray = [...prev];
      const removedItem = newFilesArray[index];
      if (removedItem.url) {
        URL.revokeObjectURL(removedItem.url);
      }
      newFilesArray.splice(index, 1);
      return newFilesArray;
    });
  };

  const triggerReplace = (index) => {
    setReplaceIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  const handleSubmit = () => {
    const validCount = files.filter(f => f.valid).length;
    setSuccessMsg(`Successfully submitted ${validCount} file(s)!`);
    files.forEach(item => {
      if (item.url) URL.revokeObjectURL(item.url);
    });
    setFiles([]);

    setTimeout(() => {
      setSuccessMsg('');
    }, 2000);
  };

  const validCount = files.filter(item => item.valid).length;

  return (
    <div className="container">
      <h2>File Upload & Preview</h2>
      <p>Select up to 10 files (Max 10MB each).</p>

      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <input
        type="file"
        style={{ display: 'none' }}
        ref={replaceInputRef}
        onChange={handleReplaceChange}
      />

      {errorMsg && <div id="error-msg">{errorMsg}</div>}

      <div id="file-list">
        {files.map((item, index) => (
          <div key={index} className={`file-item ${!item.valid ? 'invalid' : ''}`}>
            <div className="file-info">
              <strong>{item.file.name}</strong>{' '}
              <span className="file-size">({formatSize(item.file.size)})</span>
              <br />
              {item.valid ? (
                <span style={{ color: 'green' }}>Valid</span>
              ) : (
                <span style={{ color: 'red' }}>{item.error}</span>
              )}
            </div>

            <div>
              {item.valid && (
                <button onClick={() => window.open(item.url, '_blank')}>
                  Preview
                </button>
              )}
              <button onClick={() => triggerReplace(index)}>
                Replace
              </button>
              <button onClick={() => handleRemove(index)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {files.length > 0 && (
        <div id="submit-section">
          <p id="submit-summary">{validCount} valid file(s) ready to submit.</p>
          <button
            id="submit-btn"
            onClick={handleSubmit}
            disabled={validCount === 0}
          >
            Submit Files
          </button>
        </div>
      )}

      {successMsg && <p id="success-msg">{successMsg}</p>}
    </div>
  );
}

export default App;
