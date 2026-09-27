import { BackgroundTheme, AnimeGifItem } from './types';

export const CURATED_ANIME_THEMES: BackgroundTheme[] = [
  {
    id: 'tokyo-neon',
    name: 'Neo-Tokyo Cyberpunk',
    description: 'Electric neon skyscrapers, glowing holographic signs, and cybernetic rain.',
    category: 'cyberpunk',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWVpZG9uOG9tN2U3a2Z2ZXpqMjdrdDB1OXg4NmJ0OTFnOHp5eDVwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4gsjHZMPXdlGo/giphy.gif',
    bgGradient: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
    wallColor: '#00f0ff',
    wallGlow: 'rgba(0, 240, 255, 0.7)',
    dotGlow: '#fef08a',
    overlayOpacity: 0.28,
    particles: 'cyber_rain',
  },
  {
    id: 'sakura-shrine',
    name: 'Cherry Blossom Shrine',
    description: 'Serene ancient Torii gate surrounded by floating pink sakura petals under moonlight.',
    category: 'scenic',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3FjbnE2d2dpd2pmeTFoMHR4Y3dyZGptNnd2eXZhbjU0a3I3ZTR3YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlTy9x8FxqyV0go/giphy.gif',
    bgGradient: 'radial-gradient(ellipse at center, #2e0854 0%, #0c021f 100%)',
    wallColor: '#ff77a9',
    wallGlow: 'rgba(255, 119, 169, 0.7)',
    dotGlow: '#ffffff',
    overlayOpacity: 0.32,
    particles: 'sakura',
  },
  {
    id: 'dragon-sky',
    name: 'Super Saiyan Sunset',
    description: 'Blazing golden sunset peaks with radiating Dragon Ki aura.',
    category: 'scenic',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZ5a3NqNmpxcmI4b3g3OHh4ZXZmNmF2ajBxdW05ejN1eDVkMGpqZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/97HNMBn7355lK/giphy.gif',
    bgGradient: 'radial-gradient(ellipse at center, #451a03 0%, #050201 100%)',
    wallColor: '#facc15',
    wallGlow: 'rgba(250, 204, 21, 0.7)',
    dotGlow: '#fde047',
    overlayOpacity: 0.3,
    particles: 'embers',
  },
  {
    id: 'demon-mountain',
    name: 'Demon Mountain Moonlight',
    description: 'Crimson blood moon casting eerie shadows over rugged mountain peaks.',
    category: 'scenic',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnAxd2J1Y3l4MHp3aWd1a292d2dja3d3aW0wZXRqZ2M1cmk4eHp4bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B4bkhn8e3w45G/giphy.gif',
    bgGradient: 'radial-gradient(ellipse at center, #3b0764 0%, #030712 100%)',
    wallColor: '#ef4444',
    wallGlow: 'rgba(239, 68, 68, 0.7)',
    dotGlow: '#fca5a5',
    overlayOpacity: 0.35,
    particles: 'embers',
  },
  {
    id: 'cosmic-void',
    name: 'Infinite Domain Void',
    description: 'Deep celestial dimension filled with swirling galaxies and infinite starlight.',
    category: 'cosmic',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnQyeDN3MXN3d2VveWkyazZ6czhrb2pza2c2anoxMXVldWZtZ2tpeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WmkqburJqXziM/giphy.gif',
    bgGradient: 'radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)',
    wallColor: '#c084fc',
    wallGlow: 'rgba(192, 132, 252, 0.7)',
    dotGlow: '#38bdf8',
    overlayOpacity: 0.25,
    particles: 'stardust',
  },
  {
    id: 'arcade-synthwave',
    name: 'Retro Anime Cyber Grid',
    description: 'Arcade neon cyber grid with pulsing Anime energy waves.',
    category: 'neon',
    gifUrl: 'https://cdn.otakugifs.xyz/gifs/dance/594d5fa6302b0e10.gif',
    bgGradient: 'radial-gradient(ellipse at center, #311042 0%, #0a0314 100%)',
    wallColor: '#ec4899',
    wallGlow: 'rgba(236, 72, 153, 0.7)',
    dotGlow: '#38bdf8',
    overlayOpacity: 0.28,
    particles: 'neon_lines',
  },
];

