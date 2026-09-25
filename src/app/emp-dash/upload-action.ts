// @ts-nocheck
'use server';

import { createEmpDashServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ── Upload file metadata after client-side Supabase Storage upload ─────────────
// The client uploads directly to Supabase Storage (browser → bucket).
// This action writes the metadata row to emp_files + emp_file_versions.

export async function saveFileMetadataAction(
  storagePath: string,
  filename: string,
  mimeType: string,
  sizeBytes: number,
  domainId: string,
  taskId: string | null,
) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Check for existing file with same path (for versioning)
  const { data: existing } = await supabase
    .from('emp_files')
    .select('id')
    .eq('storage_path', storagePath)
    .single();

  if (existing) {
    // Get current max version
    const { data: versions } = await supabase
      .from('emp_file_versions')
      .select('version')
      .eq('file_id', existing.id)
      .order('version', { ascending: false })
      .limit(1);
    const nextVersion = (versions?.[0]?.version ?? 0) + 1;

    // 'emp-dash-files' is a private bucket — getPublicUrl() always 403s and is
    // never read anywhere; real access always goes through FileUploader's
    // on-demand createSignedUrl(storage_path). storage_url stores the same
    // storage_path value so the column holds meaningful (if redundant) data.
    const { error: versionErr } = await supabase.from('emp_file_versions').insert({
      file_id: existing.id,
      version: nextVersion,
      storage_url: storagePath,
      uploaded_by: user.id,
    });
    if (versionErr) return { error: versionErr.message };

    if (taskId) revalidatePath(`/emp-dash/tasks/${taskId}`);
    return { success: true, file_id: existing.id, versioned: true };
  }

  // New file
  const { data: file, error: fileErr } = await supabase
    .from('emp_files')
    .insert({
      task_id: taskId,
      domain_id: domainId,
      filename,
      storage_path: storagePath,
      mime_type: mimeType,
      size_bytes: sizeBytes,
      uploaded_by: user.id,
    })
    .select('id')
    .single();

  if (fileErr || !file) return { error: fileErr?.message ?? 'Failed to save file metadata' };

  // See note above — private bucket, storage_url holds storage_path, not a public URL.
  await supabase.from('emp_file_versions').insert({
    file_id: file.id,
    version: 1,
    storage_url: storagePath,
    uploaded_by: user.id,
  });

  if (taskId) revalidatePath(`/emp-dash/tasks/${taskId}`);
  return { success: true, file_id: file.id, versioned: false };
}

// ── Delete file ───────────────────────────────────────────────────────────────

export async function deleteFileAction(fileId: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: file, error: fetchErr } = await supabase
    .from('emp_files')
    .select('storage_path, task_id, domain_id, uploaded_by')
    .eq('id', fileId)
    .single();

  if (fetchErr || !file) return { error: 'File not found' };

  // Only uploader or admin+ can delete
  const { data: profile } = await supabase
    .from('emp_profiles')
    .select('emp_roles(name)')
    .eq('id', user.id)
    .single();
  const roleName = (profile as { emp_roles: { name: string } } | null)?.emp_roles?.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  if (file.uploaded_by !== user.id && !isAdminPlus) {
    return { error: 'You do not have permission to delete this file' };
  }

  // Delete from storage
  const { error: storageErr } = await supabase.storage
    .from('emp-dash-files')
    .remove([file.storage_path]);
  if (storageErr) return { error: `Storage delete failed: ${storageErr.message}` };

  // Delete metadata (cascades to emp_file_versions)
  const { error: dbErr } = await supabase.from('emp_files').delete().eq('id', fileId);
  if (dbErr) return { error: dbErr.message };

  if (file.task_id) revalidatePath(`/emp-dash/tasks/${file.task_id}`);
  return { success: true };
}
