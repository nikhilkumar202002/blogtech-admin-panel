import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Eye,
  Edit3,
} from 'lucide-react';

export const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Write article content...',
  minHeight = '320px',
}) => {
  const [mode, setMode] = useState('edit');

  const handleFormat = (tagStart, tagEnd = '') => {
    if (mode === 'preview') return;
    const textarea = document.getElementById('rich-text-input');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'text';
    const replacement = `${tagStart}${selectedText}${tagEnd}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + tagStart.length,
        start + tagStart.length + selectedText.length
      );
    }, 0);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
      }}
    >
      {/* Editor Header Toolbar */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
          <ToolbarButton icon={Heading1} title="Heading 1" onClick={() => handleFormat('<h1>', '</h1>')} />
          <ToolbarButton icon={Heading2} title="Heading 2" onClick={() => handleFormat('<h2>', '</h2>')} />
          <ToolbarButton icon={Heading3} title="Heading 3" onClick={() => handleFormat('<h3>', '</h3>')} />

          <Divider />

          <ToolbarButton icon={Bold} title="Bold" onClick={() => handleFormat('<strong>', '</strong>')} />
          <ToolbarButton icon={Italic} title="Italic" onClick={() => handleFormat('<em>', '</em>')} />
          <ToolbarButton icon={Underline} title="Underline" onClick={() => handleFormat('<u>', '</u>')} />

          <Divider />

          <ToolbarButton icon={List} title="Bullet List" onClick={() => handleFormat('<ul>\n  <li>', '</li>\n</ul>')} />
          <ToolbarButton icon={ListOrdered} title="Numbered List" onClick={() => handleFormat('<ol>\n  <li>', '</li>\n</ol>')} />

          <Divider />

          <ToolbarButton icon={LinkIcon} title="Hyperlink" onClick={() => handleFormat('<a href="https://">', '</a>')} />
          <ToolbarButton icon={Quote} title="Blockquote" onClick={() => handleFormat('<blockquote>', '</blockquote>')} />
          <ToolbarButton icon={ImageIcon} title="Insert Image" onClick={() => handleFormat('<img src="https://" alt="', '" />')} />

          <Divider />

          <ToolbarButton icon={AlignLeft} title="Align Left" onClick={() => handleFormat('<div style="text-align:left;">', '</div>')} />
          <ToolbarButton icon={AlignCenter} title="Align Center" onClick={() => handleFormat('<div style="text-align:center;">', '</div>')} />
          <ToolbarButton icon={AlignRight} title="Align Right" onClick={() => handleFormat('<div style="text-align:right;">', '</div>')} />

          <Divider />

          <ToolbarButton icon={Undo} title="Undo" onClick={() => {}} />
          <ToolbarButton icon={Redo} title="Redo" onClick={() => {}} />
        </div>

        {/* View mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button
            type="button"
            onClick={() => setMode('edit')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: mode === 'edit' ? '#ffffff' : 'transparent',
              color: mode === 'edit' ? '#4f46e5' : '#64748b',
              boxShadow: mode === 'edit' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
            }}
          >
            <Edit3 size={13} />
            Edit
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: 500,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: mode === 'preview' ? '#ffffff' : 'transparent',
              color: mode === 'preview' ? '#4f46e5' : '#64748b',
              boxShadow: mode === 'preview' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
            }}
          >
            <Eye size={13} />
            Preview
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      {mode === 'edit' ? (
        <textarea
          id="rich-text-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            minHeight,
            padding: '16px',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
            color: '#0f172a',
            backgroundColor: '#ffffff',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            lineHeight: 1.65,
          }}
        />
      ) : (
        <div
          style={{
            minHeight,
            padding: '16px',
            fontSize: '14px',
            color: '#0f172a',
            backgroundColor: '#fafafa',
            lineHeight: 1.65,
          }}
          dangerouslySetInnerHTML={{ __html: value || '<p style="color:#94a3b8;font-style:italic;">Nothing to preview yet.</p>' }}
        />
      )}

      {/* Footer Info */}
      <div
        style={{
          padding: '6px 12px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          fontSize: '11px',
          color: '#64748b',
        }}
      >
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
};

const Divider = () => (
  <div style={{ width: '1px', height: '18px', backgroundColor: '#cbd5e1', margin: '0 4px' }} />
);

const ToolbarButton = ({ icon: Icon, title, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    style={{
      padding: '4px 6px',
      background: 'none',
      border: 'none',
      borderRadius: '4px',
      color: '#475569',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <Icon size={14} />
  </button>
);

