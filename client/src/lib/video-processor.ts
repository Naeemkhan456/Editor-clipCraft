import { FFmpeg } from '@ffmpeg/ffmpeg';

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
      const { inputFile, outputFormat, resolution, aspectRatio, filters, speed, volume, textOverlays, audioTracks, transitions } = options;
      
      // Write input file to FFmpeg file system
      const inputName = 'input.' + inputFile.name.split('.').pop();
      const outputName = `output.${outputFormat}`;
      
      const fileData = new Uint8Array(await inputFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      // Build FFmpeg command
      let command = ['-i', inputName];
      
      // Add audio tracks if specified
      if (audioTracks && audioTracks.length > 0) {
        for (let i = 0; i < audioTracks.length; i++) {
          const audioTrack = audioTracks[i];
          const audioData = new Uint8Array(await audioTrack.file.arrayBuffer());
          const audioName = `audio${i}.${audioTrack.file.name.split('.').pop()}`;
          await this.ffmpeg.writeFile(audioName, audioData);
          command.push('-i', audioName);
        }
      }
      
      // Apply filters
      const filterOptions = [];
      
      if (speed && speed !== 1) {
        filterOptions.push(`setpts=${1/speed}*PTS`);
      }
      
      if (filters && filters.length > 0) {
        filterOptions.push(...filters);
      }
      
      // Apply text overlays
      if (textOverlays && textOverlays.length > 0) {
        const textFilters = textOverlays.map((overlay, index) => {
          const fontFile = overlay.fontFamily || 'Arial';
          return `drawtext=text='${overlay.text}':fontfile=${fontFile}:fontsize=${overlay.fontSize}:fontcolor=${overlay.color}:x=${overlay.x}:y=${overlay.y}:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
        });
        filterOptions.push(...textFilters);
      }
      
      // Apply transitions
      if (transitions && transitions.length > 0) {
        const transitionFilters = transitions.map((transition, index) => {
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
      
      // Audio processing
      if (volume && volume !== 1) {
        command.push('-af', `volume=${volume}`);
      }
      
      // Mix multiple audio tracks
      if (audioTracks && audioTracks.length > 0) {
        const audioMix = audioTracks.map((_, index) => `[${index + 1}:a]`).join('');
        const volumeAdjustments = audioTracks.map(track => `volume=${track.volume}`).join(',');
        command.push('-filter_complex', `${audioMix}amix=inputs=${audioTracks.length}:duration=longest,${volumeAdjustments}[a]`);
        command.push('-map', '0:v');
        command.push('-map', '[a]');
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
      
      // Read output file
      const outputData = await this.ffmpeg.readFile(outputName);
      
      // Clean up files
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      if (audioTracks) {
        for (let i = 0; i < audioTracks.length; i++) {
          await this.ffmpeg.deleteFile(`audio${i}.${audioTracks[i].file.name.split('.').pop()}`);
        }
      }
      
      return new Blob([outputData], { type: `video/${outputFormat}` });
    } catch (error) {
      console.error('Video processing failed:', error);
      throw new Error(`Video processing failed: ${error}`);
    }
  }

  async cropVideo(
    inputFile: File,
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
      const inputName = 'input.' + inputFile.name.split('.').pop();
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
      
      const outputData = await this.ffmpeg.readFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([outputData], { type: 'video/mp4' });
    } catch (error) {
      console.error('Video cropping failed:', error);
      throw new Error(`Video cropping failed: ${error}`);
    }
  }

  async trimVideo(
    inputFile: File,
    startTime: number,
    endTime: number
  ): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + inputFile.name.split('.').pop();
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
      
      const outputData = await this.ffmpeg.readFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([outputData], { type: 'video/mp4' });
    } catch (error) {
      console.error('Video trimming failed:', error);
      throw new Error(`Video trimming failed: ${error}`);
    }
  }

  async addTextOverlay(
    inputFile: File,
    text: string,
    startTime: number,
    endTime: number,
    x: number,
    y: number,
    fontSize: number = 24,
    color: string = 'white'
  ): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + inputFile.name.split('.').pop();
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
      
      const outputData = await this.ffmpeg.readFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([outputData], { type: 'video/mp4' });
    } catch (error) {
      console.error('Text overlay failed:', error);
      throw new Error(`Text overlay failed: ${error}`);
    }
  }

  async mergeVideos(videoFiles: File[]): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      // Write all video files
      const inputNames: string[] = [];
      for (let i = 0; i < videoFiles.length; i++) {
        const inputName = `input${i}.${videoFiles[i].name.split('.').pop()}`;
        const fileData = new Uint8Array(await videoFiles[i].arrayBuffer());
        await this.ffmpeg.writeFile(inputName, fileData);
        inputNames.push(inputName);
      }

      const outputName = 'merged.mp4';
      
      // Create concat file
      const concatContent = inputNames.map(name => `file '${name}'`).join('\n');
      await this.ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent));

      const command = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        outputName
      ];

      await this.ffmpeg.exec(command);
      
      const outputData = await this.ffmpeg.readFile(outputName);
      
      // Clean up
      inputNames.forEach(name => this.ffmpeg!.deleteFile(name));
      await this.ffmpeg.deleteFile('concat.txt');
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([outputData], { type: 'video/mp4' });
    } catch (error) {
      console.error('Video merging failed:', error);
      throw new Error(`Video merging failed: ${error}`);
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

      const command = [
        '-i', inputName,
        '-vn',
        '-acodec', 'libmp3lame',
        '-ab', '192k',
        outputName
      ];

      await this.ffmpeg.exec(command);
      
      const outputData = await this.ffmpeg.readFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([outputData], { type: 'audio/mp3' });
    } catch (error) {
      console.error('Audio extraction failed:', error);
      throw new Error(`Audio extraction failed: ${error}`);
    }
  }

  async applyFilters(
    inputFile: File,
    filters: string[]
  ): Promise<Blob> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + inputFile.name.split('.').pop();
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
      
      const outputData = await this.ffmpeg.readFile(outputName);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      await this.ffmpeg.deleteFile(outputName);
      
      return new Blob([outputData], { type: 'video/mp4' });
    } catch (error) {
      console.error('Filter application failed:', error);
      throw new Error(`Filter application failed: ${error}`);
    }
  }

  async getVideoInfo(videoFile: File): Promise<{
    duration: number;
    width: number;
    height: number;
    fps: number;
    bitrate: number;
    codec: string;
  }> {
    if (!this.isLoaded) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    try {
      const inputName = 'input.' + videoFile.name.split('.').pop();
      const fileData = new Uint8Array(await videoFile.arrayBuffer());
      await this.ffmpeg.writeFile(inputName, fileData);

      // This is a simplified approach - in a real implementation,
      // you'd use FFprobe or parse the FFmpeg output
      const command = [
        '-i', inputName,
        '-f', 'null',
        '-'
      ];

      await this.ffmpeg.exec(command);
      
      // Clean up
      await this.ffmpeg.deleteFile(inputName);
      
      // Return default values for now
      // In a real implementation, you'd parse the FFmpeg output
      return {
        duration: 0,
        width: 1920,
        height: 1080,
        fps: 30,
        bitrate: 5000,
        codec: 'h264'
      };
    } catch (error) {
      console.error('Video info extraction failed:', error);
      throw new Error(`Video info extraction failed: ${error}`);
    }
  }
}

// Export a singleton instance
export const videoProcessor = new VideoProcessor();
