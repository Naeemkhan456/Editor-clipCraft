# ClipCraft - Professional Video Editor

A powerful, web-based video editing application built with React, TypeScript, and FFmpeg. ClipCraft provides professional-grade video editing capabilities in your browser.

## 🚀 Features

### Core Video Editing
- **Video Upload & Import**: Support for multiple video formats (MP4, AVI, MOV, etc.)
- **Timeline Editing**: Precise timeline control with frame-accurate editing
- **Playback Controls**: Play, pause, seek, and frame-by-frame navigation
- **Speed Control**: Adjustable playback speed from 0.1x to 3.0x

### Advanced Editing Tools
- **Trim & Cut**: Precise video trimming with start and end time controls
- **Crop & Resize**: Crop videos to any aspect ratio or dimensions
- **Text Overlays**: Add animated text with custom fonts, colors, and positioning
- **Transitions**: Professional transitions including fade, slide, zoom, and dissolve effects
- **Audio Mixing**: Import and mix multiple audio tracks with volume control

### Professional Filters & Effects
- **Basic Filters**: Brightness, contrast, saturation, hue, blur, sepia
- **Advanced Filters**: Gamma, exposure, shadows, highlights, clarity, vibrance
- **Color Grading**: Temperature, tint, shadows/midtones/highlights color adjustment
- **Film Effects**: Grain, vignette, vintage, cinematic, and artistic presets
- **LUT Support**: Professional Look-Up Tables for cinematic color grading

### Export & Output
- **Multiple Formats**: Export to MP4, WebM, and other popular formats
- **Resolution Options**: 480p, 720p, 1080p, and 4K support
- **Quality Control**: Adjustable bitrate and compression settings
- **Batch Processing**: Process multiple videos simultaneously

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Video Processing**: FFmpeg.wasm for client-side video processing
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: React hooks with custom video editor logic
- **Build Tool**: Vite for fast development and optimized builds

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/clipcraft.git
   cd clipcraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 🎬 Usage Guide

### Getting Started
1. **Upload Video**: Click "Add Media" to upload your video file
2. **Basic Playback**: Use the timeline controls to navigate through your video
3. **Edit Tools**: Access editing tools from the bottom toolbar

### Video Trimming
1. Select the "Trim" tool from the toolbar
2. Set start and end points on the timeline
3. Click "Apply Trim" to process the video
4. The trimmed video will replace the original

### Adding Text Overlays
1. Select the "Text" tool from the toolbar
2. Enter your text content
3. Position the text by dragging in the preview
4. Set timing (start/end) and styling options
5. Click "Add Text Overlay" to apply

### Applying Filters
1. Select the "Filters" tool from the toolbar
2. Choose from preset filters or customize manually
3. Adjust basic parameters (brightness, contrast, etc.)
4. Use advanced filters for professional effects
5. Apply color grading for cinematic looks

### Adding Transitions
1. Select the "Transitions" tool from the toolbar
2. Choose transition type (fade, slide, zoom, etc.)
3. Set timing and duration
4. Configure direction and easing options
5. Click "Add Transition" to apply

### Exporting Your Video
1. Click the "Export" button
2. Choose output format and quality settings
3. Select resolution and aspect ratio
4. Click "Export" to process and download

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_FFMPEG_CORE_URL=https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.js
VITE_FFMPEG_WASM_URL=https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd/ffmpeg-core.wasm
```

### FFmpeg Configuration
The application uses FFmpeg.wasm for video processing. Configure FFmpeg options in `src/lib/video-processor.ts`:

```typescript
// Customize FFmpeg settings
const ffmpegOptions = {
  corePath: 'path/to/ffmpeg-core.js',
  wasmPath: 'path/to/ffmpeg-core.wasm',
  workerPath: 'path/to/ffmpeg-worker.js'
};
```

## 📱 Browser Support

- **Chrome**: 88+ (Recommended)
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

**Note**: FFmpeg.wasm requires WebAssembly support and may not work in older browsers.

## 🎨 Customization

### Adding New Filters
Extend the filters system in `src/lib/filters.ts`:

```typescript
export const customFilters = {
  myFilter: {
    brightness: 110,
    contrast: 120,
    saturation: 90
  }
};
```

### Custom Transitions
Add new transition types in `src/components/transitions.tsx`:

```typescript
const customTransitions = [
  {
    id: 'custom',
    name: 'Custom Effect',
    preview: '✨',
    description: 'My custom transition',
    supportsDirection: true,
    supportsIntensity: true
  }
];
```

### Styling
The application uses Tailwind CSS. Customize the theme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6344fd',
        accent: '#7c5cfa'
      }
    }
  }
};
```

## 🚀 Performance Tips

1. **Video Size**: Keep source videos under 2GB for optimal performance
2. **Resolution**: Lower resolution videos process faster
3. **Browser**: Use Chrome for best performance
4. **Memory**: Close other tabs to free up memory for video processing

## 🐛 Troubleshooting

### Common Issues

**Video won't load**
- Check file format compatibility
- Ensure file size is reasonable (< 2GB)
- Try refreshing the page

**Processing fails**
- Check browser console for errors
- Ensure stable internet connection
- Try smaller video files first

**Slow performance**
- Close other browser tabs
- Use lower resolution videos
- Check available system memory

### Debug Mode
Enable debug logging by setting in browser console:

```javascript
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use meaningful component and variable names
- Add proper error handling
- Include unit tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **FFmpeg**: Video processing library
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **React Team**: Amazing frontend framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/clipcraft/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/clipcraft/discussions)
- **Email**: support@clipcraft.com

## 🔮 Roadmap

### Upcoming Features
- [ ] Multi-track timeline editing
- [ ] Advanced audio mixing
- [ ] Motion graphics templates
- [ ] Cloud rendering support
- [ ] Collaboration features
- [ ] Mobile app version

### Version History
- **v1.0.0**: Initial release with core editing features
- **v1.1.0**: Added text overlays and transitions
- **v1.2.0**: Enhanced filters and color grading
- **v1.3.0**: Performance improvements and bug fixes

---

**Made with ❤️ by the ClipCraft Team** 
