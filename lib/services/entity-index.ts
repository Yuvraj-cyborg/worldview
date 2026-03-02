import { ENTITIES, type EntityEntry, type EntityType } from "@/lib/data/entities";

export interface EntityMatch {
  entityId: string;
  matchedText: string;
  matchType: "alias" | "keyword" | "name";
  confidence: number;
  position: number;
}

export interface EntityIndex {
  byId: Map<string, EntityEntry>;
  byAlias: Map<string, string>;
  byKeyword: Map<string, string[]>;
  byType: Map<EntityType, EntityEntry[]>;
}

let cachedIndex: EntityIndex | null = null;

export function buildEntityIndex(entities: EntityEntry[]): EntityIndex {
  const byId = new Map<string, EntityEntry>();
  const byAlias = new Map<string, string>();
  const byKeyword = new Map<string, string[]>();
  const byType = new Map<EntityType, EntityEntry[]>();

  for (const entity of entities) {
    byId.set(entity.id, entity);

    for (const alias of entity.aliases) {
      byAlias.set(alias.toLowerCase(), entity.id);
    }
    byAlias.set(entity.name.toLowerCase(), entity.id);

    for (const kw of entity.keywords) {
      const existing = byKeyword.get(kw.toLowerCase()) ?? [];
      existing.push(entity.id);
      byKeyword.set(kw.toLowerCase(), existing);
    }

    const typeList = byType.get(entity.type) ?? [];
    typeList.push(entity);
    byType.set(entity.type, typeList);
  }

  return { byId, byAlias, byKeyword, byType };
}

export function getEntityIndex(): EntityIndex {
  if (!cachedIndex) {
    cachedIndex = buildEntityIndex(ENTITIES);
  }
  return cachedIndex;
}

export function findEntitiesInText(text: string): EntityMatch[] {
  const index = getEntityIndex();
  const lower = text.toLowerCase();
  const matches: EntityMatch[] = [];
  const seen = new Set<string>();

  for (const [alias, entityId] of index.byAlias) {
    if (seen.has(entityId)) continue;
    const pos = lower.indexOf(alias);
    if (pos !== -1) {
      seen.add(entityId);
      matches.push({
        entityId,
        matchedText: text.slice(pos, pos + alias.length),
        matchType: "alias",
        confidence: alias.length > 3 ? 0.9 : 0.7,
        position: pos,
      });
    }
  }

  for (const [keyword, entityIds] of index.byKeyword) {
    const pos = lower.indexOf(keyword);
    if (pos === -1) continue;
    for (const entityId of entityIds) {
      if (seen.has(entityId)) continue;
      seen.add(entityId);
      matches.push({
        entityId,
        matchedText: text.slice(pos, pos + keyword.length),
        matchType: "keyword",
        confidence: keyword.length > 4 ? 0.8 : 0.6,
        position: pos,
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

export function getEntityDisplayName(entityId: string): string {
  const index = getEntityIndex();
  return index.byId.get(entityId)?.name ?? entityId;
}

export function findRelatedEntities(entityId: string): EntityEntry[] {
  const index = getEntityIndex();
  const entity = index.byId.get(entityId);
  if (!entity?.related) return [];
  return entity.related
    .map((id) => index.byId.get(id))
    .filter((e): e is EntityEntry => e !== undefined);
}
