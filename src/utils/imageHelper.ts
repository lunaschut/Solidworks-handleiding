/**
 * Utility to convert SVG data URL or image elements to PNG base64
 * for reliable vision model ingestion.
 */
export async function convertToPngBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  // If it's already a standard base64 image (PNG, JPEG, WEBP)
  if (imageUrl.startsWith('data:image/png;base64,') || imageUrl.startsWith('data:image/jpeg;base64,') || imageUrl.startsWith('data:image/webp;base64,')) {
    const parts = imageUrl.split(';base64,');
    const mime = parts[0].replace('data:', '');
    return { base64: parts[1], mimeType: mime };
  }

  // If it's SVG or external image, render to offscreen canvas
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(img.naturalWidth || img.width || 800, 800);
      canvas.height = Math.max(img.naturalHeight || img.height || 600, 600);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context kon niet worden aangemaakt.'));
        return;
      }
      // Fill clean white background for technical drawings
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const pngDataUrl = canvas.toDataURL('image/png');
      const base64 = pngDataUrl.replace(/^data:image\/png;base64,/, '');
      resolve({ base64, mimeType: 'image/png' });
    };
    img.onerror = (e) => reject(new Error('Afbeelding kon niet worden geladen voor conversie. ' + e));
    img.src = imageUrl;
  });
}
