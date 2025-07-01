import { useState, useEffect, useRef } from 'react';
import { Label } from '../Components/ui/label';

const ImageUploader = (props) => {
  const { handleFormChange, photo } = props;
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: '100%',
    height: '16rem',
  });
  const refPhoto = useRef(null);

  useEffect(() => {
    if (!photo) {
      setPreviewUrl(null);
      setImageDimensions({ width: '100%', height: '16rem' });
      return;
    }

    const filereader = new FileReader();
    filereader.onload = () => {
      setPreviewUrl(filereader.result);
      const img = new Image();
      img.src = filereader.result;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxWidth = 384;
        const maxHeight = 384;
        let newWidth = img.width;
        let newHeight = img.height;

        if (img.width > maxWidth) {
          newWidth = maxWidth;
          newHeight = maxWidth / aspectRatio;
        }
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = maxHeight * aspectRatio;
        }

        setImageDimensions({
          width: `${newWidth}px`,
          height: `${newHeight}px`,
        });
      };
    };
    filereader.readAsDataURL(photo);
  }, [photo]);

  const handlePhotoUpload = () => {
    refPhoto.current.click();
  };

  return (
    <>
      <input
        ref={refPhoto}
        type="file"
        name="photo"
        onChange={handleFormChange}
        accept="image/*"
        className="hidden"
      />
      <div
        onClick={handlePhotoUpload}
        className="relative w-full max-w-xs border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
        style={{ width: imageDimensions.width, height: imageDimensions.height }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vorschau-Photo des neuen Mitglieds"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <svg
              className="w-12 h-12 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <Label className="text-sm">Foto auswählen</Label>
          </div>
        )}
      </div>
    </>
  );
};

export default ImageUploader;
