import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { config } from '../config/env.js';

// Ensure upload directories exist
const profilesDir = path.resolve(config.uploadDir, 'profiles');
const documentsDir = path.resolve(config.uploadDir, 'documents');
fs.mkdirSync(profilesDir, { recursive: true });
fs.mkdirSync(documentsDir, { recursive: true });

const profilePictureStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, profilesDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const documentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, documentsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const imageFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const documentFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'));
  }
};

export const uploadMiddleware = {
  profilePicture: multer({
    storage: profilePictureStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  }).single('profilePicture'),

  document: multer({
    storage: documentStorage,
    fileFilter: documentFilter,
    limits: { fileSize: config.maxFileSize }, // 5MB default
  }).single('document'),
};
