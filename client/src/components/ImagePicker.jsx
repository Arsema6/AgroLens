import { useRef } from 'react';

import Icon from './Icon.jsx';

/** Gallery upload for photos already on the phone. */
export default function ImagePicker({ onSelect, disabled }) {
  const inputRef = useRef(null);

  return (
    <>
      <button type="button" className="btn-secondary" disabled={disabled} onClick={() => inputRef.current?.click()}>
        <Icon name="gallery" className="h-8 w-8" />
        Choose photo
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
