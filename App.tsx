import React, { useState } from 'react';
import { Camera } from './components/Camera';
import { Button } from './components/ui/Button';
import { analyzeImageWithLocation } from './services/geminiService';
import { Coordinates } from './types';
import { 
  Camera as CameraIcon, 
  MapPin, 
  ChevronLeft, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  Smartphone
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'home' | 'camera' | 'preview' | 'analysis'>('home');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- Location Feature ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your device.");
      return;
    }

    setIsLoadingLocation(true);
    setLocationError(null);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setIsLoadingLocation(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        let msg = "Unable to retrieve location.";
        if (err.code === 1) msg = "Location permission denied.";
        else if (err.code === 2) msg = "Position unavailable.";
        else if (err.code === 3) msg = "Location request timed out.";
        
        setLocationError(msg);
        setError(msg); // Show global error alert too
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // --- Camera Feature ---
  const handleOpenCamera = () => {
    setError(null);
    setView('camera');
  };

  const handleCapture = (src: string) => {
    setImageSrc(src);
    setView('preview');
  };

  const handleCameraError = (err: string) => {
    setError(err);
    // Optional: could return to home or stay on camera error screen
  };

  // --- Preview & Analysis ---
  const handleRetake = () => {
    setImageSrc(null);
    setView('camera');
  };

  const handleUsePhoto = async () => {
    if (!imageSrc) return;
    
    setIsAnalyzing(true);
    setError(null);
    setView('analysis');

    try {
      const result = await analyzeImageWithLocation(imageSrc, location);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToHome = () => {
    setView('home');
    setError(null);
    // We can choose to keep or clear location/image. Let's keep location, clear image.
    setImageSrc(null);
    setAnalysisResult(null);
  };

  // --- Render Helpers ---

  // Common Header
  const Header = ({ title, showBack = false }: { title: string, showBack?: boolean }) => (
    <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-50 flex items-center shadow-md h-16">
      {showBack && (
        <button 
          onClick={() => view === 'preview' ? handleRetake() : handleBackToHome()} 
          className="mr-3 p-1 hover:bg-gray-800 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-blue-400" />
        </button>
      )}
      <h1 className="text-lg font-bold text-white tracking-wide">{title}</h1>
    </header>
  );

  // Common Footer
  const Footer = () => (
    <footer className="bg-gray-900 border-t border-gray-800 p-4 sticky bottom-0 z-50 text-center">
      <p className="text-gray-500 text-xs font-medium flex items-center justify-center gap-2">
        <Smartphone size={14} />
        Tested on Physical Device
      </p>
    </footer>
  );

  // Error Banner
  const ErrorBanner = () => {
    if (!error) return null;
    return (
      <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
        <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-red-500 font-semibold text-sm">Error</h4>
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col font-sans">
      
      {/* --- HOME VIEW --- */}
      {view === 'home' && (
        <>
          <Header title="My Native Features App" />
          
          <main className="flex-1 flex flex-col items-center p-6 space-y-8 overflow-y-auto">
            <ErrorBanner />

            <div className="w-full max-w-sm space-y-6">
              {/* Feature 1: Camera */}
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-blue-400">
                  <CameraIcon size={24} />
                  <h2 className="text-lg font-semibold text-white">Camera Feature</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Capture photos using the native device camera interface.
                </p>
                <Button onClick={handleOpenCamera} className="w-full" icon={<CameraIcon size={18} />}>
                  Open Camera
                </Button>
              </div>

              {/* Feature 2: Location */}
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
                <div className="flex items-center gap-3 mb-4 text-green-400">
                  <MapPin size={24} />
                  <h2 className="text-lg font-semibold text-white">GPS Feature</h2>
                </div>
                
                {location ? (
                  <div className="mb-6 bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">Location Acquired</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <span className="text-gray-500 text-xs">Latitude</span>
                        <p className="text-white font-mono">{location.latitude.toFixed(6)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs">Longitude</span>
                        <p className="text-white font-mono">{location.longitude.toFixed(6)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm mb-6">
                    Access GPS hardware to determine your precise location.
                  </p>
                )}

                <Button 
                  onClick={handleGetLocation} 
                  variant="secondary" 
                  className="w-full" 
                  isLoading={isLoadingLocation}
                  icon={<MapPin size={18} />}
                >
                  {location ? "Refresh Location" : "Get My Location"}
                </Button>
              </div>
            </div>
          </main>

          <Footer />
        </>
      )}

      {/* --- CAMERA VIEW --- */}
      {view === 'camera' && (
        <div className="flex-1 flex flex-col relative bg-black h-screen">
          <div className="absolute top-0 z-20 w-full p-4">
             <button onClick={handleBackToHome} className="p-2 bg-black/40 rounded-full backdrop-blur text-white">
               <ChevronLeft size={24} />
             </button>
          </div>
          <div className="flex-1">
            <Camera onCapture={handleCapture} onError={handleCameraError} />
          </div>
          {/* Note: Footer not shown in full screen camera for immersion */}
        </div>
      )}

      {/* --- PREVIEW VIEW --- */}
      {view === 'preview' && imageSrc && (
        <>
          <Header title="Review Photo" showBack />
          <main className="flex-1 bg-black flex flex-col relative overflow-hidden">
            <img src={imageSrc} alt="Preview" className="w-full h-full object-contain" />
            
            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent">
               <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                 <Button variant="secondary" onClick={handleRetake} icon={<RefreshCw size={18} />}>
                   Retake
                 </Button>
                 <Button onClick={handleUsePhoto} icon={<CheckCircle2 size={18} />}>
                   Use Photo
                 </Button>
               </div>
            </div>
          </main>
          <Footer />
        </>
      )}

      {/* --- ANALYSIS VIEW (Result of "Use Photo") --- */}
      {view === 'analysis' && (
        <>
          <Header title="Photo Details" showBack />
          
          <main className="flex-1 p-6 overflow-y-auto bg-gray-950">
             {/* Thumbnail */}
             {imageSrc && (
               <div className="mb-6 flex justify-center">
                 <div className="h-48 w-full max-w-sm rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
                    <img src={imageSrc} alt="Analyzed" className="w-full h-full object-cover opacity-80" />
                 </div>
               </div>
             )}

             <div className="max-w-sm mx-auto">
               {isAnalyzing ? (
                 <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 flex flex-col items-center text-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    <p className="text-gray-300">Processing image data...</p>
                 </div>
               ) : analysisResult ? (
                 <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4 shadow-lg">
                    <div className="flex items-center gap-2 text-purple-400 mb-2">
                       <Sparkles size={20} />
                       <h3 className="font-bold text-lg">AI Analysis</h3>
                    </div>
                    <div className="prose prose-invert prose-sm text-gray-300 leading-relaxed">
                       {analysisResult.split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)}
                    </div>
                    
                    {location && (
                      <div className="pt-4 mt-4 border-t border-gray-800">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tagged Location</p>
                        <div className="flex items-center gap-2 text-gray-400 text-sm font-mono">
                          <MapPin size={14} />
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </div>
                      </div>
                    )}
                 </div>
               ) : null}

               <div className="mt-8">
                 <Button variant="secondary" className="w-full" onClick={handleBackToHome}>
                   Done
                 </Button>
               </div>
             </div>
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}