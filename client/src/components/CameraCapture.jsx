import { useCallback, useRef, useState } from 'react';

import Icon from './Icon.jsx';
import LiveCamera from './LiveCamera.jsx';

/**
 * "Take photo" means take a photo, so this opens a live viewfinder whenever the browser grants
 * camera access. Browsers only expose `getUserMedia` on localhost/HTTPS, so where they do not (a
 * phone on a plain-HTTP LAN address) it falls back to the native capture intent, which still opens
 * the rear camera. Only on a desktop with no camera at all does it end up as a file picker.
 */
export default function CameraCapture({ onSelect, disabled }) {
  const inputRef = useRef(null);
  const [live, setLive] = useState(false);

  const fallBackToPicker = useCallback(() => {
    setLive(false);
    inputRef.current?.click();
  }, []);

  function open() {
    if (navigator.mediaDevices?.getUserMedia) {
      setLive(true);
      return;
    }
    inputRef.current?.click();
  }

  return (
    <>
      <button type="button" className="btn-primary" disabled={disabled} onClick={open}>
        <Icon name="camera" className="h-8 w-8" />
        Take photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (file) onSelect(file);
        }}
      />
      {live ? (
        <LiveCamera
          onClose={() => setLive(false)}
          onUnavailable={fallBackToPicker}
          onCapture={(file) => {
            setLive(false);
            onSelect(file);
          }}
        />
      ) : null}
    </>
  );
}
