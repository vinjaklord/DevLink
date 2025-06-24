import { useState, useEffect, useRef } from 'react';

import { Button } from '../Components/ui/button';
import { Label } from '../Components/ui/label';

const ImageUploader = (props) => {
  // JS-TEil
  const { handleFormChange, photo } = props;

  // URL des Vorschaubildes im lokalen State merken
  const [previewUrl, setPreviewUrl] = useState(null);

  //Referenz auf Input-Feld Type file
  const refPhoto = useRef(null);

  // Immer wenn sich photo ändert, versuchen, eine previewUrl zu erzeugen
  useEffect(() => {
    if (!photo) {
      return;
    }

    const filereader = new FileReader();
    filereader.onload = () => {
      // Umwandlung binäre Daten (blob) in base64-Format um
      setPreviewUrl(filereader.result);
    };
    filereader.readAsDataURL(photo);
  }, [photo]);

  // Handler für Fotoupload
  const handlePhotoUpload = () => {
    refPhoto.current.click();
  };

  // JSX-Teil
  return (
    <>
      <input
        ref={refPhoto}
        type="file"
        name="photo"
        onChange={handleFormChange}
        style={{ display: 'none' }}
      />

      <Button onClick={handlePhotoUpload}>Foto auswählen</Button>
      <div className="flex justify-center items-center mt-4">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Vorschau-Photo des neuen Mitglieds"
            className="h-[200px] object-cover"
          />
        ) : (
          <Label variant="body2">Bitte Foto auswählen</Label>
        )}
      </div>
    </>
  );
};

export default ImageUploader;
