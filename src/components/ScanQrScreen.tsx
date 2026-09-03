import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../state/AppContext';
import { translations } from '../lib/i18n';
import { parseQrCode, DEMO_QR_PRESETS } from '../lib/qrParser';
import jsQR from 'jsqr';
import { 
  ArrowLeft, 
  Camera, 
  ImageUp,
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  VideoOff,
  SwitchCamera
} from 'lucide-react';

export const ScanQrScreen: React.FC = () => {
  const { language, setScreen, updateDraft } = useApp();
  const t = translations[language];

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleManualUpload = async (file: File) => {
    setScanError(null);
    setIsProcessing(true);

    try {
      const image = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        throw new Error('Unable to read the uploaded image.');
      }

      context.drawImage(image, 0, 0);
      image.close();
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });

      if (!code?.data) {
        setScanError('No readable QR code was found in this image. Choose a clear UPI QR image and try again.');
        setIsProcessing(false);
        return;
      }

      handleProcessQrData(code.data);
    } catch {
      setScanError('The uploaded file could not be read. Choose a JPG, PNG, or WebP image.');
      setIsProcessing(false);
    }
  };

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Process decoded QR payload (from camera or preset)
  const handleProcessQrData = useCallback((rawPayload: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setScanError(null);

    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(120);
      } catch {
        // ignore
      }
    }

    const parsed = parseQrCode(rawPayload);

    if (!parsed.isValid) {
      setScanError(parsed.errorMessage || t.invalidQrNotice);
      setIsProcessing(false);
      return;
    }

    // Stop scanning once valid QR is caught
    stopCamera();

    // Populate the editable payment form with the actual UPI QR data.
    // A QR can identify any UPI payee; only known demo accounts receive a local delayed-credit entry.
    updateDraft({
      recipientName: parsed.recipientName || 'Unknown Payee',
      phoneNumber: parsed.vpa || parsed.phoneNumber || '',
      amount: parsed.amount !== undefined ? parsed.amount : '',
      paymentType: 'p2p',
      reasonCode: '',
      customReason: ''
    });

    setScannedFeedback(`${t.qrSuccessScanned} (${parsed.recipientName}${parsed.amount ? ` • ₹${parsed.amount}` : ''})`);

    // Always return to the form so the sender can choose payment type, reason, and amount if needed.
    setTimeout(() => {
      setScreen('send');
    }, 700);
  }, [isProcessing, stopCamera, updateDraft, setScreen, t]);

  // Real-time canvas frame scanning loop with jsQR
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    // Set canvas dimensions to match video frame
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Run real jsQR decoding on the live camera frame
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data && code.data.trim().length > 0) {
      console.log('Real QR Code detected by camera:', code.data);
      handleProcessQrData(code.data);
      return;
    }

    // Continue next frame
    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleProcessQrData]);

  // Start real device camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setPermissionDenied(false);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser or device.');
      setPermissionDenied(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // required for iOS
        await videoRef.current.play();
        setCameraActive(true);
        // Start continuous QR decoding loop
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: any) {
      console.warn('Real camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in browser settings or use the fallback demo QR codes below.');
        setPermissionDenied(true);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. You can test with the fallback QR presets below.');
        setPermissionDenied(true);
      } else {
        setCameraError(`Camera error (${err.name || 'Unable to start'}). Try fallback QR presets.`);
      }
      setCameraActive(false);
    }
  }, [facingMode, scanFrame, stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      {/* Offscreen canvas for frame extraction */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            stopCamera();
            setScreen('home');
          }}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.back}</span>
        </button>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Real Camera QR Scanner</span>
        </span>
      </div>

      {/* Screen Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white">{t.scanQrTitle}</h2>
        <p className="mt-1 text-xs text-slate-400">{t.scanQrSubtitle}</p>
      </div>

      {/* Real Camera Viewfinder Container */}
      <div className="relative mx-auto w-full max-w-[340px] aspect-square rounded-3xl border-2 border-slate-700 bg-slate-950 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
        {/* Real video stream */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            cameraActive ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Viewfinder Reticle Overlay */}
        <div className="relative z-10 h-56 w-56 rounded-2xl border-2 border-emerald-400/80 bg-emerald-500/5 backdrop-blur-[1px] flex items-center justify-center">
          {/* Animated Laser Scan Line */}
          {cameraActive && (
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400 animate-scan" />
          )}

          {/* Corner Markers */}
          <div className="absolute -top-1 -left-1 h-5 w-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-md" />
          <div className="absolute -top-1 -right-1 h-5 w-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-md" />
          <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-md" />
          <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-emerald-400 rounded-br-md" />

          {/* Camera Loading or Inactive States */}
          {!cameraActive && (
            <div className="text-center p-4">
              {permissionDenied ? (
                <VideoOff className="mx-auto h-8 w-8 text-amber-400" />
              ) : (
                <Camera className="mx-auto h-8 w-8 text-emerald-400 animate-pulse" />
              )}
              <p className="mt-2 text-xs font-semibold text-slate-300">
                {cameraError || t.cameraStarting}
              </p>
            </div>
          )}
        </div>

        {/* Camera Controls Overlay Bar */}
        {cameraActive && (
          <div className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center gap-2">
            <button
              onClick={toggleCameraFacing}
              className="rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-[11px] font-semibold text-slate-200 backdrop-blur-md flex items-center gap-1.5 hover:bg-slate-800"
            >
              <SwitchCamera className="h-3.5 w-3.5 text-emerald-400" />
              <span>Flip Camera</span>
            </button>
            <button
              onClick={stopCamera}
              className="rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1.5 text-[11px] font-semibold text-slate-200 backdrop-blur-md flex items-center gap-1 hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5 text-rose-400" />
              <span>Stop</span>
            </button>
          </div>
        )}

        {/* Real-time Decoded Overlay Banner */}
        {scannedFeedback && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 p-4 text-center animate-fadeIn">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 animate-scaleUp" />
            <span className="mt-2 text-sm font-bold text-white">{scannedFeedback}</span>
            <span className="mt-1 text-xs text-emerald-300">Loading AI Safety Verification...</span>
          </div>
        )}
      </div>

      {/* Validation / Scan Error Banner */}
      {scanError && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200 animate-fadeIn">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300">QR Code Error: </span>
            <span>{scanError}</span>
          </div>
        </div>
      )}

      {/* Real QR Scanning Instructions */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 text-xs text-slate-300 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <QrCode className="h-4 w-4" />
        </div>
        <p className="leading-relaxed">
          Point camera directly at any standard UPI QR code on another phone or printed bill. Our in-browser engine decodes it in real-time.
        </p>
      </div>

      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-900/50">
        <ImageUp className="h-4 w-4 text-emerald-400" />
        Upload QR image manually
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleManualUpload(file);
            }
            event.target.value = '';
          }}
        />
      </label>

      {/* Fallback Demo QR Presets (Available if camera is unavailable or for instant test) */}
      <div className="space-y-2.5 rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <QrCode className="h-4 w-4 text-emerald-400" />
            <span>Fallback Demo QR Presets (For no-camera environments):</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {DEMO_QR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleProcessQrData(preset.rawPayload)}
              className={`flex items-center justify-between rounded-xl border p-3 text-left transition hover:scale-[1.01] active:scale-[0.99] ${
                preset.id === 'qr-sample-invalid'
                  ? 'border-rose-500/30 bg-rose-950/20 hover:bg-rose-950/40'
                  : preset.id === 'qr-sample-rahul'
                  ? 'border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-950/40'
                  : 'border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-950/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{preset.title}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      preset.id === 'qr-sample-invalid'
                        ? 'bg-rose-500/20 text-rose-300'
                        : preset.id === 'qr-sample-rahul'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {preset.typeBadge}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">{preset.description}</p>
              </div>

              {preset.amount ? (
                <span className="text-xs font-black text-white shrink-0 ml-2">
                  ₹{preset.amount.toLocaleString('en-IN')}
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold shrink-0 ml-2">
                  Tap to scan
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
