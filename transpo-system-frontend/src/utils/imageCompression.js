/**
 * Compresses an image file to fit within size and dimension constraints
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 1)
 * @param {number} options.maxWidthOrHeight - Maximum width or height in pixels (default: 800)
 * @param {number} options.quality - Image quality 0-1 (default: 0.85)
 * @returns {Promise<string>} - Base64 encoded compressed image
 */
export const compressImage = (file, options = {}) => {
  const {
    maxSizeMB = 1,
    maxWidthOrHeight = 800,
    quality = 0.85
  } = options;

  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = (height * maxWidthOrHeight) / width;
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = (width * maxWidthOrHeight) / height;
            height = maxWidthOrHeight;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw image on canvas with better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try to compress to target size
        let currentQuality = quality;
        let attempts = 0;
        const maxAttempts = 10;
        
        const tryCompress = () => {
          const dataUrl = canvas.toDataURL('image/jpeg', currentQuality);
          
          // Calculate size in MB
          const base64Length = dataUrl.split(',')[1].length;
          const sizeInMB = (base64Length * 3) / 4 / (1024 * 1024);
          
          // If size is acceptable or we've tried enough times, resolve
          if (sizeInMB <= maxSizeMB || attempts >= maxAttempts || currentQuality <= 0.1) {
            resolve(dataUrl);
          } else {
            // Reduce quality and try again
            attempts++;
            currentQuality -= 0.1;
            tryCompress();
          }
        };
        
        tryCompress();
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Gets the size of a base64 image in MB
 * @param {string} base64String - Base64 encoded image
 * @returns {number} - Size in MB
 */
export const getBase64Size = (base64String) => {
  const base64Length = base64String.split(',')[1]?.length || 0;
  return (base64Length * 3) / 4 / (1024 * 1024);
};
