// Supabase Storage Utilities
// This file handles all file uploads to Supabase Storage

import { supabase } from './supabaseClient';
import { getCurrentUser } from './auth';

export interface UploadOptions {
  bucket: string;
  path?: string;
  cacheControl?: string;
  contentType?: string;
  upsert?: boolean;
}

export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  const { user } = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const {
    bucket,
    path = '',
    cacheControl = '3600',
    contentType,
    upsert = false,
  } = options;

  // Generate unique file path
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop() || '';
  const fileName = `${timestamp}-${randomId}.${fileExtension}`;
  const filePath = path ? `${path}/${fileName}` : fileName;

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl,
      contentType: contentType || file.type,
      upsert,
    });

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    fullPath: data.path,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Upload a file to project-specific storage
 */
export async function uploadProjectFile(
  file: File,
  projectId: string,
  category: 'documents' | 'images' | 'videos' | 'audio' | 'other' = 'documents'
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'project-files',
    path: `${projectId}/${category}`,
    contentType: file.type,
  });
}

/**
 * Upload a user avatar
 */
export async function uploadAvatar(
  file: File,
  userId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'avatars',
    path: userId,
    contentType: file.type,
    upsert: true, // Replace existing avatar
  });
}

/**
 * Upload a voice note
 */
export async function uploadVoiceNote(
  file: File,
  projectId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'voice-notes',
    path: `${projectId}/${Date.now()}`,
    contentType: 'audio/webm' || file.type,
  });
}

/**
 * Upload a video recording
 */
export async function uploadRecording(
  file: File,
  projectId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'recordings',
    path: `${projectId}/${Date.now()}`,
    contentType: 'video/webm' || file.type,
  });
}

/**
 * Upload a deliverable file
 */
export async function uploadDeliverable(
  file: File,
  projectId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'deliverables',
    path: `${projectId}/${Date.now()}`,
    contentType: file.type,
  });
}

/**
 * Upload learning content
 */
export async function uploadLearningContent(
  file: File,
  projectId: string,
  contentType: string = 'application/pdf'
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'learning-content',
    path: `${projectId}/${Date.now()}`,
    contentType,
  });
}

/**
 * Upload a research document
 */
export async function uploadResearchDocument(
  file: File,
  projectId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'research-documents',
    path: `${projectId}/${Date.now()}`,
    contentType: file.type,
  });
}

/**
 * Upload a campaign asset
 */
export async function uploadCampaignAsset(
  file: File,
  campaignId: string
): Promise<UploadResult> {
  return uploadFile(file, {
    bucket: 'campaign-assets',
    path: `${campaignId}/${Date.now()}`,
    contentType: file.type,
  });
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: string,
  path: string
): Promise<void> {
  const { user } = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(
  bucket: string,
  path: string
): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Get signed URL for a private file (expires in 1 hour by default)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { user } = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Error creating signed URL:', error);
    throw error;
  }

  return data.signedUrl;
}

/**
 * List files in a bucket path
 */
export async function listFiles(
  bucket: string,
  path: string = ''
): Promise<any[]> {
  const { user } = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) {
    console.error('Error listing files:', error);
    throw error;
  }

  return data || [];
}

/**
 * Download a file
 */
export async function downloadFile(
  bucket: string,
  path: string
): Promise<Blob> {
  const { user } = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    console.error('Error downloading file:', error);
    throw error;
  }

  return data;
}

