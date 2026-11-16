/**
 * 🌳 Kinship & Multi-Generation Relationship Inference Engine
 * คำนวณสายสัมพันธ์อัตโนมัติหลายรุ่น:
 * - พ่อ แม่ / ลูก
 * - ปู่ ย่า ตา ยาย / หลาน
 * - ทวด / เหลน
 * - ลุง ป้า น้า อา / หลาน
 * - ลูกพี่ลูกน้อง (Cousins)
 * - แฟน (Partners)
 * - ฝาแฝด (Twins) / พี่น้อง (Siblings)
 * - เพื่อนสนิท (Besties)
 */
import { parseLocalDate } from './utils';

export function resolveAllKinships(allPets = []) {
  const petMap = new Map(allPets.map(p => [p.id, p]));

  // Direct Parent-Child Graph
  const parentsOf = new Map();
  const childrenOf = new Map();

  allPets.forEach(p => {
    parentsOf.set(p.id, new Set());
    childrenOf.set(p.id, new Set());
  });

  // Populate direct biological connections from pet.relationships
  allPets.forEach(p => {
    (p.relationships || []).forEach(rel => {
      if (rel.type === 'parent') {
        parentsOf.get(p.id)?.add(rel.targetPetId);
        childrenOf.get(rel.targetPetId)?.add(p.id);
      } else if (rel.type === 'child') {
        childrenOf.get(p.id)?.add(rel.targetPetId);
        parentsOf.get(rel.targetPetId)?.add(p.id);
      }
    });
  });

  // Helper: compare age between two pets (returns <0 if p1 is older, >0 if p1 is younger, 0 if same birthDate)
  const compareAge = (p1, p2) => {
    const d1 = parseLocalDate(p1?.birthDate);
    const d2 = parseLocalDate(p2?.birthDate);
    if (!d1 || !d2) return 0;
    return d1.getTime() - d2.getTime();
  };

  // Helper to get sibling label based on relative birthDate & gender
  const getSiblingLabel = (selfPet, targetPet) => {
    const isFemale = targetPet?.gender === 'female';
    const diff = compareAge(targetPet, selfPet);
    if (diff === 0) {
      return 'ฝาแฝด';
    }
    if (diff < 0) {
      // target was born earlier -> older sibling (พี่)
      return isFemale ? 'พี่สาว' : 'พี่ชาย';
    }
    // target was born later -> younger sibling (น้อง)
    return isFemale ? 'น้องสาว' : 'น้องชาย';
  };

  // Helper to get ancestral depth & path
  // Returns Map<ancestorId, { depth, firstParentId }>
  const getAncestors = (petId) => {
    const ancestors = new Map();
    const queue = [[petId, 0, null]];
    const visited = new Set([petId]);

    while (queue.length > 0) {
      const [currId, depth, firstParent] = queue.shift();
      const directParents = parentsOf.get(currId) || new Set();
      
      for (const parentId of directParents) {
        if (!visited.has(parentId)) {
          visited.add(parentId);
          const rootParent = depth === 0 ? parentId : firstParent;
          ancestors.set(parentId, { depth: depth + 1, viaParentId: rootParent });
          queue.push([parentId, depth + 1, rootParent]);
        }
      }
    }
    return ancestors;
  };

  // Helper to get descendants
  // Returns Map<descendantId, generationDistance>
  const getDescendants = (petId) => {
    const descendants = new Map();
    const queue = [[petId, 0]];
    const visited = new Set([petId]);

    while (queue.length > 0) {
      const [currId, depth] = queue.shift();
      const directChildren = childrenOf.get(currId) || new Set();

      for (const childId of directChildren) {
        if (!visited.has(childId)) {
          visited.add(childId);
          descendants.set(childId, depth + 1);
          queue.push([childId, depth + 1]);
        }
      }
    }
    return descendants;
  };

  // Build resolved relationships list for every pet
  const resolvedMap = new Map();
  allPets.forEach(p => resolvedMap.set(p.id, new Map()));

  allPets.forEach(pet => {
    const petId = pet.id;
    const petTargetMap = resolvedMap.get(petId);

    // 1. Explicit Direct Relations from user input (twin, partner, bestie, sibling)
    (pet.relationships || []).forEach(rel => {
      const target = petMap.get(rel.targetPetId);
      if (!target) return;

      let label = rel.label;

      if (rel.type === 'partner') {
        label = 'แฟน';
      } else if (rel.type === 'twin') {
        label = 'ฝาแฝด';
      } else if (rel.type === 'bestie') {
        label = 'เพื่อนซี้';
      } else if (rel.type === 'sibling') {
        label = getSiblingLabel(pet, target);
      }

      if (['partner', 'twin', 'bestie', 'sibling'].includes(rel.type)) {
        petTargetMap.set(target.id, {
          targetId: target.id,
          type: rel.type,
          label: label || 'เพื่อนซี้',
          category: rel.type
        });
      }
    });

    // 2. Ancestors (พ่อ แม่ ปู่ ย่า ตา ยาย ทวด)
    const ancestors = getAncestors(petId);
    ancestors.forEach(({ depth: gen, viaParentId }, ancId) => {
      const ancestor = petMap.get(ancId);
      if (!ancestor) return;
      const isFemale = ancestor.gender === 'female';
      const viaParent = petMap.get(viaParentId);
      const isMaternal = viaParent?.gender === 'female';

      let type = 'ancestor';
      let label = 'บรรพบุรุษ';
      let category = 'family';

      if (gen === 1) {
        type = 'parent';
        label = isFemale ? 'แม่' : 'พ่อ';
        category = 'parent';
      } else if (gen === 2) {
        type = 'grandparent';
        if (isMaternal) {
          label = isFemale ? 'ยาย' : 'ตา';
        } else {
          label = isFemale ? 'ย่า' : 'ปู่';
        }
        category = 'grandparent';
      } else if (gen === 3) {
        type = 'great_grandparent';
        label = isFemale ? 'ย่าทวด/ยายทวด' : 'ปู่ทวด/ตาทวด';
        category = 'great_grandparent';
      } else if (gen >= 4) {
        type = 'great_great_grandparent';
        label = 'เทียด';
        category = 'great_grandparent';
      }

      petTargetMap.set(ancId, {
        targetId: ancId,
        type,
        label,
        category,
        gen
      });
    });

    // 3. Descendants (ลูก หลาน เหลน ลื่อ)
    const descendants = getDescendants(petId);
    descendants.forEach((gen, descId) => {
      const descendant = petMap.get(descId);
      if (!descendant) return;
      const isFemale = descendant.gender === 'female';

      let type = 'descendant';
      let label = 'ทายาท';
      let category = 'family';

      if (gen === 1) {
        type = 'child';
        label = isFemale ? 'ลูกสาว' : 'ลูกชาย';
        category = 'child';
      } else if (gen === 2) {
        type = 'grandchild';
        label = isFemale ? 'หลานสาว' : 'หลานชาย';
        category = 'grandchild';
      } else if (gen === 3) {
        type = 'great_grandchild';
        label = isFemale ? 'เหลนสาว' : 'เหลนชาย';
        category = 'great_grandchild';
      } else if (gen >= 4) {
        type = 'great_great_grandchild';
        label = 'ลื่อ';
        category = 'great_grandchild';
      }

      petTargetMap.set(descId, {
        targetId: descId,
        type,
        label,
        category,
        gen
      });
    });
  });

  // 4. Infer Siblings via shared parents (ถ้ามีพ่อหรือแม่คนเดียวกัน -> เป็นพี่น้อง/แฝดกันอัตโนมัติ)
  allPets.forEach(p1 => {
    const parents1 = parentsOf.get(p1.id) || new Set();
    if (parents1.size === 0) return;

    allPets.forEach(p2 => {
      if (p1.id === p2.id) return;
      const p1Map = resolvedMap.get(p1.id);
      if (p1Map.has(p2.id)) return;

      const parents2 = parentsOf.get(p2.id) || new Set();
      const shared = [...parents1].some(parentId => parents2.has(parentId));
      if (shared) {
        const diff = compareAge(p2, p1);
        const relType = diff === 0 ? 'twin' : 'sibling';
        p1Map.set(p2.id, {
          targetId: p2.id,
          type: relType,
          label: getSiblingLabel(p1, p2),
          category: relType
        });
      }
    });
  });

  // 5. Infer Uncles/Aunts (ลุง ป้า น้า อา) & Nephews/Nieces (หลาน)
  allPets.forEach(pet => {
    const petParents = parentsOf.get(pet.id) || new Set();
    const petTargetMap = resolvedMap.get(pet.id);

    petParents.forEach(parentId => {
      const parent = petMap.get(parentId);
      if (!parent) return;
      const parentRels = resolvedMap.get(parentId);
      if (!parentRels) return;

      parentRels.forEach(rel => {
        if (rel.type === 'sibling' || rel.type === 'twin') {
          const uncleAunt = petMap.get(rel.targetId);
          if (!uncleAunt || petTargetMap.has(uncleAunt.id)) return;

          const isOlderThanParent = compareAge(uncleAunt, parent) <= 0;
          const isFemale = uncleAunt.gender === 'female';
          const isMaternal = parent.gender === 'female';

          let label = 'น้า';
          if (isOlderThanParent) {
            label = isFemale ? 'ป้า' : 'ลุง';
          } else {
            label = isMaternal ? 'น้า' : 'อา';
          }

          petTargetMap.set(uncleAunt.id, {
            targetId: uncleAunt.id,
            type: 'uncle_aunt',
            label,
            category: 'family'
          });

          // Reverse for uncle/aunt -> nephew/niece
          const uaMap = resolvedMap.get(uncleAunt.id);
          if (uaMap && !uaMap.has(pet.id)) {
            uaMap.set(pet.id, {
              targetId: pet.id,
              type: 'nephew_niece',
              label: pet.gender === 'female' ? 'หลานสาว' : 'หลานชาย',
              category: 'family'
            });
          }
        }
      });
    });
  });

  // Convert resolvedMap back to friendly array structure for each pet
  const finalPets = allPets.map(pet => {
    const rels = Array.from(resolvedMap.get(pet.id)?.values() || []).map(r => ({
      targetPetId: r.targetId,
      type: r.type,
      label: r.label,
      category: r.category
    }));

    return {
      ...pet,
      resolvedRelationships: rels
    };
  });

  return finalPets;
}
