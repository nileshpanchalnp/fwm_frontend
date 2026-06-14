export interface Course {
  id: string;
  title: string;
  level: string;
  description: string;
  features: string[];
  isAdvanced?: boolean;
}

export const courses: Course[] = [
  {
    id: "foundation",
    title: "A1 + A2 Foundation Program",
    level: "A1 + A2",
    description: "Designed for complete beginners, building a strong base through grammar, vocabulary, and everyday communication.",
    features: [
      "Form sentences with confidence",
      "Understand basic conversations",
      "Communicate in real-life situations",
      "Prepare for beginner-level exams"
    ]
  },
  {
    id: "intermediate",
    title: "B1 + TEF Preparation",
    level: "B1 + TEF",
    description: "Ideal for learners aiming for intermediate proficiency with a focus on communication and exam readiness.",
    features: [
      "Structured speaking practice",
      "Writing development with clear formats",
      "Listening and reading strategies",
      "Introduction to TEF-style tasks"
    ]
  },
  {
    id: "advanced",
    title: "B2 + TEF Advanced",
    level: "B2 + TEF",
    isAdvanced: true,
    description: "An advanced-level program designed to help you communicate with fluency, precision, and depth.",
    features: [
      "Advanced grammar and expression",
      "Argument development & speaking",
      "High-level writing techniques",
      "Exam-oriented performance strategies"
    ]
  }
];