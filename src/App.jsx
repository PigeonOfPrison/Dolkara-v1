import React, { useState } from 'react'
import EditorLayout from './Layout/EditorLayout.jsx'
import SplashScreen from './components/SplashScreen.jsx'
import './css/layout.css'

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  return (
    <>
      {showEditor && <div className="app-fade-in"><EditorLayout /></div>}
      {showSplash && (
        <SplashScreen
          onRevealEditor={() => setShowEditor(true)}
          onDone={() => setShowSplash(false)}
        />
      )}
    </>
  );
}
