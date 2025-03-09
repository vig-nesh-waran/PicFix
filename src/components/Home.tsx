import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { ImagePlus } from 'lucide-react';
import { useEditor } from '../context/EditorContext';
import { Editor } from './Editor';

export function Home() {
  const { image, setImage } = useEditor();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [setImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: false
  });

  if (image) {
    return <Editor />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
    >
      <div
        {...getRootProps()}
        className={`w-full max-w-2xl p-8 bg-gray-800 rounded-xl shadow-lg transition-all ${
          isDragActive ? 'border-4 border-blue-500 bg-gray-700' : 'border-4 border-dashed border-gray-600'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto w-20 h-20 mb-4"
          >
            <ImagePlus className="w-full h-full text-blue-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Drop your image here
          </h2>
          <p className="text-gray-300 mb-4">
            or click to select a file
          </p>
          <p className="text-sm text-gray-400">
            Supports: PNG, JPG, JPEG
          </p>
        </div>
      </div>
    </motion.div>
  );
}