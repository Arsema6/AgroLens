import { useEffect, useRef, useState } from 'react';

import Icon from './Icon.jsx';

/**
 * Full-screen viewfinder: the rear camera streamed into a `<video>`, with a shutter that freezes the
 * current frame into a JPEG `File` shaped exactly like a picked file, so the scan flow is unchanged.
 */
export default function LiveCamera({ onCapture, onClose, onUnavailable }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelled) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      // No camera, or permission refused: hand back to the file input rather than dead-ending.
      .catch(() => {
        if (!cancelled) onUnavailable();
      });

    return () => {
      cancelled = true;
      stopStream(streamRef.current);
    };
  }, [onUnavailable]);

  function shoot() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('Could not take the photo. Try again.');
          return;
        }
        stopStream(streamRef.current);
        onCapture(new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.9,
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onCanPlay={() => setReady(true)}
          className="h-full w-full object-cover"
        />
        {error ? (
          <p className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-2xl bg-white p-4 text-center text-lg font-bold text-alert-high">
            {error}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-4 bg-black p-5 pb-8">
        <button
          type="button"
          aria-label="Close camera"
          onClick={onClose}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white"
        >
          <Icon name="close" className="h-8 w-8" />
        </button>

        <button
          type="button"
          aria-label="Take photo"
          disabled={!ready || Boolean(error)}
          onClick={shoot}
          className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-leaf-600 text-white disabled:opacity-40"
        >
          <Icon name="camera" className="h-12 w-12" />
        </button>

        <span className="h-16 w-16" aria-hidden="true" />
      </div>
    </div>
  );
}

function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}
