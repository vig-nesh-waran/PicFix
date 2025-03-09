import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditorContextType {
  image: string | null;
  setImage: (image: string | null) => void;
  adjustments: {
    brightness: number;
    contrast: number;
    rotation: number;
  };
  setAdjustments: React.Dispatch<React.SetStateAction<{
    brightness: number;
    contrast: number;
    rotation: number;
  }>>;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  setCrop: React.Dispatch<React.SetStateAction<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [image, setImage] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState({
    brightness: 100,
    contrast: 100,
    rotation: 0,
  });
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  return (
    <EditorContext.Provider
      value={{
        image,
        setImage,
        adjustments,
        setAdjustments,
        crop,
        setCrop,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}