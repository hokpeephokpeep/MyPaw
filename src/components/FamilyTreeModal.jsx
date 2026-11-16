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
      // Normalize relationships vs relations
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

    // Calculate depths: Start with roots (pets without parents)
    // First pass: depth from parents
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
    // e.g. ตังค์ทอน (depth 1, daughter of ชายน้อย) + ไข่ต้ม (depth 0, no parents recorded) -> ไข่ต้ม becomes depth 1
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
        // Group pairs of partners together in each level
        const processed = new Set();
        const groups = [];

        levelPets.forEach(p => {
          if (processed.has(p.id)) return;
          processed.add(p.id);

          const partner = getPartner(p.id);
          if (partner && partner.depth === levelIndex && !processed.has(partner.id)) {
            processed.add(partner.id);
            // Put male on left or female on left consistently
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

        let title = 'รุ่นที่ 1 (บรรพบุรุษ)';
        if (levelIndex === 1) title = 'รุ่นที่ 2 (รุ่นพ่อแม่)';
        else if (levelIndex === 2) title = 'รุ่นที่ 3 (รุ่นลูก)';
        else if (levelIndex > 2) title = `รุ่นที่ ${levelIndex + 1} (รุ่นหลาน)`;

        return {
          levelIndex,
          title,
          groups
        };
      });

    return sortedLevels;
  }, [pets]);

  const renderPetCircle = (pet) => {
    const photoSrc = pet.avatar || pet.photo;
    return (
      <div 
        key={pet.id}
        onClick={() => onSelectPet && onSelectPet(pet)}
        className="flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
      >
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-paw-300 shadow-md bg-slate-100 group-hover:border-paw-500 group-hover:shadow-lg transition-all">
            {photoSrc ? (
              <img src={photoSrc} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                <FontAwesomeIcon icon={faPaw} className="text-xl sm:text-2xl" />
              </div>
            )}
          </div>
        </div>
        <span className="mt-2 text-xs sm:text-sm font-mitr font-medium text-slate-800 text-center max-w-[80px] sm:max-w-[90px] truncate">
          {pet.name}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-paw-50 flex items-center justify-center text-paw-500">
              <FontAwesomeIcon icon={faSitemap} className="text-lg" />
            </div>
            <div>
              <h2 className="font-mitr font-semibold text-base sm:text-lg text-slate-800">ผังครอบครัว</h2>
              <p className="text-xs text-slate-500 font-sans">สายสัมพันธ์ทางสายเลือดและคู่ครอง</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Tree Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 bg-gradient-to-b from-white to-slate-50/50">
          {treeLevels.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm font-sans">
              ไม่มีข้อมูลสัตว์เลี้ยง
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 sm:gap-8">
              {treeLevels.map((lvl, idx) => (
                <div key={lvl.levelIndex} className="w-full flex flex-col items-center relative">
                  {/* Level Generation Badge */}
                  <div className="mb-3">
                    <span className="text-[11px] font-sans font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shadow-xs">
                      {lvl.title}
                    </span>
                  </div>

                  {/* Level Nodes */}
                  <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
                    {lvl.groups.map((group, gIdx) => {
                      if (group.type === 'single') {
                        return renderPetCircle(group.pet);
                      }
                      // Couple: 2 circular nodes side-by-side with heart
                      return (
                        <div key={`couple-${gIdx}`} className="flex items-center gap-2 sm:gap-3 p-2 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
                          {renderPetCircle(group.primary)}
                          <div className="flex flex-col items-center justify-center px-1">
                            <span className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-xs shadow-xs">
                              <FontAwesomeIcon icon={faHeart} />
                            </span>
                            <span className="text-[10px] text-rose-500 font-sans mt-0.5 font-medium">คู่กัน</span>
                          </div>
                          {renderPetCircle(group.partner)}
                        </div>
                      );
                    })}
                  </div>

                  {/* Connecting Line to next generation */}
                  {idx < treeLevels.length - 1 && (
                    <div className="w-0.5 h-6 sm:h-8 bg-slate-300 mt-5 sm:mt-6"></div>
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
