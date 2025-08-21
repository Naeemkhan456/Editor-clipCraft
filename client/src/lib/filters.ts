// Canvas-based real-time filter effects

export interface FilterOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hue?: number;
  blur?: number;
  sepia?: number;
  vintage?: boolean;
  blackAndWhite?: boolean;
  // Advanced filters
  gamma?: number;
  exposure?: number;
  shadows?: number;
  highlights?: number;
  temperature?: number;
  tint?: number;
  vibrance?: number;
  clarity?: number;
  grain?: number;
  vignette?: number;
  // Color grading
  shadowsColor?: string;
  midtonesColor?: string;
  highlightsColor?: string;
  // LUT support
  lut?: string;
  lutIntensity?: number;
}

export interface LUTFilter {
  name: string;
  description: string;
  category: 'cinematic' | 'vintage' | 'modern' | 'artistic';
  intensity: number;
}

export class CanvasFilterProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  applyFilters(imageSource: HTMLImageElement | HTMLVideoElement, filters: FilterOptions): ImageData {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Apply CSS filters first
    this.ctx.filter = this.buildCSSFilter(filters);
    
    // Draw the image/video frame
    this.ctx.drawImage(imageSource, 0, 0, this.canvas.width, this.canvas.height);

    // Get image data for further processing
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    // Apply custom pixel-level filters
    if (filters.vintage) {
      this.applyVintageFilter(imageData);
    }

    if (filters.blackAndWhite) {
      this.applyBlackAndWhiteFilter(imageData);
    }

    // Apply advanced filters
    if (filters.gamma !== undefined) {
      this.applyGammaFilter(imageData, filters.gamma);
    }

    if (filters.exposure !== undefined) {
      this.applyExposureFilter(imageData, filters.exposure);
    }

    if (filters.shadows !== undefined) {
      this.applyShadowsFilter(imageData, filters.shadows);
    }

    if (filters.highlights !== undefined) {
      this.applyHighlightsFilter(imageData, filters.highlights);
    }

    if (filters.temperature !== undefined) {
      this.applyTemperatureFilter(imageData, filters.temperature);
    }

    if (filters.tint !== undefined) {
      this.applyTintFilter(imageData, filters.tint);
    }

    if (filters.vibrance !== undefined) {
      this.applyVibranceFilter(imageData, filters.vibrance);
    }

    if (filters.clarity !== undefined) {
      this.applyClarityFilter(imageData, filters.clarity);
    }

    if (filters.grain !== undefined) {
      this.applyGrainFilter(imageData, filters.grain);
    }

    if (filters.vignette !== undefined) {
      this.applyVignetteFilter(imageData, filters.vignette);
    }

    // Apply color grading
    if (filters.shadowsColor || filters.midtonesColor || filters.highlightsColor) {
      this.applyColorGrading(imageData, filters);
    }

