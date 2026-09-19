'use client';

import { useState, useRef, useCallback } from 'react';
import { getEmpDashBrowserClient } from '@/lib/supabase/client';
import { saveFileMetadataAction } from '@/app/emp-dash/upload-action';
import type { EmpFile } from '@/lib/supabase/types';

interface FileUploaderProps {
  domainId: string;
  taskId?: string | null;
  existingFiles?: EmpFile[];
  onFileUploaded?: (file: EmpFile) => void;
  onFileDeleted?: (fileId: string) => void;
  compact?: boolean; // smaller inline mode for use inside task thread
}

interface UploadItem {
  id: string;
  file: File;
  progress: number; // 0-100
  error: string | null;
  done: boolean;
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']);
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string | null }) {
  if (!mimeType) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  );
  if (mimeType.startsWith('image/')) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  );
  if (mimeType.includes('pdf')) return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
  );
}

export function FileUploader({ domainId, taskId, existingFiles = [], onFileUploaded, compact = false }: FileUploaderProps) {
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateUpload(id: string, patch: Partial<UploadItem>) {
    setUploads(prev => prev.map(u => u.id === id ? { ...u, ...patch } : u));
  }

  async function uploadFile(file: File) {
    if (file.size > MAX_SIZE_BYTES) {
      return { error: `${file.name} exceeds 50 MB limit` };
    }

    const uploadId = `${Date.now()}-${Math.random()}`;
    const uploadItem: UploadItem = { id: uploadId, file, progress: 0, error: null, done: false };
    setUploads(prev => [...prev, uploadItem]);

    const supabase = getEmpDashBrowserClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${domainId}/${taskId ?? 'general'}/${Date.now()}_${safeName}`;

    updateUpload(uploadId, { progress: 10 });

    const { error: storageErr } = await supabase.storage
      .from('emp-dash-files')
      .upload(storagePath, file, { upsert: false, contentType: file.type });

    if (storageErr) {
      updateUpload(uploadId, { error: storageErr.message, done: true });
      return { error: storageErr.message };
    }

    updateUpload(uploadId, { progress: 80 });

    const result = await saveFileMetadataAction(
      storagePath, file.name, file.type, file.size, domainId, taskId ?? null,
    );

    if (result?.error) {
      updateUpload(uploadId, { error: result.error, done: true });
      return { error: result.error };
    }

    updateUpload(uploadId, { progress: 100, done: true });
    setTimeout(() => setUploads(prev => prev.filter(u => u.id !== uploadId)), 3000);
    return { success: true };
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [domainId, taskId]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  if (compact) {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
        <input
          ref={fileInputRef} type="file" multiple
          style={{ display:'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <button type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            padding:'6px 12px', borderRadius:'10px',
            border:'1px solid rgba(0,0,0,0.1)', background:'rgba(255,255,255,0.8)',
            fontSize:'12px', color:'#6b7280', cursor:'pointer',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            transition:'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(249,115,22,0.06)'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.8)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
          Attach
        </button>
        {uploads.filter(u => !u.done || u.error).map(u => (
          <span key={u.id} style={{ fontSize:'11px', color: u.error ? '#ef4444' : '#9ca3af' }}>
            {u.error ?? `${u.progress}%`}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      {/* Drop zone */}
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? '#f97316' : 'rgba(0,0,0,0.12)'}`,
          borderRadius:'16px',
          padding:'32px 20px',
          textAlign:'center',
          cursor:'pointer',
          background: dragging ? 'rgba(249,115,22,0.04)' : 'rgba(255,255,255,0.5)',
          transition:'all 0.15s',
        }}
      >
        <input
          ref={fileInputRef} type="file" multiple
          style={{ display:'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', pointerEvents:'none' }}>
          <div style={{
            width:'44px', height:'44px', borderRadius:'12px',
            background: dragging ? 'rgba(249,115,22,0.12)' : 'rgba(0,0,0,0.05)',
            display:'flex', alignItems:'center', justifyContent:'center',
            color: dragging ? '#f97316' : '#9ca3af', transition:'all 0.15s',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
          </div>
          <p style={{ fontSize:'14px', color:'#374151', fontWeight:500 }}>
            {dragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p style={{ fontSize:'12px', color:'#9ca3af' }}>Max 50 MB per file</p>
        </div>
      </div>

      {/* Upload progress */}
      {uploads.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {uploads.map(u => (
            <div key={u.id} style={{
              padding:'10px 14px', borderRadius:'12px',
              background: u.error ? '#fff1f2' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${u.error ? '#fecdd3' : 'rgba(0,0,0,0.08)'}`,
              display:'flex', alignItems:'center', gap:'10px',
            }}>
              <div style={{ color: u.error ? '#ef4444' : '#9ca3af', flexShrink:0 }}>
                <FileIcon mimeType={u.file.type} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:'13px', fontWeight:500, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {u.file.name}
                </div>
                {u.error ? (
                  <div style={{ fontSize:'11px', color:'#ef4444', marginTop:'2px' }}>{u.error}</div>
                ) : u.done ? (
                  <div style={{ fontSize:'11px', color:'#10b981', marginTop:'2px' }}>Uploaded</div>
                ) : (
                  <div style={{ marginTop:'6px', height:'3px', borderRadius:'2px', background:'rgba(0,0,0,0.08)', overflow:'hidden' }}>
                    <div style={{
                      height:'100%', borderRadius:'2px',
                      background:'linear-gradient(90deg,#f97316,#f43f5e)',
                      width:`${u.progress}%`, transition:'width 0.3s',
                    }} />
                  </div>
                )}
              </div>
              <div style={{ fontSize:'11px', color:'#9ca3af', flexShrink:0 }}>{formatBytes(u.file.size)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Existing files list */}
      {existingFiles.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
          <div style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'4px' }}>
            Attached Files
          </div>
          {existingFiles.map(f => (
            <ExistingFileRow key={f.id} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExistingFileRow({ file }: { file: EmpFile }) {
  const [hover, setHover] = useState(false);

  async function getUrl() {
    const supabase = getEmpDashBrowserClient();
    const { data } = await supabase.storage.from('emp-dash-files').createSignedUrl(file.storage_path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  }

  const isImage = file.mime_type ? IMAGE_TYPES.has(file.mime_type) : false;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display:'flex', alignItems:'center', gap:'10px',
        padding:'10px 14px', borderRadius:'12px',
        background: hover ? 'rgba(249,115,22,0.04)' : 'rgba(255,255,255,0.6)',
        border:'1px solid rgba(0,0,0,0.08)', cursor:'pointer',
        transition:'background 0.12s',
      }}
      onClick={getUrl}
    >
      <div style={{ color:'#9ca3af', flexShrink:0 }}>
        <FileIcon mimeType={file.mime_type} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'13px', fontWeight:500, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {file.filename}
        </div>
        <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'1px' }}>
          {file.size_bytes ? formatBytes(file.size_bytes) : ''}
          {isImage && ' · Image'}
        </div>
      </div>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </div>
  );
}
