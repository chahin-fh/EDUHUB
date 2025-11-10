import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { config } from '../config';

// Configuration de Cloudinary
if (config.storage.cloudName && config.storage.apiKey && config.storage.apiSecret) {
  cloudinary.config({
    cloud_name: config.storage.cloudName,
    api_key: config.storage.apiKey,
    api_secret: config.storage.apiSecret,
    secure: true,
  });
}

type UploadOptions = {
  folder: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  publicId?: string;
  overwrite?: boolean;
  transformation?: any[];
};

export const uploadFile = async (
  file: File | Buffer | string,
  options: UploadOptions
): Promise<{ url: string; publicId: string }> => {
  try {
    const uploadOptions: any = {
      folder: options.folder,
      resource_type: options.resourceType || 'auto',
      overwrite: options.overwrite !== false,
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    let uploadResult;

    if (typeof file === 'string') {
      // Si c'est une URL
      uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
    } else if (file instanceof Buffer) {
      // Si c'est un buffer
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result);
            else reject(new Error('No result from Cloudinary'));
          }
        );

        const bufferStream = new Readable();
        bufferStream.push(file);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
      });
    } else if (file instanceof File) {
      // Si c'est un objet File (depuis le navigateur)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      uploadResult = await uploadFile(buffer, options);
    } else {
      throw new Error('Type de fichier non pris en charge');
    }

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    throw new Error(
      'Une erreur est survenue lors du téléchargement du fichier'
    );
  }
};

export const deleteFile = async (publicId: string, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    throw new Error('Une erreur est survenue lors de la suppression du fichier');
  }
};

export const getFileUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'pad' | 'scale';
  quality?: number;
  format?: string;
} = {}): string => {
  const transformations = [];
  
  if (options.width || options.height) {
    transformations.push({
      width: options.width,
      height: options.height,
      crop: options.crop || 'fill',
    });
  }
  
  if (options.quality) {
    transformations.push({
      quality: 'auto:best',
      fetch_format: 'auto',
    });
  }
  
  if (options.format) {
    transformations.push({
      fetch_format: options.format,
    });
  }
  
  return cloudinary.url(publicId, {
    secure: true,
    transformation: transformations,
  });
};
