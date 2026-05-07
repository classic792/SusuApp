import React, { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, XCircle, AlertCircle, Loader2 } from "lucide-react";

/**
 * Reusable component for capturing client face during transactions.
 * @param {Function} onCapture - Callback when image is captured (receives base64 string or null)
 * @param {Function} onCancel - Optional callback for cancellation
 */
const FaceVerificationCamera = ({ onCapture, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Could not access the camera. Please grant permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      const base64Data = dataUrl.split(",")[1];
      setCapturedImage(base64Data);
      onCapture(base64Data);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    onCapture(null);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-sm mx-auto animate-in fade-in zoom-in-95 duration-300">
      {cameraError && (
        <div className="w-full p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-sm font-bold">
          <AlertCircle size={16} />
          <p>{cameraError}</p>
        </div>
      )}

      {!capturedImage ? (
        <div className="w-full relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-xl flex flex-col items-center justify-center">
          {isCameraActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-3xl pointer-events-none" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-48 h-64 border-2 border-violet-400/50 rounded-[100px] shadow-[0_0_0_9999px_rgba(0,0,0,0.3)]" />
              </div>
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-black shadow-lg transition-all flex items-center gap-2 active:scale-95 z-20"
              >
                <Camera size={20} /> CAPTURE
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="animate-spin" size={32} />
              <span className="font-bold">Initializing Camera...</span>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-4 border-emerald-400 shadow-xl">
            <img
              src={`data:image/jpeg;base64,${capturedImage}`}
              alt="Client capture"
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
          <button
            type="button"
            onClick={retakePhoto}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-violet-600 transition-colors"
          >
            <RefreshCw size={16} /> Retake Photo
          </button>
        </div>
      )}
      
      {onCancel && !capturedImage && (
         <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Cancel
          </button>
      )}
    </div>
  );
};

export default FaceVerificationCamera;
