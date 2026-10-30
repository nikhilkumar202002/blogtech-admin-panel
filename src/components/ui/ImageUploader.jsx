import { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  RefreshCw,
  Link as LinkIcon,
  AlertCircle,
  FileImage,
} from 'lucide-react';
import { Button } from './Button';
import { useToast } from './ToastContext';

export const ImageUploader = ({
  value = '',
  onChange,
  onFileSelect,
  label = 'Featured Image',
  recommendedSize = '1200 x 630px (Max 5MB)',
  maxSizeMB = 5,
}) => {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileMeta, setFileMeta] = useState(null);

  // Validate and process device file
  const processFile = (file) => {
    setErrorMessage('');

    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      const msg = 'Please select a valid image file (PNG, JPG, WebP, GIF, SVG).';
      setErrorMessage(msg);
      addToast({ title: 'Invalid File Type', message: msg, type: 'error' });
      return;
    }

    // Check size limit (maxSizeMB)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const msg = `Image size exceeds the ${maxSizeMB}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`;
      setErrorMessage(msg);
      addToast({ title: 'File Too Large', message: msg, type: 'error' });
      return;
    }

    // Read real file from device
    const reader = new FileReader();
    setIsUploading(true);
    setUploadProgress(15);

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.min(95, Math.round((event.loaded / event.total) * 100));
        setUploadProgress(percent);
      }
    };

    reader.onload = (e) => {
      setUploadProgress(100);
      const dataUrl = e.target?.result;

      setTimeout(() => {
        onChange && onChange(dataUrl);
        onFileSelect && onFileSelect(file, dataUrl);
        setFileMeta({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        });
        setIsUploading(false);
        setUploadProgress(0);
        addToast({
          title: 'Image Uploaded',
          message: `Successfully loaded ${file.name} from your device.`,
          type: 'success',
        });
      }, 150);
    };

    reader.onerror = () => {
      setIsUploading(false);
      setUploadProgress(0);
      const msg = 'Failed to read image file from device.';
      setErrorMessage(msg);
      addToast({ title: 'Upload Failed', message: msg, type: 'error' });
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset so same file can be chosen again
    e.target.value = '';
  };

  const handleApplyUrl = (e) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;

    onChange && onChange(urlInput.trim());
    setFileMeta(null);
    setShowUrlInput(false);
    setUrlInput('');
    addToast({ title: 'Image Set', message: 'Image URL applied successfully.', type: 'info' });
  };

  const handleRemove = (e) => {
    if (e) e.stopPropagation();
    onChange && onChange('');
    setFileMeta(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hidden Device File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {value ? (
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            backgroundColor: '#0f172a',
            height: '220px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={value}
            alt={label}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Action Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              gap: '8px',
              zIndex: 10,
            }}
          >
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={() => fileInputRef.current?.click()}
              title="Upload different image from your device"
            >
              Replace Image
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={X}
              onClick={handleRemove}
              title="Remove image"
            >
              Remove
            </Button>
          </div>

          {/* Bottom metadata banner if available */}
          {fileMeta && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(4px)',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#f8fafc',
                fontSize: '11.5px',
              }}
            >
              <FileImage size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {fileMeta.name} ({fileMeta.size})
              </span>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Device Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) processFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: isDragging ? '2px dashed #4f46e5' : '2px dashed #cbd5e1',
              borderRadius: '12px',
              padding: '32px 20px',
              textAlign: 'center',
              backgroundColor: isDragging ? '#eef2ff' : '#f8fafc',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
                marginBottom: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              {isUploading ? (
                <RefreshCw size={22} className="animate-spin" />
              ) : (
                <UploadCloud size={24} />
              )}
            </div>

            {isUploading ? (
              <div style={{ width: '100%', maxWidth: '240px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Reading device file... ({uploadProgress}%)
                </div>
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      backgroundColor: '#4f46e5',
                      transition: 'width 0.15s ease',
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                  Upload from Device
                </p>
                <p style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 500, margin: '4px 0 10px 0' }}>
                  Click to browse or drag & drop image
                </p>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Supports PNG, JPG, WebP up to {maxSizeMB}MB ({recommendedSize})
                </p>
              </>
            )}
          </div>

          {/* Optional Paste URL Option */}
          <div style={{ marginTop: '10px' }}>
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#4f46e5'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
              >
                <LinkIcon size={13} />
                <span>Or use an image web URL</span>
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <input
                  type="url"
                  placeholder="Paste direct image URL (https://...)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    outline: 'none',
                  }}
                />
                <Button size="sm" variant="secondary" onClick={handleApplyUrl}>
                  Apply
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowUrlInput(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#b91c1c',
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
