export type NovelStatus = "ongoing" | "completed" | "hiatus" | "dropped";
export type ProfileRole = "reader" | "staff" | "admin";
export type ContentFormat = "markdown" | "html" | "text";

export interface Novel {
  id: string;
  slug: string;
  title: string;
  original_title: string | null;
  description: string | null;
  cover_url: string | null;
  author: string | null;
  translator: string | null;
  status: NovelStatus;
  is_published: boolean;
  views: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: string;
  novel_id: string;
  novel_slug: string;
  chapter_number: number;
  title: string;
  slug: string | null;
  content: string;
  content_format: ContentFormat;
  word_count: number | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: ProfileRole;
  bio: string | null;
  created_at: string;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface NovelGenre {
  novel_id: string;
  genre_id: string;
}

export type Database = {
  public: {
    Tables: {
      novels: {
        Row: Novel;
        Insert: Partial<Novel> & { title: string; slug: string };
        Update: Partial<Novel>;
      };
      chapters: {
        Row: Chapter;
        Insert: Partial<Chapter> & {
          novel_id: string;
          novel_slug: string;
          chapter_number: number;
          title: string;
          content: string;
        };
        Update: Partial<Chapter>;
      };
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
      };
      genres: {
        Row: Genre;
        Insert: Partial<Genre> & { name: string; slug: string };
        Update: Partial<Genre>;
      };
      novel_genres: {
        Row: NovelGenre;
        Insert: NovelGenre;
        Update: Partial<NovelGenre>;
      };
    };
  };
};
