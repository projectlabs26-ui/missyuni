export type UserRole = "student" | "admin";

export type TransactionStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  whatsapp: string | null;
  role: string;
  avatarUrl: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnailUrl: string | null;
  trailerUrl: string | null;
  isPublished: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  order: number;
  videoUrl: string | null;
  pdfUrl: string | null;
  audioUrl: string | null;
  duration: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  passingScore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Question {
  id: string;
  quizId: string;
  text: string;
  options: string;
  correctIndex: number;
  order: number;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Transaction {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: string;
  paymentProof: string | null;
  adminNote: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  code: string;
  pdfUrl: string | null;
  createdAt: Date | string;
}

export interface LiveEvent {
  id: string;
  title: string;
  description: string | null;
  platform: string;
  joinUrl: string;
  scheduledAt: Date | string;
  duration: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPublished: boolean;
  targetRole: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Testimonial {
  id: string;
  userId: string | null;
  courseId: string | null;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  isApproved: boolean;
  createdAt: Date | string;
}

export interface ModuleProgress {
  id: string;
  enrollmentId: string;
  moduleId: string;
  completed: boolean;
  completedAt: Date | string | null;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  passed: boolean;
  answers: string;
  createdAt: Date | string;
}

export interface SalesPageContent {
  id: string;
  section: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Extended types with includes
export interface CourseWithModules extends Course {
  modules: Module[];
  _count?: {
    enrollments: number;
  };
}

export interface EnrollmentWithCourse extends Enrollment {
  course: CourseWithModules;
  moduleProgresses: ModuleProgress[];
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

export interface QuizAttemptWithQuiz extends QuizAttempt {
  quiz: QuizWithQuestions;
}

export interface TransactionWithCourse extends Transaction {
  course: Course;
  user: User;
}

export interface CertificateWithCourse extends Certificate {
  course: Course;
  user: User;
}
