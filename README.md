# STL to GLB Converter

A modern, feature-rich desktop application for converting STL (STereoLithography) files to GLB (GL Transmission Format Binary) format with real-time 3D preview and advanced material controls.

![STL to GLB Converter](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![Electron](https://img.shields.io/badge/Electron-v37.2.0-47848F.svg)
![License](https://img.shields.io/badge/License-ISC-green.svg)

## 🚀 Features

### Core Functionality
- **Multi-file STL Import**: Drag & drop or browse multiple STL files simultaneously
- **Real-time 3D Preview**: Interactive 3D viewport with orbit controls
- **GLB Export**: Convert and combine multiple STL models into a single GLB file
- **Batch Processing**: Handle multiple models at once

### Advanced Controls
- **Individual Model Management**: Toggle visibility for each loaded model
- **Color Customization**: Assign custom colors to each model with color picker
- **Transparency Control**: Adjustable opacity slider for each model (0-100%)
- **Scene Grid**: Toggle-able grid helper for better spatial reference
- **Responsive Design**: Modern UI built with Tailwind CSS

### User Experience
- **Dark Theme**: Professional dark interface reducing eye strain
- **Loading Indicators**: Visual feedback during file processing
- **Error Handling**: Comprehensive error messages and validation
- **Intuitive Controls**: Clean, organized control panel with sectioned features

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Development Setup
1. Clone the repository:
```bash
git clone https://github.com/yourusername/stl-to-glb-converter.git
cd stl-to-glb-converter
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

### Building for Production
Create a portable Windows executable:
```bash
npm run dist
```

The built application will be available in the `dist` folder.

## 📖 Usage

### Getting Started
1. **Launch the Application**: Run the executable or use `npm start`
2. **Load STL Files**: 
   - Drag and drop STL files onto the drop zone
   - Or click the drop zone to browse and select files
3. **Customize Models**:
   - Toggle visibility with checkboxes
   - Change colors using the color picker
   - Adjust transparency with the opacity slider
4. **Export**: Click "GLB Olarak Dışa Aktar" to save as GLB format

### Interface Overview

#### 1. Scene Settings
- **Grid Toggle**: Show/hide the reference grid in the 3D viewport

#### 2. Model Management
- **File Upload Area**: Drag & drop zone for STL files
- **Model List**: Shows all loaded models with individual controls:
  - Visibility toggle (eye icon checkbox)
  - Color picker for material color
  - Opacity slider for transparency
  - Delete button to remove models

#### 3. Export Controls
- **GLB Export**: Converts all visible models to a single GLB file
- Button automatically enables/disables based on visible models

### Supported File Formats
- **Input**: STL (STereoLithography) files
- **Output**: GLB (GL Transmission Format Binary) files

## 🔧 Technical Details

### Built With
- **Electron**: Cross-platform desktop application framework
- **Three.js**: 3D graphics library for WebGL rendering
- **Tailwind CSS**: Utility-first CSS framework for styling
- **STLLoader**: Three.js addon for loading STL files
- **GLTFExporter**: Three.js addon for exporting GLB files

### Architecture
- **Main Process**: Electron main process handling window creation
- **Renderer Process**: Web-based UI with 3D rendering capabilities
- **File Handling**: Client-side file processing with FileReader API
- **3D Pipeline**: Three.js scene management with proper disposal

### Performance Features
- **Geometry Disposal**: Proper cleanup of 3D resources
- **Responsive Rendering**: Adaptive grid sizing based on model bounds
- **Efficient Updates**: Selective UI updates for better performance

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Large STL files (>50MB) may take longer to process
- WebGL context limits may affect very complex scenes

## 📞 Support

If you encounter any issues or have questions:
- Create an issue in the GitHub repository
- Check the console for error messages
- Ensure your system supports WebGL

## 🔄 Version History

### v1.0.0
- Initial release
- Multi-STL import capability
- Real-time 3D preview
- GLB export functionality
- Individual model controls (color, opacity, visibility)
- Modern dark theme UI

---

**Made with ❤️ using Electron and Three.js**
