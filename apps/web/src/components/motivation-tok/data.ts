export type TabKey = "home" | "search" | "bookmarks" | "account";

export type Quote = {
  text: string;
  author: string;
  role: string;
  category: string;
  categoryColor: string;
  background: string;
  avatar: string;
  avatarBackground: string;
  likes: number;
  dislikes: number;
  saves: number;
};

export type Bookmark = {
  quote: string;
  author: string;
  category: string;
  categoryColor: string;
};

export const QUOTES: Quote[] = [
  {
    text: "The darkest hour has only sixty minutes.",
    author: "Morris Mandel",
    role: "Author & Philosopher",
    category: "Resilience",
    categoryColor: "#f87171",
    background: "linear-gradient(155deg,#1a0533 0%,#0d1b3e 55%,#080808 100%)",
    avatar: "MM",
    avatarBackground: "linear-gradient(135deg,#7c3aed,#4f46e5)",
    likes: 2400,
    dislikes: 180,
    saves: 891,
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
    role: "Motivational Speaker",
    category: "Growth",
    categoryColor: "#34d399",
    background: "linear-gradient(155deg,#0a1f0f 0%,#0d2e1a 55%,#080808 100%)",
    avatar: "ZZ",
    avatarBackground: "linear-gradient(135deg,#059669,#047857)",
    likes: 3100,
    dislikes: 92,
    saves: 1240,
  },
  {
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    role: "Activist & Statesman",
    category: "Courage",
    categoryColor: "#60a5fa",
    background: "linear-gradient(155deg,#0a1020 0%,#0f1e3a 55%,#080808 100%)",
    avatar: "NM",
    avatarBackground: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    likes: 5800,
    dislikes: 140,
    saves: 2300,
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    role: "Entrepreneur & Visionary",
    category: "Purpose",
    categoryColor: "#e879f9",
    background: "linear-gradient(155deg,#1a0520 0%,#2d0b3a 55%,#080808 100%)",
    avatar: "SJ",
    avatarBackground: "linear-gradient(135deg,#9333ea,#7c3aed)",
    likes: 7200,
    dislikes: 320,
    saves: 3100,
  },
  {
    text: "In the middle of every difficulty lies opportunity.",
    author: "Albert Einstein",
    role: "Physicist & Thinker",
    category: "Wisdom",
    categoryColor: "#fbbf24",
    background: "linear-gradient(155deg,#1a1000 0%,#2d1f00 55%,#080808 100%)",
    avatar: "AE",
    avatarBackground: "linear-gradient(135deg,#d97706,#b45309)",
    likes: 4600,
    dislikes: 88,
    saves: 1900,
  },
  {
    text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
    author: "Ralph W. Emerson",
    role: "Essayist & Poet",
    category: "Mindset",
    categoryColor: "#a78bfa",
    background: "linear-gradient(155deg,#0f0a1f 0%,#1a1030 55%,#080808 100%)",
    avatar: "RE",
    avatarBackground: "linear-gradient(135deg,#6d28d9,#5b21b6)",
    likes: 3800,
    dislikes: 110,
    saves: 1600,
  },
];

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

export const TRENDING_AUTHORS = [
  "Marcus Aurelius",
  "Maya Angelou",
  "Nelson Mandela",
  "Rumi",
  "Viktor Frankl",
];

export const BOOKMARKS: Bookmark[] = [
  {
    quote: "The darkest hour has only sixty minutes.",
    author: "Morris Mandel",
    category: "Resilience",
    categoryColor: "#f87171",
  },
  {
    quote: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "Wisdom",
    categoryColor: "#fbbf24",
  },
  {
    quote: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: "Courage",
    categoryColor: "#60a5fa",
  },
];
