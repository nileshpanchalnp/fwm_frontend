export interface ContactFormData {
  fullName: string;
  phone: string;
  course: string;
  message: string;
}

export interface FormStatus {
  submitting: boolean;
  success?: boolean;
  error?: string | null;
}

// Useful if you add a newsletter or demo session form later
export interface NewsletterFormData {
  email: string;
}