import { useState } from 'react';

const useForm = <T extends object>(defaultFormState: T) => {
  const [formState, setFormState] = useState<T>(defaultFormState);
  const [previewImage, setPreviewImage] = useState<string | null>(null); // for image preview

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;

    if (name === 'photo' && files && files[0]) {
      const file = files[0];

      // Update the actual file in form state
      setFormState((prev) => ({
        ...prev,
        [name]: file as any, // safely cast as needed
      }));

      // Generate preview
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
    } else {
      // Regular text inputs
      setFormState((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const updateFormField = (fieldName: keyof T, fieldValue: T[keyof T]) => {
    setFormState((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  return { formState, handleFormChange, updateFormField, previewImage };
};

export default useForm;
