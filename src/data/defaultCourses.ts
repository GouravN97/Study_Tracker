import { Course, UserSettings } from "../types";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  studentName: "Alex Vance",
  studentEmail: "gouravn02@gmail.com",
  universityName: "Stanford University",
  termName: "Fall Semester 2026",
  autoResetMonday: true,
  autoEmailReport: true,
  defaultSubjectTarget: 12,
  lastResetWeekId: "",
  fontFamily: "plus-jakarta",
  backgroundStyle: "slate",
  backgroundDim: 65,
  backgroundBlur: 0,
};

export const INITIAL_COURSES: Course[] = [
  {
    id: "course-1",
    name: "Algorithms & Data Structures",
    code: "CS 301",
    instructor: "Prof. Alan Turing",
    hoursCompleted: 9.5,
    targetHours: 12,
    color: "indigo",
    category: "Core Major",
    backgroundImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    backgroundDim: 50,
    notes: "Implemented Red-Black trees and solved Dynamic Programming graph sets.",
  },
  {
    id: "course-2",
    name: "Linear Algebra & Diff Equations",
    code: "MATH 240",
    instructor: "Dr. Katherine Johnson",
    hoursCompleted: 11.0,
    targetHours: 12,
    color: "emerald",
    category: "Core STEM",
    backgroundImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
    backgroundDim: 50,
    notes: "Eigenvalue decompositions, matrix transformations, and practice exam.",
  },
  {
    id: "course-3",
    name: "Physics II: Electromagnetism",
    code: "PHYS 102",
    instructor: "Dr. Richard Feynman",
    hoursCompleted: 7.0,
    targetHours: 12,
    color: "amber",
    category: "Core STEM",
    backgroundImage: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
    backgroundDim: 50,
    notes: "Maxwell's equations review & magnetic flux laboratory simulation.",
  },
  {
    id: "course-4",
    name: "Operating Systems Architecture",
    code: "CS 350",
    instructor: "Prof. Linus Torvalds",
    hoursCompleted: 12.0,
    targetHours: 12,
    color: "sky",
    category: "Core Major",
    backgroundImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    backgroundDim: 50,
    notes: "Completed Pintos virtual memory paging project and threading lab.",
  },
  {
    id: "course-5",
    name: "Technical Communication & Ethics",
    code: "ENG 210",
    instructor: "Dr. Rachel Carson",
    hoursCompleted: 5.5,
    targetHours: 12,
    color: "violet",
    category: "General Requirement",
    backgroundImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    backgroundDim: 50,
    notes: "Drafted research paper proposal on algorithmic bias in admissions.",
  },
];

export const PRESET_BACKGROUND_IMAGES = [
  {
    name: "Code & Terminal",
    category: "Computer Science",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mathematics & Geometry",
    category: "Math",
    url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Quantum Physics & Lab",
    category: "Science",
    url: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Silicon Circuits & Hardware",
    category: "Engineering",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "University Library & Books",
    category: "Humanities",
    url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Modern Architecture & Design",
    category: "Design / Architecture",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Biology & Microscope",
    category: "Medical & Bio",
    url: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chemistry & Flasks",
    category: "Chemistry",
    url: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Economics & Finance Chart",
    category: "Business & Econ",
    url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Study Desk & Coffee",
    category: "General Study",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
  },
];

export { COLOR_OPTIONS } from "../utils/colorUtils";
