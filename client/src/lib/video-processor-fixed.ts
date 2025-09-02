import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export interface ProcessingProgress {
  percentage: number;
  stage: string;
  currentTime?: number;
  totalTime?: number;
}

export interface VideoProcessingOptions {
  inputFile: File;
  outputFormat?: string;
  resolution?: string;
  aspectRatio?: string;
  filters?: string[];
  speed?: number;
  volume?: number;
  textOverlays?: any[];
  audioTracks?: any[];
  transitions?: any[];
}

export class VideoProcessor {
  private static instance: VideoProcessor | null = null;
  public ffmpeg: FFmpeg | null = null;
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
        throw new Error('Failed to create FFmpeg instance');
      }

      // Load FFmpeg core
      await this.ffmpeg.load();

      this.isLoaded = true;
      this.isInitialized = true;
      console.log('FFmpeg initialized successfully');
    } catch (error) {
      console.error('FFmpeg initialization failed:', error);
      this.isLoaded = false;
      this.isInitialized = false;
      throw new Error(`FFmpeg initialization failed: ${error}`);
    }
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

      if (onProgress) onProgress({ percentage: 5, stage: 'Preparing input file...' });

      console.log('Writing input file to FFmpeg...');
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      if (onProgress) onProgress({ percentage: 15, stage: 'Input file loaded' });

      // Build FFmpeg command - optimized for speed and reliability
      const command = ['-i', inputName];

      // Add filters if specified - optimized approach
      if (filters && filters.length > 0) {
        // Simplify and optimize filters for faster processing
        const optimizedFilters = filters.map(filter => {
          if (filter.includes('eq=')) {
            // Convert eq filters to more efficient format
            if (filter.includes('brightness')) {
              const value = filter.match(/brightness=([\d.-]+)/)?.[1] || '0';
              return `eq=brightness=${value}`;
            }
            if (filter.includes('contrast')) {
              const value = filter.match(/contrast=([\d.-]+)/)?.[1] || '1';
              return `eq=contrast=${value}`;
            }
            if (filter.includes('saturation')) {
              const value = filter.match(/saturation=([\d.-]+)/)?.[1] || '1';
              return `eq=saturation=${value}`;
            }
          }
          if (filter.includes('hue=')) {
            // Optimize hue filter
            const value = filter.match(/hue=h=([\d.-]+)/)?.[1] || '0';
            return `hue=h=${value}`;
          }
          return filter;
        });

        // Combine filters efficiently
        command.push('-filter:v', optimizedFilters.join(','));
      }

      if (onProgress) onProgress({ percentage: 25, stage: 'Filters applied' });

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

      // Output options - optimized for speed and compatibility
      command.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast', // Fastest preset
        '-crf', '30', // Slightly lower quality for faster processing
        '-movflags', '+faststart', // Optimize for web playback
        '-y', // Overwrite output files
        outputName
      );

      console.log('FFmpeg command:', command.join(' '));

      if (onProgress) onProgress({ percentage: 35, stage: 'Executing FFmpeg command' });

      // Execute FFmpeg command with extended timeout and progress monitoring
      const startTime = Date.now();
      const execPromise = this.ffmpeg.exec(command);

      // Extended timeout: 5 minutes for complex operations
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('FFmpeg execution timed out after 5 minutes')), 300000)
      );

      // Monitor progress during execution
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const estimatedTotal = Math.max(elapsed * 2, 30000); // Estimate total time
        const progress = Math.min(35 + (elapsed / estimatedTotal) * 40, 70);

        if (onProgress) {
          onProgress({
            percentage: Math.round(progress),
            stage: 'Processing video...',
            currentTime: elapsed,
            totalTime: estimatedTotal
          });
        }
      }, 1000);

      await Promise.race([execPromise, timeoutPromise]);
      clearInterval(progressInterval);

      if (onProgress) onProgress({ percentage: 80, stage: 'Reading output file' });

      // Read output file
      const outputData = await this.safeReadFile(outputName);

      if (onProgress) onProgress({ percentage: 90, stage: 'Cleaning up' });

      // Clean up
      try {
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputName);
      } catch (cleanupError) {
        console.warn('Cleanup error (non-critical):', cleanupError);
      }

      if (onProgress) onProgress({ percentage: 100, stage: 'Processing complete' });

      console.log('Video processing completed successfully');
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
      console.log(`Cropping video at (${x}, ${y}) with size ${width}x${height}`);

      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = 'cropped.mp4';

      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      const command = [
        '-i', inputName,
        '-vf', `crop=${width}:${height}:${x}:${y}`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-y',
        outputName
      ];

      console.log('Crop command:', command.join(' '));

      // Execute with extended timeout
      const execPromise = this.ffmpeg.exec(command);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Crop execution timed out')), 120000)
      );

      await Promise.race([execPromise, timeoutPromise]);

      // Read output file
      const outputData = await this.safeReadFile(outputName);

      // Clean up
      try {
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputName);
      } catch (cleanupError) {
        console.warn('Cleanup error (non-critical):', cleanupError);
      }

      console.log('Video cropping completed successfully');
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
      console.log(`Trimming video from ${startTime}s to ${endTime}s`);

      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = 'trimmed.mp4';

      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      const duration = endTime - startTime;

      // Use proper FFmpeg trim command
      const command = [
        '-i', inputName,
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-preset', 'ultrafast',
        '-avoid_negative_ts', 'make_zero',
        '-y',
        outputName
      ];

      console.log('Trim command:', command.join(' '));

      // Execute with extended timeout
      const execPromise = this.ffmpeg.exec(command);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Trim execution timed out')), 120000)
      );

      await Promise.race([execPromise, timeoutPromise]);

      // Read output file
      const outputData = await this.safeReadFile(outputName);

      // Clean up
      try {
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputName);
      } catch (cleanupError) {
        console.warn('Cleanup error (non-critical):', cleanupError);
      }

      console.log('Video trimming completed successfully');
      return this.createBlobFromUint8Array(outputData, 'video/mp4');
    } catch (error) {
      console.error('Video trimming failed:', error);
      throw new Error(`Video trimming failed: ${error}`);
    }
  }

  public async splitVideo(
    inputFile: File,
    splitPoints: number[]
  ): Promise<Blob[]> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      console.log(`Splitting video at points: ${splitPoints.join(', ')}`);

      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      const segments: Blob[] = [];
      const sortedPoints = [0, ...splitPoints.sort((a, b) => a - b)];

      for (let i = 0; i < sortedPoints.length - 1; i++) {
        const start = sortedPoints[i];
        const end = sortedPoints[i + 1];
        const duration = end - start;
        const outputName = `segment_${i}.mp4`;

        const command = [
          '-i', inputName,
          '-ss', start.toString(),
          '-t', duration.toString(),
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-preset', 'ultrafast',
          '-avoid_negative_ts', 'make_zero',
          '-y',
          outputName
        ];

        console.log(`Split command ${i + 1}:`, command.join(' '));

        await this.ffmpeg.exec(command);
        const segmentData = await this.safeReadFile(outputName);
        segments.push(this.createBlobFromUint8Array(segmentData, 'video/mp4'));

        // Clean up segment file
        try {
          await this.ffmpeg.deleteFile(outputName);
        } catch (cleanupError) {
          console.warn('Segment cleanup error (non-critical):', cleanupError);
        }
      }

      // Clean up input file
      try {
        await this.ffmpeg.deleteFile(inputName);
      } catch (cleanupError) {
        console.warn('Input cleanup error (non-critical):', cleanupError);
      }

      console.log(`Video splitting completed successfully. Created ${segments.length} segments.`);
      return segments;
    } catch (error) {
      console.error('Video splitting failed:', error);
      throw new Error(`Video splitting failed: ${error}`);
    }
  }

  public async applyFaceEffects(
    inputFile: File,
    effects: {
      noseSize?: number;
      earSize?: number;
      eyeSize?: number;
      faceCleaner?: boolean;
      skinSmoothing?: number;
    }
  ): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      console.log('Applying face effects:', effects);

      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = 'face_effects.mp4';

      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      // Build face effect filters
      const filters: string[] = [];

      if (effects.faceCleaner) {
        filters.push('unsharp=3:3:1.5:3:3:0.5'); // Face cleaning effect
      }

      if (effects.skinSmoothing !== undefined) {
        filters.push(`boxblur=2:2:${effects.skinSmoothing}`); // Skin smoothing
      }

      // Note: Advanced face morphing (nose, ears, eyes) requires specialized libraries
      // For now, we'll use basic filters that can enhance facial features
      if (effects.noseSize || effects.earSize || effects.eyeSize) {
        filters.push('unsharp=5:5:1.5:5:5:0.5'); // Enhance facial features
      }

      const command = [
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-y'
      ];

      if (filters.length > 0) {
        command.push('-vf', filters.join(','));
      }

      command.push(outputName);

      console.log('Face effects command:', command.join(' '));

      await this.ffmpeg.exec(command);

      const outputData = await this.safeReadFile(outputName);

      // Clean up
      try {
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputName);
      } catch (cleanupError) {
        console.warn('Cleanup error (non-critical):', cleanupError);
      }

      console.log('Face effects applied successfully');
      return this.createBlobFromUint8Array(outputData, 'video/mp4');
    } catch (error) {
      console.error('Face effects failed:', error);
      throw new Error(`Face effects failed: ${error}`);
    }
  }

  public async applyBodyEffects(
    inputFile: File,
    effects: {
      bodyWhitening?: number;
      bodySmoothing?: number;
      bodyContrast?: number;
      bodyBrightness?: number;
    }
  ): Promise<Blob> {
    if (!this.isLoaded || !this.ffmpeg) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      console.log('Applying body effects:', effects);

      const inputName = 'input.' + (inputFile.name.split('.').pop() || 'mp4');
      const outputName = 'body_effects.mp4';

      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      // Build body effect filters
      const filters: string[] = [];

      if (effects.bodyWhitening !== undefined) {
        filters.push(`eq=brightness=${effects.bodyWhitening}:contrast=1.1:saturation=0.9`);
      }

      if (effects.bodySmoothing !== undefined) {
        filters.push(`boxblur=1:1:${effects.bodySmoothing}`);
      }

      if (effects.bodyContrast !== undefined) {
        filters.push(`eq=contrast=${effects.bodyContrast}`);
      }

      if (effects.bodyBrightness !== undefined) {
        filters.push(`eq=brightness=${effects.bodyBrightness}`);
      }

      const command = [
        '-i', inputName,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-y'
      ];

      if (filters.length > 0) {
        command.push('-vf', filters.join(','));
      }

      command.push(outputName);

      console.log('Body effects command:', command.join(' '));

      await this.ffmpeg.exec(command);

      const outputData = await this.safeReadFile(outputName);

      // Clean up
      try {
        await this.ffmpeg.deleteFile(inputName);
        await this.ffmpeg.deleteFile(outputName);
      } catch (cleanupError) {
        console.warn('Cleanup error (non-critical):', cleanupError);
      }

      console.log('Body effects applied successfully');
      return this.createBlobFromUint8Array(outputData, 'video/mp4');
    } catch (error) {
      console.error('Body effects failed:', error);
      throw new Error(`Body effects failed: ${error}`);
    }
  }

  private async safeReadFile(filename: string): Promise<Uint8Array> {
    try {
      const data = await this.ffmpeg!.readFile(filename);
      // FFmpeg readFile returns Uint8Array for binary files
      return data as Uint8Array;
    } catch (error) {
      console.error(`Failed to read file ${filename}:`, error);
      throw new Error(`Failed to read file ${filename}: ${error}`);
    }
  }

  private createBlobFromUint8Array(data: Uint8Array, mimeType: string): Blob {
    return new Blob([data], { type: mimeType });
  }
}

// Export a singleton instance
export const videoProcessor = VideoProcessor.getInstance();
