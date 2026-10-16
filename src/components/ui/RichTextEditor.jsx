import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Eye,
  Edit3,
  FileCode,
  RemoveFormatting,
  Minus,
  Sparkles,
  Check,
  Type,
} from 'lucide-react';

export const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Start typing product features, specifications, or description as in MS Word...',
  minHeight = '320px',
  label = 'Product Content',
}) => {
  // Modes: 'visual' (Word-like WYSIWYG) | 'code' (Raw HTML) | 'preview'
  const [mode, setMode] = useState('visual');
  const [isFocused, setIsFocused] = useState(false);

  // Link Dialog State
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');

  const editorRef = useRef(null);
  const lastHtmlRef = useRef(value);

  // Initialize or update innerHTML when value changes from outside (e.g. API load)
  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '';
        lastHtmlRef.current = value || '';
      }
    }
  }, [value, mode]);

  // Execute MS Word-style execCommand
  const execCmd = (command, valueArg = null) => {
    if (mode !== 'visual') return;
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand(command, false, valueArg);
    handleEditorInput();
  };

  // Sync content on input
  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      lastHtmlRef.current = html;
      if (onChange) {
        onChange(html);
      }
    }
  };

  // Insert Custom Tag / Heading Block
  const handleBlockFormat = (tag) => {
    if (mode !== 'visual') return;
    execCmd('formatBlock', tag);
  };

  // Insert Hyperlink
  const handleInsertLink = () => {
    if (!linkUrl.trim() || linkUrl === 'https://') return;
    execCmd('createLink', linkUrl);
    setIsLinkDialogOpen(false);
    setLinkUrl('https://');
  };

  // Word & Character count calculation
  const cleanText = (value || '').replace(/<[^>]+>/g, ' ').trim();
  const wordCount = cleanText ? cleanText.split(/\s+/).length : 0;
  const charCount = cleanText.length;

  return (
    <div
      className={`w-full bg-white border rounded-xl overflow-hidden shadow-xs transition-all flex flex-col ${
        isFocused ? 'border-indigo-600 ring-2 ring-indigo-500/15' : 'border-slate-200'
      }`}
    >
      {/* WORD-STYLE TOOLBAR HEADER */}
      <div className="bg-slate-50/90 border-b border-slate-200 p-2 sm:px-3 flex items-center justify-between gap-2 flex-wrap select-none">
        {/* Left Toolbar Controls (Only active in visual mode) */}
        <div className={`flex items-center gap-1 flex-wrap ${mode !== 'visual' ? 'opacity-40 pointer-events-none' : ''}`}>
          {/* Paragraph / Heading Selector */}
          <select
            onChange={(e) => {
              handleBlockFormat(e.target.value);
              e.target.value = '';
            }}
            defaultValue=""
            title="Style / Heading"
            className="px-2 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md outline-none hover:bg-slate-50 cursor-pointer shadow-2xs"
          >
            <option value="" disabled>Format Style</option>
            <option value="<p>">Normal Text</option>
            <option value="<h1>">Heading 1</option>
            <option value="<h2>">Heading 2</option>
            <option value="<h3>">Heading 3</option>
            <option value="<blockquote>">Quote Block</option>
          </select>

          <ToolbarDivider />

          {/* Font Styles: Bold, Italic, Underline, Strikethrough */}
          <ToolbarButton
            icon={Bold}
            title="Bold (Ctrl+B)"
            onClick={() => execCmd('bold')}
          />
          <ToolbarButton
            icon={Italic}
            title="Italic (Ctrl+I)"
            onClick={() => execCmd('italic')}
          />
          <ToolbarButton
            icon={Underline}
            title="Underline (Ctrl+U)"
            onClick={() => execCmd('underline')}
          />
          <ToolbarButton
            icon={Strikethrough}
            title="Strikethrough"
            onClick={() => execCmd('strikeThrough')}
          />

          <ToolbarDivider />

          {/* Alignment: Left, Center, Right, Justify */}
          <ToolbarButton
            icon={AlignLeft}
            title="Align Left"
            onClick={() => execCmd('justifyLeft')}
          />
          <ToolbarButton
            icon={AlignCenter}
            title="Align Center"
            onClick={() => execCmd('justifyCenter')}
          />
          <ToolbarButton
            icon={AlignRight}
            title="Align Right"
            onClick={() => execCmd('justifyRight')}
          />
          <ToolbarButton
            icon={AlignJustify}
            title="Justify"
            onClick={() => execCmd('justifyFull')}
          />

          <ToolbarDivider />

          {/* Lists: Bullet, Numbered */}
          <ToolbarButton
            icon={List}
            title="Bullet List"
            onClick={() => execCmd('insertUnorderedList')}
          />
          <ToolbarButton
            icon={ListOrdered}
            title="Numbered List"
            onClick={() => execCmd('insertOrderedList')}
          />

          <ToolbarDivider />

          {/* Insert Tools: Link, Divider, Clear Formatting */}
          <ToolbarButton
            icon={LinkIcon}
            title="Insert Link"
            onClick={() => setIsLinkDialogOpen(true)}
          />
          <ToolbarButton
            icon={Minus}
            title="Horizontal Divider"
            onClick={() => execCmd('insertHorizontalRule')}
          />
          <ToolbarButton
            icon={RemoveFormatting}
            title="Clear Formatting"
            onClick={() => execCmd('removeFormat')}
          />

          <ToolbarDivider />

          {/* Undo / Redo */}
          <ToolbarButton
            icon={Undo}
            title="Undo (Ctrl+Z)"
            onClick={() => execCmd('undo')}
          />
          <ToolbarButton
            icon={Redo}
            title="Redo (Ctrl+Y)"
            onClick={() => execCmd('redo')}
          />
        </div>

        {/* Right View Switcher: Word (Visual) | HTML Code | Preview */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs shrink-0">
          <button
            type="button"
            onClick={() => setMode('visual')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'visual'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Visual WYSIWYG Mode (Like Microsoft Word)"
          >
            <Edit3 size={13} />
            <span>Word View</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('code')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'code'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Edit Raw HTML Code"
          >
            <FileCode size={13} />
            <span>HTML</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              mode === 'preview'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="Preview formatted content"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* LINK INSERT MODAL POPUP */}
      {isLinkDialogOpen && (
        <div className="p-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 animate-in fade-in">
          <LinkIcon size={16} className="text-indigo-600 shrink-0" />
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-md outline-none focus:border-indigo-600 font-mono"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsertLink();
              if (e.key === 'Escape') setIsLinkDialogOpen(false);
            }}
          />
          <button
            type="button"
            onClick={handleInsertLink}
            className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md cursor-pointer"
          >
            Apply Link
          </button>
          <button
            type="button"
            onClick={() => setIsLinkDialogOpen(false)}
            className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* EDITOR CANVAS AREA */}
      <div className="relative flex-1 bg-white">
        {/* MODE 1: VISUAL (WORD-LIKE CONTENTEDITABLE) */}
        {mode === 'visual' && (
          <div
            ref={editorRef}
            contentEditable={true}
            onInput={handleEditorInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ minHeight }}
            data-placeholder={placeholder}
            className="p-5 sm:p-6 text-sm text-slate-900 outline-none leading-relaxed prose prose-slate max-w-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none"
          />
        )}

        {/* MODE 2: HTML SOURCE CODE VIEW */}
        {mode === 'code' && (
          <textarea
            value={value}
            onChange={(e) => {
              if (onChange) onChange(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            style={{ minHeight }}
            placeholder="<h2>Heading</h2><p>Content paragraph...</p>"
            className="w-full p-4 text-xs font-mono text-slate-800 bg-slate-50/50 outline-none resize-y border-none leading-relaxed"
          />
        )}

        {/* MODE 3: LIVE PREVIEW VIEW */}
        {mode === 'preview' && (
          <div
            style={{ minHeight }}
            className="p-5 sm:p-6 text-sm text-slate-900 bg-slate-50/30 leading-relaxed prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{
              __html:
                value ||
                '<p class="text-slate-400 italic">No content written yet. Switch to Word View to compose.</p>',
            }}
          />
        )}
      </div>

      {/* EDITOR FOOTER STATUS BAR */}
      <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
            <Type size={12} className="text-slate-400" />
            Mode: {mode === 'visual' ? 'MS Word Visual' : mode === 'code' ? 'HTML Code' : 'Preview'}
          </span>
          <span className="hidden sm:inline text-slate-300">•</span>
          <span className="hidden sm:inline">Use Ctrl+B (Bold), Ctrl+I (Italic), Ctrl+U (Underline)</span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
      </div>
    </div>
  );
};

const ToolbarDivider = () => (
  <div className="w-px h-4 bg-slate-200 mx-1 shrink-0" />
);

const ToolbarButton = ({ icon: Icon, title, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer flex items-center justify-center shrink-0"
  >
    <Icon size={14} />
  </button>
);

export default RichTextEditor;
