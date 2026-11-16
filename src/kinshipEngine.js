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

export function resolveAllKinships(allPets = []) {
  const petMap = new Map(allPets.map(p => [p.id, p]));

  // Direct Parent-Child Graph
  // childId -> Set of parentIds
  const parentsOf = new Map();
  // parentId -> Set of childIds
  const childrenOf = new Map();

  allPets.forEach(p => {
    parentsOf.set(p.id, new Set());
    childrenOf.set(p.id, new Set());
  });

  // Populate direct biological connections from pet.relationships
  allPets.forEach(p => {
    (p.relationships || []).forEach(rel => {
      if (rel.type === 'parent') {
        // rel.targetPetId is parent of p
        parentsOf.get(p.id)?.add(rel.targetPetId);
        childrenOf.get(rel.targetPetId)?.add(p.id);
      } else if (rel.type === 'child') {
        // rel.targetPetId is child of p
        childrenOf.get(p.id)?.add(rel.targetPetId);
        parentsOf.get(rel.targetPetId)?.add(p.id);
      }
    });
  });

  // Helper to get ancestral depth
  // Returns Map<ancestorId, generationDistance> (1=parent, 2=grandparent, 3=great-grandparent...)
  const getAncestors = (petId) => {
    const ancestors = new Map();
    const queue = [[petId, 0]];
    const visited = new Set([petId]);

    while (queue.length > 0) {
      const [currId, depth] = queue.shift();
      const directParents = parentsOf.get(currId) || new Set();
      
      for (const parentId of directParents) {
        if (!visited.has(parentId)) {
          visited.add(parentId);
          ancestors.set(parentId, depth + 1);
          queue.push([parentId, depth + 1]);
        }
      }
    }
    return ancestors;
  };

  // Helper to get descendants
  // Returns Map<descendantId, generationDistance> (1=child, 2=grandchild, 3=great-grandchild...)
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
  // petId -> Map<targetId, { type, label, depth, category }>
  const resolvedMap = new Map();
  allPets.forEach(p => resolvedMap.set(p.id, new Map()));

  allPets.forEach(pet => {
    const petId = pet.id;
    const petTargetMap = resolvedMap.get(petId);

    // 1. Explicit Direct Relations from user input (twin, partner, bestie, sibling)
    (pet.relationships || []).forEach(rel => {
      const target = petMap.get(rel.targetPetId);
      if (!target) return;

      const isTargetFemale = target.gender === 'female';
      let label = rel.label;

      if (rel.type === 'partner') {
        label = isTargetFemale ? 'แฟน (ตัวเมีย)' : 'แฟน (ตัวผู้)';
      } else if (rel.type === 'twin') {
        label = 'ฝาแฝด';
      } else if (rel.type === 'bestie') {
        label = 'เพื่อนสนิท';
      } else if (rel.type === 'sibling') {
        label = isTargetFemale ? 'พี่สาว/น้องสาว' : 'พี่ชาย/น้องชาย';
      }

      if (['partner', 'twin', 'bestie', 'sibling'].includes(rel.type)) {
        petTargetMap.set(target.id, {
          targetId: target.id,
          type: rel.type,
          label: label || 'เพื่อนสนิท',
          category: rel.type
        });
      }
    });

    // 2. Ancestors (Parents, Grandparents, Great-Grandparents / พ่อ แม่ ตา ยาย ปู่ ทวด)
    const ancestors = getAncestors(petId);
    ancestors.forEach((gen, ancId) => {
      const ancestor = petMap.get(ancId);
      if (!ancestor) return;
      const isFemale = ancestor.gender === 'female';

      let type = 'ancestor';
      let label = 'บรรพบุรุษ';
      let category = 'family';

      if (gen === 1) {
        type = 'parent';
        label = isFemale ? 'แม่' : 'พ่อ';
        category = 'parent';
      } else if (gen === 2) {
        type = 'grandparent';
        label = isFemale ? 'ย่า / ยาย' : 'ปู่ / ตา';
        category = 'grandparent';
      } else if (gen === 3) {
        type = 'great_grandparent';
        label = isFemale ? 'ทวดหญิง' : 'ทวดชาย';
        category = 'great_grandparent';
      } else if (gen >= 4) {
        type = 'great_great_grandparent';
        label = 'เทียด / ทวดรุ่นเก่า';
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

    // 3. Descendants (Children, Grandchildren, Great-Grandchildren / ลูก หลาน เหลน ลื่อ)
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
        label = 'ลื่อ / ทายาทรุ่นเหลน';
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

  // 4. Infer Siblings via shared parents (ถ้ามีพ่อหรือแม่คนเดียวกัน -> เป็นพี่น้องกันอัตโนมัติ)
  allPets.forEach(p1 => {
    const parents1 = parentsOf.get(p1.id) || new Set();
    if (parents1.size === 0) return;

    allPets.forEach(p2 => {
      if (p1.id === p2.id) return;
      const p1Map = resolvedMap.get(p1.id);
      if (p1Map.has(p2.id)) return; // already defined

      const parents2 = parentsOf.get(p2.id) || new Set();
      // Check intersection
      const shared = [...parents1].some(parentId => parents2.has(parentId));
      if (shared) {
        const isP2Female = p2.gender === 'female';
        p1Map.set(p2.id, {
          targetId: p2.id,
          type: 'sibling',
          label: isP2Female ? 'พี่สาว/น้องสาว (พ่อแม่เดียวกัน)' : 'พี่ชาย/น้องชาย (พ่อแม่เดียวกัน)',
          category: 'sibling'
        });
      }
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
