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
  },
  blackAndWhite: {
    blackAndWhite: true,
    contrast: 120,
  },
  vibrant: {
    saturation: 150,
    contrast: 115,
    brightness: 105,
  },
  cool: {
    hue: 180,
    saturation: 120,
    brightness: 95,
  },
  warm: {
    hue: -30,
    saturation: 110,
    brightness: 110,
  },
  dramatic: {
    contrast: 140,
    brightness: 80,
    saturation: 130,
  },
};
