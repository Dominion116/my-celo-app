export type TabKey = "home" | "search" | "bookmarks" | "account";

export type Quote = {
  id: number;
  text: string;
  author: string;
  role: string;
  category: string;
  categoryColor: string;
  background: string;
  avatar: string;
  avatarImage: string;
  avatarBackground: string;
  likes: number;
  dislikes: number;
  saves: number;
};

export const CATEGORIES = [
  { name: "All", color: "#a78bfa" },
  { name: "Resilience", color: "#f87171" },
  { name: "Growth", color: "#34d399" },
  { name: "Courage", color: "#60a5fa" },
  { name: "Mindset", color: "#fbbf24" },
  { name: "Love", color: "#f472b6" },
  { name: "Success", color: "#a3e635" },
  { name: "Wisdom", color: "#fb923c" },
  { name: "Purpose", color: "#e879f9" },
  { name: "Focus", color: "#2dd4bf" },
];
