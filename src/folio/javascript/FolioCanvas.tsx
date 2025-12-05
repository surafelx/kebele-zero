import { Canvas } from "@react-three/fiber";
import { LinearEncoding, NoToneMapping } from "three";
import { Suspense, useState, useEffect } from "react";
import Folio from "./Folio";

export default function FolioCanvas() {
  const [webGLError, setWebGLError] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    // Check WebGL support
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) {
          setIsWebGLSupported(false);
        }
      } catch (e) {
        setIsWebGLSupported(false);
      }
    };

    checkWebGL();
  }, []);

  const handleWebGLError = (error: any) => {
    console.error('WebGL Error:', error);
    setWebGLError(true);
  };

  if (!isWebGLSupported) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold mb-4">WebGL Not Supported</h2>
          <p className="text-gray-300 mb-6">
            Your browser doesn't support WebGL, which is required for the 3D experience.
          </p>
          <div className="text-sm text-gray-400">
            <p className="mb-2">Try:</p>
            <ul className="text-left inline-block">
              <li>• Updating your browser</li>
              <li>• Enabling WebGL in browser settings</li>
              <li>• Using a different browser (Chrome, Firefox, Safari)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (webGLError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Graphics Error</h2>
          <p className="text-gray-300 mb-6">
            There was an issue initializing the 3D graphics. The experience may not work properly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen">
      <Canvas
        gl={{
          pixelRatio: 2,
          physicallyCorrectLights: true,
          autoClear: false,
          outputEncoding: LinearEncoding,
          toneMapping: NoToneMapping,
          failIfMajorPerformanceCaveat: false,
          powerPreference: "high-performance"
        }}
        onError={handleWebGLError}
      >
        <Suspense fallback={
          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg">Loading 3D Experience...</p>
            </div>
          </div>
        }>
          <color attach="background" args={[0x000000]} />
          <Folio />
        </Suspense>
      </Canvas>
    </div>
  );
}
