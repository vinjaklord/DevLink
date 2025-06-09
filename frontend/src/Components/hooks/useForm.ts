import { useState } from "react";

const useForm = <T extends object>(defaultFormState: T) => {
  const [formState, setFormState] = useState<T>(defaultFormState);

  const handleFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;
    const newFormState = { ...formState, [name]: files && name === "photo" ? files[0] : value };
    setFormState(newFormState);
  };

  const updateFormField = (fieldName: keyof T, fieldValue: T[keyof T]) => {
    const newFormState = { ...formState, [fieldName]: fieldValue };
    setFormState(newFormState);
  };

  return { formState, handleFormChange, updateFormField };
};

export default useForm;