    return imageData;
  }

  private buildCSSFilter(filters: FilterOptions): string {
    const filterParts: string[] = [];

    if (filters.brightness !== undefined) {
      filterParts.push(`brightness(${filters.brightness}%)`);
    }

    if (filters.contrast !== undefined) {
      filterParts.push(`contrast(${filters.contrast}%)`);
    }

    if (filters.saturation !== undefined) {
      filterParts.push(`saturate(${filters.saturation}%)`);
    }

    if (filters.hue !== undefined) {
      filterParts.push(`hue-rotate(${filters.hue}deg)`);
    }

    if (filters.blur !== undefined) {
      filterParts.push(`blur(${filters.blur}px)`);
    }

    if (filters.sepia !== undefined) {
      filterParts.push(`sepia(${filters.sepia}%)`);
    }

    return filterParts.join(' ') || 'none';
  }

  private applyVintageFilter(imageData: ImageData): void {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Vintage color grading
      data[i] = Math.min(255, r * 1.2 + 20);     // Red channel
      data[i + 1] = Math.min(255, g * 1.1 + 10); // Green channel
      data[i + 2] = Math.min(255, b * 0.8);      // Blue channel
    }
  }

  private applyBlackAndWhiteFilter(imageData: ImageData): void {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate luminance
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      data[i] = gray;     // Red
      data[i + 1] = gray; // Green
      data[i + 2] = gray; // Blue
    }
  }

  private applyGammaFilter(imageData: ImageData, gamma: number): void {
    const data = imageData.data;
    const gammaCorrection = 1 / gamma;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.pow(data[i] / 255, gammaCorrection) * 255;     // Red
      data[i + 1] = Math.pow(data[i + 1] / 255, gammaCorrection) * 255; // Green
      data[i + 2] = Math.pow(data[i + 2] / 255, gammaCorrection) * 255; // Blue
    }
  }

  private applyExposureFilter(imageData: ImageData, exposure: number): void {
    const data = imageData.data;
    const factor = Math.pow(2, exposure);
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * factor);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
      data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
    }
  }

  private applyShadowsFilter(imageData: ImageData, shadows: number): void {
    const data = imageData.data;
    const factor = shadows / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luminance < 128) {
        data[i] = Math.max(0, data[i] * (1 + factor));     // Red
        data[i + 1] = Math.max(0, data[i + 1] * (1 + factor)); // Green
        data[i + 2] = Math.max(0, data[i + 2] * (1 + factor)); // Blue
      }
    }
  }

  private applyHighlightsFilter(imageData: ImageData, highlights: number): void {
    const data = imageData.data;
    const factor = highlights / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (luminance > 128) {
        data[i] = Math.min(255, data[i] * (1 + factor));     // Red
        data[i + 1] = Math.min(255, data[i + 1] * (1 + factor)); // Green
        data[i + 2] = Math.min(255, data[i + 2] * (1 + factor)); // Blue
      }
    }
  }

  private applyTemperatureFilter(imageData: ImageData, temperature: number): void {
    const data = imageData.data;
    const factor = temperature / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      // Warm (positive) or cool (negative) temperature
      data[i] = Math.min(255, Math.max(0, data[i] + factor * 10));     // Red
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] - factor * 10)); // Blue
    }
  }

  private applyTintFilter(imageData: ImageData, tint: number): void {
    const data = imageData.data;
    const factor = tint / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      // Green-magenta tint adjustment
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + factor * 10)); // Green
    }
  }

  private applyVibranceFilter(imageData: ImageData, vibrance: number): void {
    const data = imageData.data;
    const factor = vibrance / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const avg = (r + g + b) / 3;
      
      if (max > avg) {
        const boost = (max - avg) * factor;
        data[i] = Math.min(255, r + boost);     // Red
        data[i + 1] = Math.min(255, g + boost); // Green
        data[i + 2] = Math.min(255, b + boost); // Blue
      }
    }
  }

  private applyClarityFilter(imageData: ImageData, clarity: number): void {
    const data = imageData.data;
    const factor = clarity / 100;
    const width = imageData.width;
    const height = imageData.height;
    
    // Simple unsharp mask
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Get surrounding pixels
        const top = (y - 1) * width + x;
        const bottom = (y + 1) * width + x;
        const left = y * width + (x - 1);
        const right = y * width + (x + 1);
        
        // Calculate difference
        for (let c = 0; c < 3; c++) {
          const center = data[idx + c];
          const avg = (data[top * 4 + c] + data[bottom * 4 + c] + data[left * 4 + c] + data[right * 4 + c]) / 4;
          const diff = center - avg;
          data[idx + c] = Math.min(255, Math.max(0, center + diff * factor));
        }
      }
    }
  }

  private applyGrainFilter(imageData: ImageData, grain: number): void {
    const data = imageData.data;
    const factor = grain / 100;
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * factor * 50;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));     // Red
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // Green
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // Blue
    }
  }

  private applyVignetteFilter(imageData: ImageData, vignette: number): void {
    const data = imageData.data;
    const factor = vignette / 100;
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
        const vignetteFactor = 1 - (distance / maxDistance) * factor;
        
        for (let c = 0; c < 3; c++) {
          data[idx + c] = Math.max(0, data[idx + c] * vignetteFactor);
        }
      }
    }
  }

  private applyColorGrading(imageData: ImageData, filters: FilterOptions): void {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      
      // Apply shadows color grading
      if (filters.shadowsColor && luminance < 85) {
        const shadowsRGB = this.hexToRgb(filters.shadowsColor);
        if (shadowsRGB) {
          data[i] = Math.min(255, r + shadowsRGB.r * 0.3);     // Red
          data[i + 1] = Math.min(255, g + shadowsRGB.g * 0.3); // Green
          data[i + 2] = Math.min(255, b + shadowsRGB.b * 0.3); // Blue
        }
      }
      
      // Apply midtones color grading
      if (filters.midtonesColor && luminance >= 85 && luminance <= 170) {
        const midtonesRGB = this.hexToRgb(filters.midtonesColor);
        if (midtonesRGB) {
          data[i] = Math.min(255, r + midtonesRGB.r * 0.2);     // Red
          data[i + 1] = Math.min(255, g + midtonesRGB.g * 0.2); // Green
          data[i + 2] = Math.min(255, b + midtonesRGB.b * 0.2); // Blue
        }
      }
      
      // Apply highlights color grading
      if (filters.highlightsColor && luminance > 170) {
        const highlightsRGB = this.hexToRgb(filters.highlightsColor);
        if (highlightsRGB) {
          data[i] = Math.min(255, r + highlightsRGB.r * 0.1);     // Red
          data[i + 1] = Math.min(255, g + highlightsRGB.g * 0.1); // Green
          data[i + 2] = Math.min(255, b + highlightsRGB.b * 0.1); // Blue
        }
      }
    }
  }

  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getDataURL(): string {
    return this.canvas.toDataURL();
  }
}

