import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ImageUploader = ({
  value = '',
  onChange,
  label = 'Cover Image',
  recommendedSize = '1200 x 630px (Max 5MB)',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Preset sample high quality imagery options for demo purposes
  const presetSamples = [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  ];

  const handleSimulatedUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      // Pick random sample or set sample
      const randomImage = presetSamples[Math.floor(Math.random() * presetSamples.length)];
      onChange(randomImage);
      setIsUploading(false);
    }, 600);
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
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={value}
            alt="Preview"
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
              Replace
            </Button>
            <Button
              size="sm"
              variant="danger"
              icon={X}
              onClick={() => onChange('')}
            >
              Remove
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
          onClick={handleSimulatedUpload}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
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
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <UploadCloud size={22} />
            )}
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: 0 }}>
            {isUploading ? 'Uploading Image Asset...' : 'Click or Drag image file to upload'}
          </p>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px 0' }}>
            Supports PNG, JPG, WebP up to 5MB ({recommendedSize})
          </p>
          <Button
            size="sm"
            variant="secondary"
            icon={ImageIcon}
            isLoading={isUploading}
          >
            Choose File from Computer
          </Button>
        </div>
      )}
    </div>
  );
};