export const POPULAR_ANIME_GIFS: AnimeGifItem[] = [
  {
    id: 'gif-dbz-aura',
    title: 'Super Saiyan Awakening Aura',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZ5a3NqNmpxcmI4b3g3OHh4ZXZmNmF2ajBxdW05ejN1eDVkMGpqZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/97HNMBn7355lK/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWZ5a3NqNmpxcmI4b3g3OHh4ZXZmNmF2ajBxdW05ejN1eDVkMGpqZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/97HNMBn7355lK/200.gif',
    category: 'Battle',
  },
  {
    id: 'gif-naruto-rasengan',
    title: 'Naruto Chakra Rasengan',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWVpZG9uOG9tN2U3a2Z2ZXpqMjdrdDB1OXg4NmJ0OTFnOHp5eDVwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4gsjHZMPXdlGo/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWVpZG9uOG9tN2U3a2Z2ZXpqMjdrdDB1OXg4NmJ0OTFnOHp5eDVwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4gsjHZMPXdlGo/200.gif',
    category: 'Battle',
  },
  {
    id: 'gif-luffy-gear5',
    title: 'Gear 5 Sun God Liberation',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnQyeDN3MXN3d2VveWkyazZ6czhrb2pza2c2anoxMXVldWZtZ2tpeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WmkqburJqXziM/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnQyeDN3MXN3d2VveWkyazZ6czhrb2pza2c2anoxMXVldWZtZ2tpeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WmkqburJqXziM/200.gif',
    category: 'Battle',
  },
  {
    id: 'gif-demon-slayer-water',
    title: 'Demon Slayer Water Breathing',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnAxd2J1Y3l4MHp3aWd1a292d2dja3d3aW0wZXRqZ2M1cmk4eHp4bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B4bkhn8e3w45G/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnAxd2J1Y3l4MHp3aWd1a292d2dja3d3aW0wZXRqZ2M1cmk4eHp4bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B4bkhn8e3w45G/200.gif',
    category: 'Battle',
  },
  {
    id: 'gif-sakura-night',
    title: 'Sakura Night Blossom Temple',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3FjbnE2d2dpd2pmeTFoMHR4Y3dyZGptNnd2eXZhbjU0a3I3ZTR3YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlTy9x8FxqyV0go/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3FjbnE2d2dpd2pmeTFoMHR4Y3dyZGptNnd2eXZhbjU0a3I3ZTR3YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlTy9x8FxqyV0go/200.gif',
    category: 'Scenic',
  },
  {
    id: 'gif-anime-punch',
    title: 'High-Impact Shonen Strike',
    url: 'https://cdn.otakugifs.xyz/gifs/punch/7895d749a1244483.gif',
    previewUrl: 'https://cdn.otakugifs.xyz/gifs/punch/7895d749a1244483.gif',
    category: 'Battle',
  },
  {
    id: 'gif-anime-celebrate',
    title: 'Arcade Victory Confetti',
    url: 'https://cdn.otakugifs.xyz/gifs/celebrate/6972def9c7c55de5.gif',
    previewUrl: 'https://cdn.otakugifs.xyz/gifs/celebrate/6972def9c7c55de5.gif',
    category: 'Celebrate',
  },
  {
    id: 'gif-anime-dance',
    title: 'Cyberpunk Neon Dance',
    url: 'https://cdn.otakugifs.xyz/gifs/dance/594d5fa6302b0e10.gif',
    previewUrl: 'https://cdn.otakugifs.xyz/gifs/dance/594d5fa6302b0e10.gif',
    category: 'Dance',
  }
];

export const ANIME_GIF_CATEGORIES = [
  { reaction: 'punch', label: 'Battle / Fight', emoji: '⚔️' },
  { reaction: 'dance', label: 'Dance / Rhythm', emoji: '💃' },
  { reaction: 'celebrate', label: 'Victory / Party', emoji: '🎉' },
  { reaction: 'run', label: 'Speed / Chase', emoji: '🏃' },
  { reaction: 'cool', label: 'Badass / Cool', emoji: '😎' },
  { reaction: 'evillaugh', label: 'Evil Oni Boss', emoji: '👹' },
  { reaction: 'happy', label: 'Joy / Energy', emoji: '✨' },
  { reaction: 'mad', label: 'Rage Surge', emoji: '🔥' },
  { reaction: 'smug', label: 'Smug Shinobi', emoji: '😏' },
  { reaction: 'yay', label: 'Super Cheers', emoji: '🥳' },
];

export async function fetchLiveAnimeGif(reaction: string): Promise<AnimeGifItem | null> {
  try {
    const res = await fetch(`https://api.otakugifs.xyz/gif?reaction=${encodeURIComponent(reaction)}`, {
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.url) {
        return {
          id: `otaku-${reaction}-${Date.now()}`,
          title: `Anime ${reaction.toUpperCase()} Action`,
          url: data.url,
          previewUrl: data.url,
          category: reaction,
        };
      }
    }
  } catch (err) {
    console.warn('Live Anime GIF API fetch failed, falling back:', err);
  }
  return null;
}

export async function searchAnimeGifs(query: string): Promise<AnimeGifItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return POPULAR_ANIME_GIFS;

  // 1. Check if the query matches a live reaction category
  const matchingCategory = ANIME_GIF_CATEGORIES.find(
    (c) => c.reaction.includes(trimmed) || c.label.toLowerCase().includes(trimmed)
  );

  let liveItem: AnimeGifItem | null = null;
  if (matchingCategory || ['fight', 'attack', 'power', 'fast', 'chase', 'demon'].includes(trimmed)) {
    const reactionKey = matchingCategory?.reaction || (trimmed === 'fight' || trimmed === 'attack' ? 'punch' : trimmed === 'fast' || trimmed === 'chase' ? 'run' : 'cool');
    liveItem = await fetchLiveAnimeGif(reactionKey);
  }

  // 2. Filter existing rich library
  const matched = POPULAR_ANIME_GIFS.filter(
    (g) => g.title.toLowerCase().includes(trimmed) || g.category.toLowerCase().includes(trimmed)
  );

  if (liveItem) {
    return [liveItem, ...matched.filter((m) => m.url !== liveItem?.url)];
  }

  return matched.length > 0 ? matched : POPULAR_ANIME_GIFS;
}