export const predefinedFilters = {
  none: {},
  vintage: {
    vintage: true,
    sepia: 20,
    contrast: 110,
    brightness: 105,
    temperature: 15,
    grain: 10,
  },
  blackAndWhite: {
    blackAndWhite: true,
    contrast: 120,
    clarity: 20,
  },
  vibrant: {
    saturation: 150,
    contrast: 115,
    brightness: 105,
    vibrance: 30,
  },
  cool: {
    hue: 180,
    saturation: 120,
    brightness: 95,
    temperature: -20,
  },
  warm: {
    hue: -30,
    saturation: 110,
    brightness: 110,
    temperature: 25,
  },
  dramatic: {
    contrast: 140,
    brightness: 80,
    saturation: 130,
    shadows: 30,
    highlights: -20,
    vignette: 40,
  },
  cinematic: {
    contrast: 125,
    saturation: 90,
    brightness: 95,
    shadows: 20,
    highlights: -15,
    clarity: 25,
    grain: 5,
  },
  portrait: {
    contrast: 110,
    saturation: 105,
    brightness: 105,
    clarity: 15,
    vibrance: 20,
    shadows: 10,
  },
  landscape: {
    contrast: 115,
    saturation: 120,
    brightness: 100,
    clarity: 30,
    vibrance: 25,
    highlights: 10,
  },
  retro: {
    vintage: true,
    sepia: 30,
    contrast: 130,
    brightness: 90,
    temperature: 20,
    grain: 15,
    vignette: 30,
  },
  modern: {
    contrast: 110,
    saturation: 95,
    brightness: 100,
    clarity: 20,
    vibrance: 15,
    shadows: 5,
    highlights: 5,
  },
};

export const lutFilters: LUTFilter[] = [
  {
    name: "Cinematic",
    description: "Professional cinematic look",
    category: "cinematic",
    intensity: 0.8
  },
  {
    name: "Vintage Film",
    description: "Classic film stock look",
    category: "vintage",
    intensity: 0.7
  },
  {
    name: "Modern",
    description: "Contemporary digital look",
    category: "modern",
    intensity: 0.6
  },
  {
    name: "Artistic",
    description: "Creative color grading",
    category: "artistic",
    intensity: 0.9
  }
];
