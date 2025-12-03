import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

const SignaturePad = ({ onSave, label = "Signature" }) => {
  const sigCanvas = useRef(null);

  const clear = () => {
    sigCanvas.current.clear();
  };

  const save = () => {
    if (sigCanvas.current.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }
    const dataURL = sigCanvas.current.toDataURL();
    onSave(dataURL);
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <div className="border-2 border-gray-400 rounded bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-32',
          }}
        />
      </div>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={clear}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={save}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;