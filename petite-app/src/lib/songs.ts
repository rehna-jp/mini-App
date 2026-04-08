export type Song = {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  options: string[];
};

export const songs: Song[] = [
  {
    id: "1",
    title: "HUMBLE.",
    artist: "Kendrick Lamar",
    youtubeId: "tvTRZJ-4EyI",
    options: ["Drake", "Kendrick Lamar", "J. Cole", "Travis Scott"],
  },
  {
    id: "2",
    title: "Essence",
    artist: "Wizkid",
    youtubeId: "lQqMSqhHLOU",
    options: ["Burna Boy", "Davido", "Wizkid", "Rema"],
  },
  {
    id: "3",
    title: "Blinding Lights",
    artist: "The Weeknd",
    youtubeId: "4NRXx6U8ABQ",
    options: ["Drake", "The Weeknd", "Post Malone", "Bruno Mars"],
  },
  {
    id: "4",
    title: "Love Nwantiti",
    artist: "CKay",
    youtubeId: "e-3bDlBxSY0",
    options: ["Fireboy DML", "CKay", "Joeboy", "Oxlade"],
  },
  {
    id: "5",
    title: "INDUSTRY BABY",
    artist: "Lil Nas X",
    youtubeId: "UTHLKHL_whs",
    options: ["Jack Harlow", "Lil Nas X", "Tyler the Creator", "Doja Cat"],
  },
  {
    id: "6",
    title: "Peaches",
    artist: "Justin Bieber",
    youtubeId: "tQ0yjYUFKAE",
    options: ["Ed Sheeran", "Justin Bieber", "Harry Styles", "Shawn Mendes"],
  },
  {
    id: "7",
    title: "Last Last",
    artist: "Burna Boy",
    youtubeId: "j6_3MaUmkSE",
    options: ["Burna Boy", "Wizkid", "Davido", "Asake"],
  },
  {
    id: "8",
    title: "As It Was",
    artist: "Harry Styles",
    youtubeId: "H5v3kku4y6Q",
    options: ["Ed Sheeran", "Harry Styles", "Sam Smith", "Dua Lipa"],
  },
  {
    id: "9",
    title: "Ojuju",
    artist: "Asake",
    youtubeId: "EfECHovFqTo",
    options: ["Asake", "Rema", "Omah Lay", "Fireboy DML"],
  },
  {
    id: "10",
    title: "Not Like Us",
    artist: "Kendrick Lamar",
    youtubeId: "SYqmzoN9XcM",
    options: ["Drake", "Kendrick Lamar", "Future", "21 Savage"],
  },
  {
    id: "11",
    title: "Calm Down",
    artist: "Rema",
    youtubeId: "NlBPMCbJCGE",
    options: ["Omah Lay", "Rema", "Oxlade", "Joeboy"],
  },
  {
    id: "12",
    title: "Levitating",
    artist: "Dua Lipa",
    youtubeId: "TUVcZfQe-Kw",
    options: ["Ariana Grande", "Dua Lipa", "Doja Cat", "Lizzo"],
  },
  {
    id: "13",
    title: "Flowers",
    artist: "Miley Cyrus",
    youtubeId: "G7KNmW9a75Y",
    options: ["Taylor Swift", "Miley Cyrus", "Selena Gomez", "Olivia Rodrigo"],
  },
  {
    id: "14",
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    youtubeId: "kPa7bsKwL-c",
    options: ["Beyoncé & Jay-Z", "Lady Gaga & Bruno Mars", "Ariana Grande & The Weeknd", "Dua Lipa & Coldplay"],
  },
  {
    id: "15",
    title: "Cruel Santino - Tule",
    artist: "Cruel Santino",
    youtubeId: "8X2kIfS6fb8",
    options: ["Cruel Santino", "Odunsi", "Santi", "WANI"],
  },
];

export function getRandomRounds(count: number = 5): Song[] {
  const shuffled = [...songs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}