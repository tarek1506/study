export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: Profile
        Insert: ProfileInsert
        Update: ProfileUpdate
      }
      courses: {
        Row: Course
        Insert: CourseInsert
        Update: CourseUpdate
      }
      sections: {
        Row: Section
        Insert: SectionInsert
        Update: SectionUpdate
      }
      lessons: {
        Row: Lesson
        Insert: LessonInsert
        Update: LessonUpdate
      }
      study_sessions: {
        Row: StudySession
        Insert: StudySessionInsert
        Update: StudySessionUpdate
      }
    }
  }
}

// Profile

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  updated_at: string
  created_at: string
}

export type ProfileInsert = Pick<Profile, 'id' | 'email'> &
  Partial<Pick<Profile, 'display_name' | 'avatar_url' | 'updated_at' | 'created_at'>>
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at'>>

// ─── Course ────────────────────────────────────────────────────────────────

export interface Course {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string | null
  color: string
  thumbnail_url: string | null
  start_date: string | null
  end_date: string | null
  position: number
  created_at: string
}

export type CourseInsert = Omit<Course, 'id' | 'created_at'>
export type CourseUpdate = Partial<CourseInsert>

// ─── Section ───────────────────────────────────────────────────────────────

export interface Section {
  id: string
  course_id: string
  title: string
  position: number
  created_at: string
}

export type SectionInsert = Omit<Section, 'id' | 'created_at'>
export type SectionUpdate = Partial<SectionInsert>

// ─── Lesson ────────────────────────────────────────────────────────────────

export interface Lesson {
  id: string
  section_id: string
  title: string
  duration_minutes: number | null
  position: number
  is_completed: boolean
  completed_at: string | null
  created_at: string
}

export type LessonInsert = Omit<Lesson, 'id' | 'created_at'>
export type LessonUpdate = Partial<LessonInsert>

// ─── Study Session ─────────────────────────────────────────────────────────

export interface StudySession {
  id: string
  user_id: string
  lesson_id: string | null
  date: string
  created_at: string
}

export type StudySessionInsert = Omit<StudySession, 'id' | 'created_at'>
export type StudySessionUpdate = Partial<StudySessionInsert>

// ─── Enriched types ────────────────────────────────────────────────────────

export interface SectionWithLessons extends Section {
  lessons: Lesson[]
}

export interface CourseWithProgress extends Course {
  sections: SectionWithLessons[]
  totalLessons: number
  completedLessons: number
  progress: number
  // client-side ordering index (may differ from DB position if not yet saved)
  displayIndex: number
}
