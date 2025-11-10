// Déclaration des types globaux

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    MONGODB_URI: string;
    JWT_SECRET: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    CLOUDINARY_CLOUD_NAME?: string;
    CLOUDINARY_API_KEY?: string;
    CLOUDINARY_API_SECRET?: string;
    EMAIL_SERVER?: string;
    EMAIL_FROM?: string;
    NEXT_PUBLIC_APP_URL?: string;
  }
}

// Déclaration pour les fichiers de modules manquants
declare module 'cloudinary' {
  const v2: {
    config: (config: {
      cloud_name: string;
      api_key: string;
      api_secret: string;
      secure?: boolean;
    }) => void;
    uploader: {
      upload: (
        file: string | Buffer,
        options?: any
      ) => Promise<{
        secure_url: string;
        public_id: string;
        [key: string]: any;
      }>;
      upload_stream: (
        options: any,
        callback: (error: any, result: any) => void
      ) => NodeJS.WritableStream;
      destroy: (
        publicId: string,
        options?: { resource_type?: string }
      ) => Promise<any>;
    };
    url: (
      publicId: string,
      options: {
        secure: boolean;
        transformation?: any[] | any;
        [key: string]: any;
      }
    ) => string;
  };
  
  export = { v2 };
}

// Déclaration pour les fichiers de modules manquants
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}

// Déclaration pour les modules CSS
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}
