import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSitemap, faHeart, faPaw } from '@fortawesome/free-solid-svg-icons';

export default function FamilyTreeModal({ isOpen, onClose, pets = [], onSelectPet }) {
  if (!isOpen) return null;

  // Build tree levels with strict generation alignment & partner logic
  const treeLevels = useMemo(() => {
    if (!pets || pets.length === 0) return [];

    const petMap = new Map();
    pets.forEach(p => {
      const rels = (p.relationships || p.relations || []).map(r => ({
        type: r.type,
        targetId: r.targetPetId || r.targetId,
        label: r.label
      }));
      petMap.set(p.id, { ...p, rels, children: [], depth: 0 });
    });

    // Helper to find partner
    const getPartner = (petId) => {
      const p = petMap.get(petId);
      if (!p || !p.rels) return null;
      const partnerRel = p.rels.find(r => r.type === 'partner');
      return partnerRel ? petMap.get(partnerRel.targetId) : null;
    };

    // First pass: depth from biological parents
    const computeDepth = (id, visited = new Set()) => {
      if (visited.has(id)) return 0;
      visited.add(id);
      const p = petMap.get(id);
      if (!p || !p.rels) return 0;

      const parentRels = p.rels.filter(r => r.type === 'parent');
      if (parentRels.length === 0) return 0;

      let maxParentDepth = 0;
      for (const rel of parentRels) {
        if (petMap.has(rel.targetId)) {
          maxParentDepth = Math.max(maxParentDepth, computeDepth(rel.targetId, new Set(visited)) + 1);
        }
      }
      return maxParentDepth;
    };

    pets.forEach(p => {
      const d = computeDepth(p.id);
      const node = petMap.get(p.id);
      if (node) node.depth = d;
    });

    // Second pass: Align partners to the same generation level
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 5) {
      changed = false;
      iterations++;
      pets.forEach(p => {
        const partner = getPartner(p.id);
        if (partner) {
          const currentA = petMap.get(p.id).depth;
          const currentB = partner.depth;
          const maxD = Math.max(currentA, currentB);
          if (currentA !== maxD) {
            petMap.get(p.id).depth = maxD;
            changed = true;
          }
          if (currentB !== maxD) {
            partner.depth = maxD;
            changed = true;
          }
        }
      });
    }

    // Group into levels
    const levelsMap = new Map();
    petMap.forEach(node => {
      if (!levelsMap.has(node.depth)) {
        levelsMap.set(node.depth, []);
      }
      levelsMap.get(node.depth).push(node);
    });

    const sortedLevels = Array.from(levelsMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([levelIndex, levelPets]) => {
        const processed = new Set();
        const groups = [];

        levelPets.forEach(p => {
          if (processed.has(p.id)) return;
          processed.add(p.id);

          const partner = getPartner(p.id);
          if (partner && partner.depth === levelIndex && !processed.has(partner.id)) {
            processed.add(partner.id);
            groups.push({
              type: 'couple',
              primary: p,
              partner: partner
            });
          } else {
            groups.push({
              type: 'single',
              pet: p
            });
          }
        });

        return {
          levelIndex,
          groups
        };
      });

    return sortedLevels;
  }, [pets]);

  const renderPetCircle = (pet) => {
    const photoSrc = pet.avatar || pet.photo;
    const isDeceased = pet.status === 'deceased';
    return (
      <div 
        key={pet.id}
        onClick={() => onSelectPet && onSelectPet(pet)}
        className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
      >
        <div className="relative">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 shadow-md bg-slate-100 transition-all ${
            isDeceased 
              ? 'border-amber-300 ring-2 ring-sky-100 group-hover:border-amber-400' 
              : 'border-paw-300 group-hover:border-paw-500'
          }`}>
            {photoSrc ? (
              <img src={photoSrc} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-paw-50 text-paw-400">
                <FontAwesomeIcon icon={faPaw} className="text-xl sm:text-2xl" />
              </div>
            )}
          </div>
        </div>
        <span className="mt-2 text-xs sm:text-sm font-mitr font-medium text-slate-800 text-center max-w-[84px] sm:max-w-[96px] truncate">
          {pet.name}
        </span>
      </div>
    );
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[32px] w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-scaleUp"
      >
        {/* Clean Minimal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-paw-100 flex items-center justify-center text-paw-600 shadow-2xs">
              <FontAwesomeIcon icon={faSitemap} className="text-sm" />
            </div>
            <h2 className="font-mitr font-semibold text-lg text-slate-800">ผังครอบครัว</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Pure Tree Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-gradient-to-b from-white via-paw-50/20 to-slate-50/50">
          {treeLevels.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-sans">
              <FontAwesomeIcon icon={faPaw} className="text-2xl mb-2 opacity-40 block mx-auto" />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {treeLevels.map((lvl, idx) => (
                <div key={lvl.levelIndex} className="w-full flex flex-col items-center relative">
                  
                  {/* Level Nodes */}
                  <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-8">
                    {lvl.groups.map((group, gIdx) => {
                      if (group.type === 'single') {
                        return renderPetCircle(group.pet);
                      }
                      // Couple: 2 circular nodes side-by-side linked by a heart
                      return (
                        <div 
                          key={`couple-${gIdx}`} 
                          className="flex items-center gap-3 sm:gap-4 px-4 py-3 rounded-3xl bg-rose-50/40 border border-rose-200/60 shadow-2xs"
                        >
                          {renderPetCircle(group.primary)}
                          <div className="flex items-center justify-center -mt-5">
                            <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-xs shadow-2xs animate-pulse">
                              <FontAwesomeIcon icon={faHeart} />
                            </div>
                          </div>
                          {renderPetCircle(group.partner)}
                        </div>
                      );
                    })}
                  </div>

                  {/* Architectural Pedigree Connector Line to Next Generation */}
                  {idx < treeLevels.length - 1 && (
                    <div className="flex flex-col items-center w-full my-3">
                      <div className="w-0.5 h-5 bg-paw-300/70 rounded-full" />
                      {treeLevels[idx + 1].groups.length > 1 && (
                        <div className="w-3/5 max-w-[260px] h-0.5 bg-paw-300/60 rounded-full" />
                      )}
                      <div className="w-0.5 h-4 bg-paw-300/70 rounded-full" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
