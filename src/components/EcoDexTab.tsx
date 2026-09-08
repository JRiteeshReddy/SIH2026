import React, { useState } from 'react';
import { 
  Search, 
  Camera, 
  Lock, 
  Sparkles, 
  X, 
  CheckCircle, 
  HelpCircle, 
  Calendar, 
  Eye, 
  Filter,
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { useEcoDex } from '../context/EcoDexContext';
import { Species } from '../types';
import { audio } from '../services/audioService';
import { SpeciesDetailModal } from './SpeciesDetailModal';

type EcoDexRarityTab = 'All' | 'Common' | 'Rare' | 'Epic' | 'Legendary';

const RARITY_TABS: EcoDexRarityTab[] = ['All', 'Common', 'Rare', 'Epic', 'Legendary'];

export const EcoDexTab: React.FC = () => {
  const { species, setOpenScannerModal, recordDiscovery } = useEcoDex();
  const [selectedTab, setSelectedTab] = useState<EcoDexRarityTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDiscoveredOnly, setFilterDiscoveredOnly] = useState<boolean | null>(null);
  const [activeSpecimen, setActiveSpecimen] = useState<Species | null>(null);

  const discoveredCount = species.filter(s => s.discovered).length;
  const totalCount = species.length;
  const progressPercent = Math.round((discoveredCount / totalCount) * 100);

  // Filter list by selected rarity tab, search query, and discovered status
  const filteredSpecies = species.filter(s => {
    const matchesTab = selectedTab === 'All' || s.rarity === selectedTab;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.habitat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDiscovery = filterDiscoveredOnly === null || !!s.discovered === filterDiscoveredOnly;
    return matchesTab && matchesSearch && matchesDiscovery;
  });

  // Calculate tab counts
  const getTabStats = (tab: EcoDexRarityTab) => {
    if (tab === 'All') {
      return { total: species.length, discovered: species.filter(s => s.discovered).length };
    }
    const inTab = species.filter(s => s.rarity === tab);
    return { total: inTab.length, discovered: inTab.filter(s => s.discovered).length };
  };

  const getRarityPillStyle = (rarity: string, isDiscovered: boolean) => {
    switch (rarity) {
      case 'Legendary':
        return isDiscovered
          ? 'bg-amber-100 text-amber-900 border-amber-300 font-black shadow-xs'
          : 'bg-amber-950/40 text-amber-300 border-amber-700/60 font-bold';
      case 'Epic':
        return isDiscovered
          ? 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-xs'
          : 'bg-purple-950/40 text-purple-300 border-purple-700/60 font-bold';
      case 'Rare':
        return isDiscovered
          ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold shadow-xs'
          : 'bg-blue-950/40 text-blue-300 border-blue-700/60 font-bold';
      default:
        return isDiscovered
          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
          : 'bg-slate-800 text-slate-300 border-slate-700 font-semibold';
    }
  };

  const getActiveTabStyle = (tab: EcoDexRarityTab) => {
    if (selectedTab !== tab) {
      return 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900';
    }
    switch (tab) {
      case 'Legendary':
        return 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold shadow-md shadow-amber-500/25 border-transparent';
      case 'Epic':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-md shadow-purple-500/25 border-transparent';
      case 'Rare':
        return 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold shadow-md shadow-blue-500/25 border-transparent';
      case 'Common':
        return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/25 border-transparent';
      default:
        return 'bg-forest text-white font-extrabold shadow-md shadow-forest/25 border-transparent';
    }
  };

  const getCardRarityGlowClass = (rarity: string, isDiscovered: boolean) => {
    if (isDiscovered) {
      switch (rarity) {
        case 'Legendary': return 'glow-legendary ring-2 ring-amber-400/90';
        case 'Epic': return 'glow-epic ring-1 ring-purple-400/60';
        case 'Rare': return 'glow-rare ring-1 ring-sky-400/50';
        default: return 'glow-common ring-1 ring-emerald-400/40';
      }
    } else {
      switch (rarity) {
        case 'Legendary': return 'border-amber-500/50 shadow-sm shadow-amber-500/20';
        case 'Epic': return 'border-purple-500/40 shadow-sm shadow-purple-500/15';
        case 'Rare': return 'border-blue-500/40 shadow-sm shadow-blue-500/15';
        default: return 'border-slate-800';
      }
    }
  };

  const handleSimulateDiscovery = (speciesId: string) => {
    const res = recordDiscovery(speciesId);
    const updated = species.find(s => s.id === speciesId);
    if (updated) {
      setActiveSpecimen({ ...updated, discovered: true, totalSightings: (updated.totalSightings || 0) + 1 });
    }
  };

  return (
    <div className="space-y-4 pb-28 pt-1">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
            National Biodiversity Archive
          </span>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            EcoDex Journal
            <span className="text-sm font-normal text-slate-400 font-serif">📖</span>
          </h1>
        </div>

        <button
          onClick={() => {
            audio.playRadarPing();
            setOpenScannerModal(true);
          }}
          className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-nature flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>AI Camera</span>
        </button>
      </div>

      {/* ================= PROGRESS & COMPLETION BANNER ================= */}
      <div className="rounded-2xl bg-white p-4 border border-leaf-pale shadow-nature">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-leaf-pale flex items-center justify-center text-lg">
              🌿
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Collector Progress
              </h3>
              <p className="text-[11px] text-slate-500">
                {discoveredCount} of {totalCount} Native Species Logged
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-forest font-mono">
              {progressPercent}%
            </span>
            <div className="text-[9px] text-slate-400 font-semibold uppercase">Discovered</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-leaf rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* ================= SEARCH & CATEGORIES ================= */}
      <div className="space-y-2.5">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search species (e.g. Tiger, Peacock, Owl...)"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-leaf shadow-xs placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Rarity Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {RARITY_TABS.map(tab => {
            const stats = getTabStats(tab);
            return (
              <button
                key={tab}
                onClick={() => {
                  setSelectedTab(tab);
                  audio.playChime();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all border cursor-pointer flex items-center gap-1.5 ${getActiveTabStyle(tab)}`}
              >
                <span>{tab}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  selectedTab === tab ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {stats.discovered}/{stats.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Discovery Filter Status (All / Discovered / Locked) */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <div className="flex gap-1.5">
            <button
              onClick={() => setFilterDiscoveredOnly(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                filterDiscoveredOnly === null
                  ? 'bg-forest text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({filteredSpecies.length})
            </button>
            <button
              onClick={() => setFilterDiscoveredOnly(true)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                filterDiscoveredOnly === true
                  ? 'bg-forest text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Discovered ({species.filter(s => s.discovered && (selectedTab === 'All' || s.rarity === selectedTab)).length})
            </button>
            <button
              onClick={() => setFilterDiscoveredOnly(false)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                filterDiscoveredOnly === false
                  ? 'bg-forest text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Locked ({species.filter(s => !s.discovered && (selectedTab === 'All' || s.rarity === selectedTab)).length})
            </button>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            {filteredSpecies.length} Cards
          </span>
        </div>
      </div>

      {/* ================= COLLECTIBLE CARDS GRID ================= */}
      {filteredSpecies.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <div className="text-3xl mb-2">🔍</div>
          <h4 className="text-xs font-bold text-slate-800">No Specimens Found</h4>
          <p className="text-[11px] text-slate-500 mt-1">
            Try adjusting your search or switching category tabs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredSpecies.map(spec => {
            const isDiscovered = !!spec.discovered;

            return (
              <div
                key={spec.id}
                onClick={() => {
                  setActiveSpecimen(spec);
                  audio.playChime();
                }}
                className={`eco-card rounded-2xl overflow-hidden border transition-all cursor-pointer text-left flex flex-col justify-between group ${
                  getCardRarityGlowClass(spec.rarity, isDiscovered)
                } ${
                  isDiscovered
                    ? 'bg-white hover:scale-[1.02]'
                    : 'bg-slate-900 hover:border-slate-600'
                }`}
              >
                {/* ================= CARD IMAGE / SILHOUETTE ================= */}
                <div className="relative h-32 w-full overflow-hidden flex items-center justify-center bg-slate-950">
                  {isDiscovered ? (
                    /* Collected Animal: High-Res Vibrant Photo */
                    <>
                      <img
                        src={spec.discoveryPhoto || spec.image}
                        alt={spec.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                      {/* Rarity Badge in Top Right */}
                      <div className="absolute top-2 right-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-md border font-bold ${getRarityPillStyle(spec.rarity, true)}`}>
                          {spec.rarity}
                        </span>
                      </div>

                      {/* Category Icon Badge in Bottom Left */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-semibold backdrop-blur-sm flex items-center gap-1">
                        <span>{spec.icon}</span>
                        <span>{spec.category}</span>
                      </div>
                    </>
                  ) : (
                    /* Locked Animal: Silhouette with Glowing Question Mark */
                    <>
                      {/* Dark Silhouette Image */}
                      <img
                        src={spec.image}
                        alt="Locked Silhouette"
                        className="w-full h-full object-cover filter brightness-0 contrast-150 opacity-30 group-hover:opacity-40 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

                      {/* Prominent Question Mark Overlay */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-xl font-black font-mono">?</span>
                        </div>
                        <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold mt-1">
                          Undiscovered
                        </span>
                      </div>

                      {/* Locked Rarity Indicator */}
                      <div className="absolute top-2 right-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-md border ${getRarityPillStyle(spec.rarity, false)}`}>
                          {spec.rarity}
                        </span>
                      </div>

                      {/* Locked Lock Tag */}
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-slate-300 text-[9px] font-medium backdrop-blur-sm flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        <span>Locked</span>
                      </div>
                    </>
                  )}
                </div>

                {/* ================= CARD FOOTER METADATA ================= */}
                <div className={`p-3 flex-1 flex flex-col justify-between ${isDiscovered ? 'bg-white' : 'bg-slate-900 text-white'}`}>
                  {isDiscovered ? (
                    /* Collected Animal Meta: Name, Rarity, EcoXP, Discovery Date */
                    <>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-900 line-clamp-1 group-hover:text-forest transition-colors">
                            {spec.name}
                          </h4>
                          <span className="text-[10px] font-black text-forest font-mono">
                            +{spec.xp} XP
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 italic font-serif line-clamp-1">
                          {spec.scientificName}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 flex items-center gap-1 truncate max-w-[110px]" title={spec.firstDiscoveredDate || spec.discoveredAt}>
                          <Calendar className="w-3 h-3 text-leaf flex-shrink-0" />
                          <span className="truncate">{spec.firstDiscoveredDate || spec.discoveredAt || 'Logged'}</span>
                        </span>

                        <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          {spec.totalSightings || 1}
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Locked Animal Meta: Mystery State with XP Bounty */
                    <>
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-300 font-mono">
                            ???
                          </h4>
                          <span className="text-[10px] font-bold text-amber-400 font-mono">
                            +{spec.xp} XP
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 italic font-mono line-clamp-1">
                          Classification hidden
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="text-[9px] font-mono">#{spec.labelIndex + 1}</span>
                        <span className="text-amber-400/90 text-[10px] font-semibold flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                          Tap to inspect
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= SPECIES DETAIL MODAL ================= */}
      <SpeciesDetailModal
        species={activeSpecimen}
        onClose={() => setActiveSpecimen(null)}
        onSimulateDiscovery={handleSimulateDiscovery}
      />
    </div>
  );
};
