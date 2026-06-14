export interface CourseRequirement {
  id: string;
  text: string;
}

export interface Course {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  features: string[]; // e.g., ["Form sentences", "Everyday talk"]
  isAdvanced?: boolean;
  duration?: string;
  price?: string; // Optional if you decide to show pricing later
}