export interface Testimonial {
  id: string | number;
  content: string;
  author: string;
  role: string; // e.g., "DELF B1 Student"
  image?: string; // Optional student avatar
  stars?: number; // Usually 5 for your project
}