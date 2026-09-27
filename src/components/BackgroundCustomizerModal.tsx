import React, { useState, useEffect } from 'react';
import { BackgroundTheme, AnimeGifItem } from '../game/types';
import { CURATED_ANIME_THEMES, POPULAR_ANIME_GIFS, searchAnimeGifs, ANIME_GIF_CATEGORIES, fetchLiveAnimeGif } from '../game/backgroundThemes';
import { X, Search, Sparkles, Image as ImageIcon, Sliders, Check, ExternalLink, RefreshCw, Flame } from 'lucide-react';

interface BackgroundCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: BackgroundTheme;
  onSelectTheme: (theme: BackgroundTheme) => void;
  customGifUrl: string;
  onSetCustomGifUrl: (url: string) => void;
  bgOpacity: number;
  onSetBgOpacity: (opacity: number) => void;
  enableCRT: boolean;
  onToggleCRT: () => void;
}

export const BackgroundCustomizerModal: React.FC<BackgroundCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  customGifUrl,
  onSetCustomGifUrl,
  bgOpacity,
  onSetBgOpacity,
  enableCRT,
  onToggleCRT,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'gifs' | 'custom'>('themes');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<AnimeGifItem[]>(POPULAR_ANIME_GIFS);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [tempCustomUrl, setTempCustomUrl] = useState<string>(customGifUrl);

  const [activeReaction, setActiveReaction] = useState<string>('');

  useEffect(() => {
    setTempCustomUrl(customGifUrl);
  }, [customGifUrl]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    const results = await searchAnimeGifs(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSelectReaction = async (reaction: string) => {
    setActiveReaction(reaction);
    setIsSearching(true);
    const liveGif = await fetchLiveAnimeGif(reaction);
    if (liveGif) {
      setSearchResults((prev) => [liveGif, ...prev.filter((p) => p.url !== liveGif.url)]);
    } else {
      const results = await searchAnimeGifs(reaction);
      setSearchResults(results);
    }
    setIsSearching(false);
  };

  const handleSelectGif = (gif: AnimeGifItem) => {
    onSetCustomGifUrl(gif.url);
    // Apply gif onto current theme
    onSelectTheme({
      ...currentTheme,
      gifUrl: gif.url,
    });
  };

  const handleApplyCustomUrl = () => {
    if (tempCustomUrl.trim()) {
      onSetCustomGifUrl(tempCustomUrl.trim());
      onSelectTheme({
        ...currentTheme,
        gifUrl: tempCustomUrl.trim(),
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0c1029] border border-cyan-500/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl shadow-cyan-900/40 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-[#080b1d]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white font-['Orbitron'] tracking-wide">
                ANIME VISUAL & GIF STUDIO
              </h2>
              <p className="text-xs text-zinc-400">
                Customize live arcade backdrops, anime GIFs, and atmospheric weather VFX
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('themes')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'themes'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Atmospheric Themes
          </button>
          <button
            onClick={() => setActiveTab('gifs')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'gifs'
                ? 'border-rose-400 text-rose-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Anime GIF API
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 px-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
              activeTab === 'custom'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Custom GIF / URL
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: CURATED THEMES */}
          {activeTab === 'themes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CURATED_ANIME_THEMES.map((th) => {
                const isSelected = currentTheme.id === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => onSelectTheme(th)}
                    className={`relative p-3 rounded-xl border cursor-pointer transition-all overflow-hidden group flex flex-col justify-between ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/20 scale-[1.01]'
                        : 'border-zinc-800 bg-[#101633]/80 hover:border-zinc-700 hover:bg-[#151c3d]'
                    }`}
                  >
                    {/* Background Preview */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white font-['Rajdhani']">
                          {th.name}
                        </span>
                        {isSelected && (
                          <span className="p-0.5 rounded-full bg-cyan-500 text-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/30">
                        {th.particles}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{th.description}</p>

                    {/* Color palette swatches */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-zinc-500 font-medium">Palette:</span>
                        <div
                          className="w-4 h-4 rounded-full border border-white/40"
                          style={{ backgroundColor: th.wallColor }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white/40"
                          style={{ backgroundColor: th.dotGlow }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-400">
                        {th.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: ANIME GIF API SEARCH */}
          {activeTab === 'gifs' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anime GIFs (e.g. Dragon Ball, Demon Slayer, Naruto, Cyberpunk, Ghibli)..."
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
                  />
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold font-['Orbitron'] tracking-wider shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  {isSearching ? 'FETCHING...' : 'SEARCH'}
                </button>
              </form>

              {/* Live Anime GIF Categories (Otakugifs API) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="font-bold flex items-center gap-1 text-cyan-400">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    LIVE ANIME REACTIONS API
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ● Otakugifs Cloud Active
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ANIME_GIF_CATEGORIES.map((cat) => {
                    const isSelected = activeReaction === cat.reaction;
                    return (
                      <button
                        key={cat.reaction}
                        type="button"
                        onClick={() => handleSelectReaction(cat.reaction)}
                        disabled={isSearching}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 ring-1 ring-rose-400'
                            : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        <span>{cat.emoji}</span>
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* GIF Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {searchResults.map((gif) => {
                  const isCurrent = currentTheme.gifUrl === gif.url;
                  return (
                    <div
                      key={gif.id}
                      onClick={() => handleSelectGif(gif)}
                      className={`relative group rounded-xl overflow-hidden border cursor-pointer aspect-video bg-zinc-950 transition-all ${
                        isCurrent
                          ? 'border-rose-400 ring-2 ring-rose-500 shadow-lg shadow-rose-500/30 scale-102'
                          : 'border-zinc-800 hover:border-zinc-600 hover:scale-[1.02]'
                      }`}
                    >
                      <img
                        src={gif.previewUrl || gif.url}
                        alt={gif.title}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] text-white font-bold truncate">
                          {gif.title}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white p-0.5 rounded-full shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM DIRECT GIF URL */}
          {activeTab === 'custom' && (
            <div className="space-y-4">
              <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl space-y-3">
                <label className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  Paste Direct Anime GIF Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={tempCustomUrl}
                    onChange={(e) => setTempCustomUrl(e.target.value)}
                    placeholder="https://media.giphy.com/media/.../giphy.gif"
                    className="flex-1 bg-black border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleApplyCustomUrl}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-['Orbitron'] rounded-xl shadow-lg shadow-amber-500/20"
                  >
                    APPLY GIF
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Tip: Supports any direct .gif, .webp, or .jpg animation links from Giphy, Tenor, Imgur, or Pinterest.
                </p>
              </div>

              {/* Preview */}
              {tempCustomUrl && (
                <div className="rounded-xl border border-zinc-800 overflow-hidden bg-black max-w-md mx-auto aspect-video relative">
                  <img
                    src={tempCustomUrl}
                    alt="Custom Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] text-zinc-300">
                    Live Background Preview
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SHARED VISUAL SETTINGS (Opacity, CRT, Weather) */}
          <div className="pt-4 border-t border-zinc-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Backdrop Visibility & Filter Tuning</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-300">Background Dimmer / Opacity</span>
                  <span className="text-cyan-400 font-mono">{Math.round(bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={bgOpacity}
                  onChange={(e) => onSetBgOpacity(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 bg-zinc-800 h-2 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-zinc-500">
                  Lower for higher arcade maze contrast, higher for cinematic anime immersion.
                </span>
              </div>

              {/* CRT Scanlines Toggle */}
              <div className="flex items-center justify-between pt-2 sm:pt-0 sm:pl-4 sm:border-l border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 block">
                    Retro CRT Arcade Scanlines
                  </span>
                  <span className="text-[10px] text-zinc-500 block">
                    Adds authentic 80s arcade phosphor scanlines
                  </span>
                </div>
                <button
                  onClick={onToggleCRT}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    enableCRT
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {enableCRT ? 'ENABLED' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#080b1d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs font-['Orbitron'] tracking-wider rounded-xl shadow-lg shadow-cyan-500/20"
          >
            READY TO PLAY
          </button>
        </div>
      </div>
    </div>
  );
};
