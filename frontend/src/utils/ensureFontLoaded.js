// ensureFontLoaded.js - Utility to ensure fonts are loaded before canvas operations

/**
 * Ensures a font is loaded before executing a callback
 * Falls back to alternative methods if the Font Loading API is not available
 */
export async function ensureFontLoaded(fontName, callback) {
  // Method 1: Use the Font Loading API if available
  if ('fonts' in document) {
    try {
      // Load the font
      await document.fonts.load(`bold 72px ${fontName}`);
      
      // Check if it's actually loaded
      if (document.fonts.check(`bold 72px ${fontName}`)) {
        console.log(`${fontName} font loaded successfully`);
        callback();
        return;
      }
    } catch (error) {
      console.warn(`Font loading API error: ${error}`);
    }
  }
  
  // Method 2: Create a test canvas to check if font is available
  const testCanvas = document.createElement('canvas');
  const testCtx = testCanvas.getContext('2d');
  testCanvas.width = 200;
  testCanvas.height = 50;
  
  // Draw with default font
  testCtx.font = '20px sans-serif';
  testCtx.fillText('Test', 10, 30);
  const defaultData = testCtx.getImageData(0, 0, 200, 50).data;
  
  // Clear and draw with requested font
  testCtx.clearRect(0, 0, 200, 50);
  testCtx.font = `20px ${fontName}`;
  testCtx.fillText('Test', 10, 30);
  const fontData = testCtx.getImageData(0, 0, 200, 50).data;
  
  // Compare pixel data to see if font loaded
  let isLoaded = false;
  for (let i = 0; i < defaultData.length; i++) {
    if (defaultData[i] !== fontData[i]) {
      isLoaded = true;
      break;
    }
  }
  
  if (isLoaded) {
    console.log(`${fontName} font detected via canvas test`);
    callback();
  } else {
    // Method 3: Use a timeout fallback
    console.warn(`${fontName} font not detected, using timeout fallback`);
    setTimeout(() => {
      callback();
    }, 500);
  }
}

/**
 * Preloads a font by creating a hidden element with the font applied
 */
export function preloadFont(fontName) {
  const preloader = document.createElement('div');
  preloader.style.fontFamily = fontName;
  preloader.style.fontSize = '72px';
  preloader.style.position = 'absolute';
  preloader.style.left = '-9999px';
  preloader.style.top = '-9999px';
  preloader.style.visibility = 'hidden';
  preloader.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  document.body.appendChild(preloader);
  
  // Remove after a delay
  setTimeout(() => {
    document.body.removeChild(preloader);
  }, 100);
}