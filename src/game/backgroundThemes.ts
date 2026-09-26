import { BackgroundTheme, AnimeGifItem } from './types';

export const CURATED_ANIME_THEMES: BackgroundTheme[] = [
  {
    id: 'tokyo-neon',
    name: 'Neo-Tokyo Cyberpunk',
    description: 'Electric neon skyscrapers, glowing holographic signs, and cybernetic rain.',
    category: 'cyberpunk',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3g0MmhqZm1xZWk1c3J1a25iM3drZWZ2NGx2ejdyZnN0aG15dnhkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKTDnUxE6uQjaYM/giphy.gif',
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
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2FjbnE2d2dpd2pmeTFoMHR4Y3dyZGptNnd2eXZhbjU0a3I3ZTR3YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlTy9x8FxqyV0go/giphy.gif',
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
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmJydjFld3p3ZHV3Zms4eGFlaHczazExazhsaWkwdmhpczZzcnczOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3XilJ5BOiSGic/giphy.gif',
    bgGradient: 'radial-gradient(ellipse at center, #1e1b4b 0%, #020617 100%)',
    wallColor: '#c084fc',
    wallGlow: 'rgba(192, 132, 252, 0.7)',
    dotGlow: '#38bdf8',
    overlayOpacity: 0.25,
    particles: 'stardust',
  },
  {
    id: 'arcade-synthwave',
    name: 'Retro Synthwave Grid',
    description: '1980s neon purple horizon grid with giant wireframe synth sun.',
    category: 'neon',
    gifUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWl2OGQyeWNqdTFmdWZ3amlyM3RveHRocmt4czgyMWc4OHdrOXA2dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d1E2VyhFsxawRfZ6/giphy.gif',
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
    id: 'gif-tokyo-cyber',
    title: 'Neo-Tokyo Cyber City Rain',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3g0MmhqZm1xZWk1c3J1a25iM3drZWZ2NGx2ejdyZnN0aG15dnhkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKTDnUxE6uQjaYM/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3g0MmhqZm1xZWk1c3J1a25iM3drZWZ2NGx2ejdyZnN0aG15dnhkZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKTDnUxE6uQjaYM/200.gif',
    category: 'Cyberpunk',
  },
  {
    id: 'gif-sakura-night',
    title: 'Sakura Night Blossom Temple',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2FjbnE2d2dpd2pmeTFoMHR4Y3dyZGptNnd2eXZhbjU0a3I3ZTR3YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlTy9x8FxqyV0go/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM2FjbnE2d2dpd2pmeTFoMHR4Y3dyZGptNnd2eXZhbjU0a3I3ZTR3YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlTy9x8FxqyV0go/200.gif',
    category: 'Scenic',
  },
  {
    id: 'gif-demon-slayer-water',
    title: 'Demon Slayer Water Breathing',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnAxd2J1Y3l4MHp3aWd1a292d2dja3d3aW0wZXRqZ2M1cmk4eHp4bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B4bkhn8e3w45G/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnAxd2J1Y3l4MHp3aWd1a292d2dja3d3aW0wZXRqZ2M1cmk4eHp4bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B4bkhn8e3w45G/200.gif',
    category: 'Action',
  },
  {
    id: 'gif-jjk-domain',
    title: 'Jujutsu Void Eye Expansion',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmJydjFld3p3ZHV3Zms4eGFlaHczazExazhsaWkwdmhpczZzcnczOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3XilJ5BOiSGic/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmJydjFld3p3ZHV3Zms4eGFlaHczazExazhsaWkwdmhpczZzcnczOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7bu3XilJ5BOiSGic/200.gif',
    category: 'Domain',
  },
  {
    id: 'gif-synth-sun',
    title: 'Retro Arcade 80s Grid',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWl2OGQyeWNqdTFmdWZ3amlyM3RveHRocmt4czgyMWc4OHdrOXA2dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d1E2VyhFsxawRfZ6/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWl2OGQyeWNqdTFmdWZ3amlyM3RveHRocmt4czgyMWc4OHdrOXA2dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d1E2VyhFsxawRfZ6/200.gif',
    category: 'Retro',
  },
  {
    id: 'gif-naruto-rasengan',
    title: 'Naruto Chakra Rasengan',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWVpZG9uOG9tN2U3a2Z2ZXpqMjdrdDB1OXg4NmJ0OTFnOHp5eDVwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4gsjHZMPXdlGo/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWVpZG9uOG9tN2U3a2Z2ZXpqMjdrdDB1OXg4NmJ0OTFnOHp5eDVwNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4gsjHZMPXdlGo/200.gif',
    category: 'Action',
  },
  {
    id: 'gif-luffy-gear5',
    title: 'Gear 5 Sun God Liberation',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnQyeDN3MXN3d2VveWkyazZ6czhrb2pza2c2anoxMXVldWZtZ2tpeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WmkqburJqXziM/giphy.gif',
    previewUrl: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnQyeDN3MXN3d2VveWkyazZ6czhrb2pza2c2anoxMXVldWZtZ2tpeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/WmkqburJqXziM/200.gif',
    category: 'Action',
  }
];

export async function searchAnimeGifs(query: string): Promise<AnimeGifItem[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return POPULAR_ANIME_GIFS;

  try {
    // Search Giphy public arcade endpoint with anime tag
    const endpoint = `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${encodeURIComponent(
      'anime ' + trimmed
    )}&limit=16&rating=pg`;
    const res = await fetch(endpoint);
    if (res.ok) {
      const data = await res.json();
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        return data.data.map((item: any) => ({
          id: item.id,
          title: item.title || `${trimmed} animation`,
          url: item.images?.original?.url || item.images?.downsized?.url,
          previewUrl: item.images?.fixed_width_small?.url || item.images?.preview_gif?.url,
          category: 'Search Result',
        }));
      }
    }
  } catch (err) {
    console.warn('Anime GIF API fallback to local curated set:', err);
  }

  // Filter curated collection as reliable fallback
  return POPULAR_ANIME_GIFS.filter(
    (g) => g.title.toLowerCase().includes(trimmed) || g.category.toLowerCase().includes(trimmed)
  );
}
