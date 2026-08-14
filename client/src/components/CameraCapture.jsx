import { useRef } from 'react';

import Icon from './Icon.jsx';

/**
 * Opens the rear camera on phones via the native capture intent, which is far more reliable in
 * the field than a getUserMedia preview. On desktop the same input falls back to a file picker.
 */
export default function CameraCapture({ onSelect, disabled }) {
  const inputRef = useRef(null);

  return (
    <>
      <button type="button" className="btn-primary" disabled={disabled} onClick={() => inputRef.current?.click()}>
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
    </>
  );
}
