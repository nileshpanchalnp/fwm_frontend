import { useState, ChangeEvent, FormEvent } from 'react';

interface FormState {
  [key: string]: any;
}

export const useForm = <T extends FormState>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const resetForm = () => {
    setValues(initialValues);
  };

  const handleSubmit = async (e: FormEvent, callback: (data: T) => Promise<void>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await callback(values);
      resetForm();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    handleChange,
    handleSubmit,
    isSubmitting,
    setValues,
  };
};