import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LoadingAnimation } from './components/LoadingAnimation';
import { Home } from './components/Home';
// import { Editor } from './components/Editor';
import { EditorProvider } from './context/EditorContext';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <EditorProvider>
      <AnimatePresence mode="wait">
        {loading ? (
          <LoadingAnimation />
        ) : (
          <Home />
        )}
      </AnimatePresence>
    </EditorProvider>
  );
}

export default App;