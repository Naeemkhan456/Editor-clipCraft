import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// Interfaces
export interface VideoProcessingOptions {
  inputFile: File;
  outputFormat: string;
  resolution: string;
  aspectRatio: string;
  filters?: string[];
  speed?: number;
  volume?: number;
  textOverlays?: TextOverlay[];
  audioTracks?: AudioTrack[];
  transitions?: Transition[];
}

export interface TextOverlay {
  text: string;
  startTime: number;
  endTime: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily?: string;
}

export interface AudioTrack {
  file: File;
  startTime: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface Transition {
  type: 'fade' | 'slide' | 'zoom' | 'dissolve';
  duration: number;
  startTime: number;
}

export interface ProcessingProgress {
  percentage: number;
  stage: string;
  timeRemaining?: number;
}

export class VideoProcessor {
  private static instance: VideoProcessor | null = null;
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;
  public isInitialized = false;

  private constructor() {}

  public static getInstance(): VideoProcessor {
    if (!VideoProcessor.instance) {
      VideoProcessor.instance = new VideoProcessor();
    }
    return VideoProcessor.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isLoaded && this.ffmpeg) {
      console.log('FFmpeg already loaded');
      return;
    }

    try {
      console.log('Starting FFmpeg initialization...');
      this.ffmpeg = new FFmpeg();

      if (!this.ffmpeg) {
        throw new Error('FFmpeg instance is null');
      }

      // Try blob URLs first (more reliable)
      const baseURL = window.location.origin + '/ffmpeg';
      const coreURL = `${baseURL}/ffmpeg-core.js`;
      const wasmURL = `${baseURL}/ffmpeg-core.wasm`;

      console.log('Attempting to load FFmpeg with blob URLs:', { coreURL, wasmURL });

      try {
        // Fetch and create blob URLs
        const [coreResponse, wasmResponse] = await Promise.all([
          fetch(coreURL),
          fetch(wasmURL)
        ]);

        if (!coreResponse.ok) {
          throw new Error(`Failed to fetch core file: ${coreResponse.status} ${coreResponse.statusText}`);
        }
        if (!wasmResponse.ok) {
          throw new Error(`Failed to fetch wasm file: ${wasmResponse.status} ${wasmResponse.statusText}`);
        }

        const [coreBlob, wasmBlob] = await Promise.all([
          coreResponse.blob(),
          wasmResponse.blob()
        ]);

        const coreBlobURL = URL.createObjectURL(coreBlob);
        const wasmBlobURL = URL.createObjectURL(wasmBlob);

        console.log('Created blob URLs for FFmpeg loading');

        await Promise.race([
          this.ffmpeg.load({ coreURL: coreBlobURL, wasmURL: wasmBlobURL }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('FFmpeg blob URL initialization timed out')), 30000)
          )
        ]);

        // Clean up blob URLs
        URL.revokeObjectURL(coreBlobURL);
        URL.revokeObjectURL(wasmBlobURL);

