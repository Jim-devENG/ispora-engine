import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { DatabaseService } from '../database/database.js';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile } from '../types/index.js';
import { existsSync, mkdirSync } from 'fs';

const router = express.Router();
const db = DatabaseService.getInstance();

// Configure upload directory
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const imagesDir = path.join(uploadDir, 'images');
const documentsDir = path.join(uploadDir, 'documents');
const videosDir = path.join(uploadDir, 'videos');
const audioDir = path.join(uploadDir, 'audio');

// Ensure directories exist
[uploadDir, imagesDir, documentsDir, videosDir, audioDir].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[0];
    let dest = uploadDir;
    
    if (fileType === 'image') dest = imagesDir;
    else if (fileType === 'video') dest = videosDir;
    else if (fileType === 'audio') dest = audioDir;
    else dest = documentsDir;
    
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');
  const allowedDocumentTypes = (process.env.ALLOWED_DOCUMENT_TYPES || 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown').split(',');
  const allowedVideoTypes = (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm').split(',');
  const allowedAudioTypes = (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/wav,audio/ogg').split(',');
  
  const allAllowed = [...allowedImageTypes, ...allowedDocumentTypes, ...allowedVideoTypes, ...allowedAudioTypes];
  
  if (allAllowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
});

// Upload file
router.post('/', authenticate, upload.single('file'), (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = req.file;
    const fileType = file.mimetype.split('/')[0];
    const relativePath = path.relative(process.cwd(), file.path);
    const url = `/uploads/${fileType === 'image' ? 'images' : fileType === 'video' ? 'videos' : fileType === 'audio' ? 'audio' : 'documents'}/${file.filename}`;
    
    const uploadedFile: UploadedFile = {
      id: uuidv4(),
      filename: file.filename,
      originalName: file.originalname,
      url,
      type: file.mimetype,
      size: file.size,
      status: fileType === 'video' ? 'processing' : 'ready',
      uploadedBy: (req as AuthRequest).user!.id,
      uploadedAt: new Date().toISOString(),
    };
    
    const created = db.createUploadedFile(uploadedFile);
    
    // For videos, you might want to trigger processing here
    // For now, we'll just mark it as ready after a delay
    if (fileType === 'video') {
      setTimeout(() => {
        db.updateUploadedFile(created.id, { status: 'ready' });
      }, 5000); // Simulate 5 second processing
    }
    
    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get file by ID
router.get('/:fileId', authenticate, (req, res) => {
  try {
    const file = db.getUploadedFileById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

