import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

export const ImageUploader = ({
  value = '',
  onChange,
  label = 'Featured Image',
  recommendedSize = '1200 x 630px (Max 5MB)',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const presetSamples = [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  ];

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            const randomImage = presetSamples[Math.floor(Math.random() * presetSamples.length)];
            onChange(randomImage);
            setIsUploading(false);
            setUploadProgress(0);
          }, 200);
          return 100;
        }
        return prev + 25;
      });
    }, 120);
  };

  return (
    <div style={{ width: '100%' }}>
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
            alt="Featured Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              display: 'flex',
              gap: '8px',
            }}
          >
            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={handleSimulatedUpload}
            >
              Replace Image
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={X}
              onClick={() => onChange('')}
            >
              Remove Image
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleSimulatedUpload();
          }}
          style={{
            border: isDragging ? '2px dashed #4f46e5' : '2px dashed #cbd5e1',
            borderRadius: '12px',
            padding: '36px 20px',
            textAlign: 'center',
            backgroundColor: isDragging ? '#eef2ff' : '#f8fafc',
            transition: 'all 0.15s ease',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleSimulatedUpload}
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
              marginBottom: '14px',
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
                Uploading asset... ({uploadProgress}%)
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
                Drag & drop image here
              </p>
              <p style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 500, margin: '4px 0 12px 0' }}>
                or Browse files
              </p>
              <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                Supports PNG, JPG, WebP up to 5MB ({recommendedSize})
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

