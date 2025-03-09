import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { Range } from 'react-range';
import { Download, Sun, Contrast, RotateCw, Crop as CropIcon, X, ArrowLeft, Eraser, Check } from 'lucide-react';
import { useEditor } from '../context/EditorContext';

export function Editor() {
  const { image, setImage, adjustments, setAdjustments, crop, setCrop } = useEditor();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [cropComplete, setCropComplete] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDownload = async (format: 'jpg' | 'png') => {
    if (!image) return;
    
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;
    
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%)`;
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate((adjustments.rotation * Math.PI) / 180);
    ctx.drawImage(img, -img.width/2, -img.height/2);

    const link = document.createElement('a');
    link.download = `edited-image.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
    setShowDropdown(false);
  };

  const handleBack = () => {
    setImage(null);
    setAdjustments({
      brightness: 100,
      contrast: 100,
      rotation: 0,
    });
  };

  const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels || !image) return;

    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    const croppedImage = canvas.toDataURL();
    setImage(croppedImage);
    setActiveTool(null);
  };

  const handleRemoveBackground = async () => {
    if (!image || isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      const base64Data = image.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }
      
      const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/png' });
      
      const formData = new FormData();
      formData.append('image_file', blob);
      
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'bw4eyypzM57MUMsp9etfFSXz',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to remove background');

      const blob2 = await response.blob();
      const url = URL.createObjectURL(blob2);
      setImage(url);
    } catch (error) {
      console.error('Error removing background:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const tools = [
    { id: 'crop', icon: CropIcon },
    { id: 'brightness', icon: Sun },
    { id: 'contrast', icon: Contrast },
    { id: 'rotate', icon: RotateCw },
    { id: 'remove-bg', icon: Eraser }
  ];

  const renderTrack = ({ props, children }: any) => {
    const { key, ...restProps } = props;
    return (
      <div
        key={key}
        {...restProps}
        className="h-1 w-48 bg-gray-600 rounded-full"
      >
        {children}
      </div>
    );
  };

  const renderThumb = ({ props }: any) => {
    const { key, ...restProps } = props;
    return (
      <div
        key={key}
        {...restProps}
        className="h-4 w-4 bg-blue-500 rounded-full shadow-lg cursor-pointer hover:bg-blue-600 transition-colors"
      />
    );
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Navbar */}
      <nav className="bg-gray-800 shadow-md py-3 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={handleBack}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white hidden md:block">Image Editor</h1>
          <div className="relative">
            <button
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <Download className="w-5 h-5" />
            </button>
            {showDropdown && (
              <div className="fixed inset-0 z-[1000]" onClick={() => setShowDropdown(false)}>
                <div 
                  className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg"
                  style={{ top: '60px', right: '20px' }}
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleDownload('jpg')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors rounded-t-lg"
                  >
                    Download as JPG
                  </button>
                  <button
                    onClick={() => handleDownload('png')}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors rounded-b-lg"
                  >
                    Download as PNG
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 min-h-0">
        <div className="w-[55%] h-full bg-gray-800 rounded-lg shadow-md overflow-hidden relative">
          {activeTool === 'crop' ? (
            <>
              <Cropper
                image={image || ''}
                crop={crop}
                aspect={undefined}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                classes={{
                  containerClassName: 'h-full',
                  cropAreaClassName: 'border-2 border-blue-500',
                  mediaClassName: 'object-contain'
                }}
                style={{
                  containerStyle: {
                    height: '100%',
                    width: '100%'
                  },
                  cropAreaStyle: {
                    border: '2px solid #3B82F6',
                    color: '#3B82F6'
                  },
                  mediaStyle: {
                    height: '100%',
                    width: '100%',
                    objectFit: 'contain'
                  }
                }}
              />
            </>
          ) : (
            <>
              <img
                src={image || ''}
                alt="Editor"
                className="w-full h-full object-contain"
                style={{
                  filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%)`,
                  transform: `rotate(${adjustments.rotation}deg)`
                }}
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p>Removing background...</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Tools */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto py-3 px-4">
          {/* Tool Buttons */}
          <div className="flex justify-center gap-4">
            {tools.map((tool) => (
              <motion.button
                key={tool.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-lg flex items-center justify-center transition-all ${
                  activeTool === tool.id ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${isProcessing && tool.id === 'remove-bg' ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => {
                  if (tool.id === 'remove-bg') {
                    handleRemoveBackground();
                  } else {
                    setActiveTool(activeTool === tool.id ? null : tool.id);
                  }
                }}
                disabled={isProcessing && tool.id === 'remove-bg'}
              >
                <tool.icon className="w-5 h-5" />
              </motion.button>
            ))}
            {activeTool === 'crop' && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-blue-500 text-white p-2.5 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleApplyCrop}
              >
                <Check className="w-5 h-5" />
              </motion.button>
            )}
          </div>

          {/* Tool Controls */}
          <AnimatePresence mode="wait">
            {activeTool && activeTool !== 'crop' && activeTool !== 'remove-bg' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex justify-center items-center mt-3"
              >
                <div className="bg-gray-700 p-3 rounded-lg inline-block">
                  {activeTool === 'brightness' && (
                    <Range
                      step={1}
                      min={0}
                      max={200}
                      values={[adjustments.brightness]}
                      onChange={([brightness]) => setAdjustments(prev => ({ ...prev, brightness }))}
                      renderTrack={renderTrack}
                      renderThumb={renderThumb}
                    />
                  )}

                  {activeTool === 'contrast' && (
                    <Range
                      step={1}
                      min={0}
                      max={200}
                      values={[adjustments.contrast]}
                      onChange={([contrast]) => setAdjustments(prev => ({ ...prev, contrast }))}
                      renderTrack={renderTrack}
                      renderThumb={renderThumb}
                    />
                  )}

                  {activeTool === 'rotate' && (
                    <Range
                      step={90}
                      min={0}
                      max={360}
                      values={[adjustments.rotation]}
                      onChange={([rotation]) => setAdjustments(prev => ({ ...prev, rotation }))}
                      renderTrack={renderTrack}
                      renderThumb={renderThumb}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}