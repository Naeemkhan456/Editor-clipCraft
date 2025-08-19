import { FFmpeg } from '@ffmpeg/ffmpeg';

export interface VideoProcessingOptions {
  inputFile: File;
  outputFormat: string;
  resolution: string;
  aspectRatio: string;
  filters?: string[];
  speed?: number;
  volume?: number;
}

export interface ProcessingProgress {
  percentage: number;
  stage: string;
  timeRemaining?: number;
}

export class VideoProcessor {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize() {
    try {
      this.ffmpeg = new FFmpeg();
      
      // Load FFmpeg core
      await this.ffmpeg.load();
      
      this.isLoaded = true;
      console.log('FFmpeg loaded successfully');
    } catch (error) {
      console.error('Failed to load FFmpeg:', error);
      throw error;
    }
  }

  async processVideo(
    options: VideoProcessingOptions,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const { inputFile, outputFormat, resolution, aspectRatio, filters, speed, volume } = options;
      
      // Write input file to FFmpeg file system
      const inputName = 'input.' + inputFile.name.split('.').pop();
      const outputName = `output.${outputFormat}`;
      
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      // Build FFmpeg command
      let command = ['-i', inputName];
      
      // Apply filters
      const filterOptions = [];
      
      if (speed && speed !== 1) {
        filterOptions.push(`setpts=${1/speed}*PTS`);
      }
      
      if (filters && filters.length > 0) {
        filterOptions.push(...filters);
      }
      
      if (filterOptions.length > 0) {
        command.push('-vf', filterOptions.join(','));
      }
      
      // Audio processing
      if (volume && volume !== 1) {
        command.push('-af', `volume=${volume}`);
      }
      
      // Resolution and aspect ratio
      if (resolution) {
        const resolutionMap: Record<string, string> = {
          '480p': '854x480',
          '720p': '1280x720',
          '1080p': '1920x1080',
          '4K': '3840x2160'
        };
        
        if (resolutionMap[resolution]) {
          command.push('-s', resolutionMap[resolution]);
        }
      }
      
      // Output options
      command.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '23');
      command.push(outputName);

      // Execute FFmpeg command
      await this.ffmpeg.exec(command);

      // Read the output file
      const data = await this.ffmpeg.readFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      // Convert to Blob
      const outputBlob = new Blob([data], { type: `video/${outputFormat}` });
      return outputBlob;
      
    } catch (error) {
      console.error('Video processing error:', error);
      throw error;
    }
  }

  async trimVideo(file: File, startTime: number, endTime: number): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + file.name.split('.').pop();
      const outputName = 'trimmed.mp4';
      
      const fileData = new Uint8Array(await file.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);
      
      const duration = endTime - startTime;
      
      await this.ffmpeg.exec([
        '-i', inputName,
        '-ss', startTime.toString(),
        '-t', duration.toString(),
        '-c', 'copy',
        outputName
      ]);
      
      const data = await this.ffmpeg.readFile(outputName);
      
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([data], { type: 'video/mp4' });
    } catch (error) {
      console.error('Video trimming error:', error);
      throw error;
    }
  }

  async changeSpeed(file: File, speed: number): Promise<Blob> {
    return this.processVideo({
      inputFile: file,
      outputFormat: 'mp4',
      resolution: '1080p',
      aspectRatio: '16:9',
      speed,
    });
  }

  async applyFilters(file: File, filters: string[]): Promise<Blob> {
    // Implementation for applying filters
    return this.processVideo({
      inputFile: file,
      outputFormat: 'mp4',
      resolution: '1080p',
      aspectRatio: '16:9',
      filters,
    });
  }

  async cropVideo(
    file: File,
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + file.name.split('.').pop();
      const outputName = 'cropped.mp4';
      
      const fileData = new Uint8Array(await file.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);
      
      const cropFilter = `crop=${width}:${height}:${x}:${y}`;
      
      await this.ffmpeg.exec([
        '-i', inputName,
        '-vf', cropFilter,
        '-c:a', 'copy',
        outputName
      ]);
      
      const data = await this.ffmpeg.readFile(outputName);
      
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([data], { type: 'video/mp4' });
    } catch (error) {
      console.error('Video cropping error:', error);
      throw error;
    }
  }

  async mergeAudioVideo(videoFile: File, audioFile: File): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const videoName = 'video.' + videoFile.name.split('.').pop();
      const audioName = 'audio.' + audioFile.name.split('.').pop();
      const outputName = 'merged.mp4';
      
      const videoData = new Uint8Array(await videoFile.arrayBuffer());
      const audioData = new Uint8Array(await audioFile.arrayBuffer());
      await this.ffmpeg.writeFile(videoName, videoData);
      await this.ffmpeg.writeFile(audioName, audioData);
      
      await this.ffmpeg.exec([
        '-i', videoName,
        '-i', audioName,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-shortest',
        outputName
      ]);
      
      const data = await this.ffmpeg.readFile(outputName);
      
      await this.ffmpeg.deleteFile(videoName);
      await this.ffmpeg.deleteFile(audioName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([data], { type: 'video/mp4' });
    } catch (error) {
      console.error('Audio/video merge error:', error);
      throw error;
    }
  }

  async extractAudio(videoFile: File): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + videoFile.name.split('.').pop();
      const outputName = 'audio.mp3';
      
      const fileData = new Uint8Array(await videoFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);
      
      await this.ffmpeg.exec([
        '-i', inputName,
        '-vn',
        '-acodec', 'mp3',
        '-ab', '128k',
        '-ar', '44100',
        outputName
      ]);
      
      const data = await this.ffmpeg.readFile(outputName);
      
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([data], { type: 'audio/mp3' });
    } catch (error) {
      console.error('Audio extraction error:', error);
      throw error;
    }
  }
}

export const videoProcessor = new VideoProcessor();