        console.log('FFmpeg loaded successfully with blob URLs');
      } catch (blobError) {
        console.warn('Blob URL loading failed, trying direct URLs as fallback:', blobError);

        // Fallback: Try using direct URLs
        try {
          await Promise.race([
            this.ffmpeg.load({ coreURL, wasmURL }),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('FFmpeg direct URL initialization timed out')), 30000)
            )
          ]);
          console.log('FFmpeg loaded successfully with direct URLs');
        } catch (directError) {
          console.error('Direct URL loading also failed:', directError);
          throw new Error(`All FFmpeg loading methods failed. Blob URL error: ${blobError}. Direct URL error: ${directError}`);
        }
      }

      this.isLoaded = true;
      this.isInitialized = true;
      console.log('FFmpeg initialization completed successfully');
    } catch (error) {
      this.isLoaded = false;
      this.isInitialized = false;
      this.ffmpeg = null;
      console.error('FFmpeg initialization failed:', error);
      throw error;
    }
  }

  private async safeReadFile(outputName: string): Promise<Uint8Array> {
    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }
    
    const outputData = await this.ffmpeg.readFile(outputName);
    
    if (typeof outputData === 'string') {
      return new TextEncoder().encode(outputData);
    }
    
    if (outputData instanceof Uint8Array) {
      return outputData;
    }
    
    // For any array buffer-like object
    if (outputData && typeof outputData === 'object' && 'byteLength' in outputData) {
      return new Uint8Array(outputData as ArrayBufferLike);
    }
    
    throw new Error('Unsupported FFmpeg output type');
  }

  private createBlobFromUint8Array(data: Uint8Array, type: string): Blob {
    // Create a safe ArrayBuffer copy to avoid SharedArrayBuffer issues
    const safeArrayBuffer = new ArrayBuffer(data.length);
    const safeUint8Array = new Uint8Array(safeArrayBuffer);
    safeUint8Array.set(data);
    
    return new Blob([safeUint8Array], { type });
  }

  private stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  public async processVideo(
    options: VideoProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    console.log('Starting video processing...');
    
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const { 
        inputFile, 
        outputFormat = 'mp4', 
        resolution, 
        filters, 
        speed, 
        volume, 
        textOverlays, 
        audioTracks, 
        transitions 
      } = options;
      
      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = `output.${outputFormat}`;
      
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);
      
      // Base command with input file
      const command = ['-i', inputName];
      
      // Add filters if specified
      const filterOptions: string[] = [];
      
      if (speed && speed !== 1) {
        filterOptions.push(`setpts=${1/speed}*PTS`);
      }
      
      if (filters && filters.length > 0) {
        filterOptions.push(...filters);
      }
      
      if (textOverlays && textOverlays.length > 0) {
        const textFilters = textOverlays.map(overlay => {
          const fontFile = overlay.fontFamily || 'Arial';
          return `drawtext=text='${overlay.text}':fontfile=${fontFile}:fontsize=${overlay.fontSize}:fontcolor=${overlay.color}:x=${overlay.x}:y=${overlay.y}:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
        });
        filterOptions.push(...textFilters);
      }
      
      if (transitions && transitions.length > 0) {
        const transitionFilters = transitions.map(transition => {
          switch (transition.type) {
            case 'fade':
              return `fade=t=in:st=${transition.startTime}:d=${transition.duration}`;
            case 'slide':
              return `slide=slide=left:duration=${transition.duration}:start=${transition.startTime}`;
            case 'zoom':
              return `zoompan=z='min(zoom+0.0015,1.5)':d=${transition.duration}:s=1920x1080:start=${transition.startTime}`;
            case 'dissolve':
              return `xfade=transition=fade:duration=${transition.duration}:offset=${transition.startTime}`;
            default:
              return '';
          }
        }).filter(Boolean);
        filterOptions.push(...transitionFilters);
      }
      
      if (filterOptions.length > 0) {
        command.push('-vf', filterOptions.join(','));
      }
      
      // Add audio processing
      if (audioTracks && audioTracks.length > 0) {
        for (let i = 0; i < audioTracks.length; i++) {
          const audioTrack = audioTracks[i];
          const audioData = new Uint8Array(await audioTrack.file.arrayBuffer());
          const audioName = `audio${i}.${audioTrack.file.name.split('.').pop() || 'mp3'}`;
          await this.ffmpeg.writeFile(audioName, audioData);
          command.push('-i', audioName);
        }

        // Mix multiple audio tracks with volume adjustments
        const audioMix = audioTracks.map((_, index) => `[${index + 1}:a]`).join('');
        const volumeAdjustments = audioTracks.map(track => `volume=${track.volume}`).join(',');
        command.push('-filter_complex', `${audioMix}amix=inputs=${audioTracks.length}:duration=longest,${volumeAdjustments}[a]`);
        command.push('-map', '0:v');
        command.push('-map', '[a]');
      } else if (volume && volume !== 1) {
        command.push('-af', `volume=${volume}`);
      }
      
      // Set resolution if specified
      if (resolution) {
        const resolutionMap: Record<string, string> = {
          '480p': '854x480',
          '720p': '1280x720',
          '1080p': '1920x1080',
          '2K': '2560x1440',
          '4K': '3840x2160'
        };
        
        if (resolutionMap[resolution]) {
          command.push('-s', resolutionMap[resolution]);
        }
      }
      
      // Output options
      command.push(
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        outputName
      );

      // Execute FFmpeg command
      await this.ffmpeg.exec(command);
      
      // Read output file
      const outputData = await this.safeReadFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      if (audioTracks) {
        for (let i = 0; i < audioTracks.length; i++) {
          await this.ffmpeg.deleteFile(`audio${i}.${audioTracks[i].file.name.split('.').pop() || 'mp3'}`);
        }
      }
      
      return this.createBlobFromUint8Array(outputData, `video/${outputFormat}`);
    } catch (error) {
      console.error('Video processing failed:', error);
      throw new Error(`Video processing failed: ${error}`);
    }
  }

  public async cropVideo(
    inputFile: File,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = 'cropped.mp4';
      
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      const command = [
        '-i', inputName,
        '-vf', `crop=${width}:${height}:${x}:${y}`,
        '-c:v', 'libx264',
        '-preset', 'fast',
        outputName
      ];

      await this.ffmpeg.exec(command);
      
      // Read output file
      const outputData = await this.safeReadFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return this.createBlobFromUint8Array(outputData, 'video/mp4');
    } catch (error) {
      console.error('Video cropping failed:', error);
      throw new Error(`Video cropping failed: ${error}`);
    }
  }

  public async trimVideo(
    inputFile: File,
    startTime: number,
    endTime: number
  ): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = 'trimmed.mp4';
      
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      const duration = endTime - startTime;
      const command = [
        '-i', inputName,
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'fast',
        outputName
      ];

      await this.ffmpeg.exec(command);
      
      // Read output file
      const outputData = await this.safeReadFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return this.createBlobFromUint8Array(outputData, 'video/mp4');
    } catch (error) {
      console.error('Video trimming failed:', error);
      throw new Error(`Video trimming failed: ${error}`);
    }
  }

  public async addTextOverlay(
    inputFile: File,
    text: string,
    startTime: number,
    endTime: number,
    x: number,
    y: number,
    fontSize: number = 24,
    color: string = 'white'
  ): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = 'text-overlay.mp4';
      
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      const command = [
        '-i', inputName,
        '-vf', `drawtext=text='${text}':fontsize=${fontSize}:fontcolor=${color}:x=${x}:y=${y}:enable='between(t,${startTime},${endTime})'`,
        '-c:v', 'libx264',
        '-preset', 'fast',
        outputName
      ];

      await this.ffmpeg.exec(command);
      
      // Read output file
      const outputData = await this.safeReadFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return this.createBlobFromUint8Array(outputData, 'video/mp4');
    } catch (error) {
      console.error('Text overlay failed:', error);
      throw new Error(`Text overlay failed: ${error}`);
    }
  }

  public async extractAudio(videoFile: File): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + (videoFile.name.split('.').pop() || 'mp4');
      const outputName = 'audio.mp3';
      
      const fileData = new Uint8Array(await videoFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      const command = [
        '-i', inputName,
        '-vn',
        '-acodec', 'libmp3lame',
        '-ab', '192k',
        outputName
      ];

      await this.ffmpeg.exec(command);
      
      // Read output file
      const outputData = await this.safeReadFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return this.createBlobFromUint8Array(outputData, 'audio/mp3');
    } catch (error) {
      console.error('Audio extraction failed:', error);
      throw new Error(`Audio extraction failed: ${error}`);
    }
  }

  public async applyFilters(
    inputFile: File,
    filters: string[]
  ): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = 'filtered.mp4';
      
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      const command = [
        '-i', inputName,
        '-vf', filters.join(','),
        '-c:v', 'libx264',
        '-preset', 'fast',
        outputName
      ];

      await this.ffmpeg.exec(command);
      
      // Read output file
      const outputData = await this.safeReadFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return this.createBlobFromUint8Array(outputData, 'video/mp4');
    } catch (error) {
      console.error('Filter application failed:', error);
      throw new Error(`Filter application failed: ${error}`);
    }
  }
}

// Export a singleton instance
export const videoProcessor = VideoProcessor.getInstance();
