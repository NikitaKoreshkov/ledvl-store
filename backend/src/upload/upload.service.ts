import { Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
  uploadImages(files: Express.Multer.File[]) {
    const uploadedFiles = files.map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/images/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    return {
      message: 'Images uploaded successfully',
      files: uploadedFiles,
    };
  }
}

