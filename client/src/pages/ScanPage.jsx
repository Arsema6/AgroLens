import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CameraCapture from '../components/CameraCapture.jsx';
import Icon from '../components/Icon.jsx';
import ImagePicker from '../components/ImagePicker.jsx';
import { analyzeImage } from '../lib/api.js';
import { makeThumbnail, prepareUpload } from '../lib/imageUtils.js';
import { saveScan } from '../lib/storage.js';

export default function ScanPage() {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  useEffect(() => () => preview && URL.revokeObjectURL(preview.url), [preview]);

  const busy = status === 'working';

  async function handleSelect(file) {
    setError(null);
    setPreview({ file, url: URL.createObjectURL(file) });
    setStatus('working');

    try {
      const [upload, thumbnail] = await Promise.all([prepareUpload(file), makeThumbnail(file)]);
      const result = await analyzeImage(upload);
      saveScan({ ...result, thumbnail });
      navigate(`/results/${result.scanId}`);
    } catch (analysisError) {
      setStatus('error');
      setError(analysisError.message);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-leaf-700 p-4 text-white">
        <h1 className="text-2xl">Check your crop</h1>
        <p className="mt-1 text-lg leading-snug text-leaf-100">
          Photograph one leaf close up, in daylight.
        </p>
      </div>

      <div
        className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-4 border-dashed ${
          preview ? 'border-leaf-600' : 'border-soil-200 bg-white'
        }`}
      >
        {preview ? (
          <img src={preview.url} alt="Selected crop photo" className="h-full w-full object-cover" />
        ) : (
          <Icon name="leaf" className="h-24 w-24 text-leaf-300" />
        )}
      </div>

      {busy ? (
        <p className="flex items-center justify-center gap-3 text-xl font-extrabold text-leaf-700">
          <Icon name="refresh" className="h-7 w-7 animate-spin" />
          Checking the photo...
        </p>
      ) : null}

      {error ? (
        <p className="card flex items-start gap-3 border-alert-high text-lg font-bold text-alert-high">
          <Icon name="warning" className="h-7 w-7 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <CameraCapture onSelect={handleSelect} disabled={busy} />
        <ImagePicker onSelect={handleSelect} disabled={busy} />
      </div>
    </div>
  );
}
