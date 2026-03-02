import type { ClusteredEvent } from "@/lib/types";
import { findEntitiesInText, getEntityDisplayName, findRelatedEntities } from "./entity-index";

export interface ExtractedEntity {
  entityId: string;
  name: string;
  matchedText: string;
  matchType: "alias" | "keyword" | "name";
  confidence: number;
}

export interface NewsEntityContext {
  clusterId: string;
  title: string;
  entities: ExtractedEntity[];
  primaryEntity?: string;
  relatedEntityIds: string[];
}

export function extractEntitiesFromTitle(title: string): ExtractedEntity[] {
  const matches = findEntitiesInText(title);
  return matches.map((m) => ({
    entityId: m.entityId,
    name: getEntityDisplayName(m.entityId),
    matchedText: m.matchedText,
    matchType: m.matchType,
    confidence: m.confidence,
  }));
}

export function extractEntitiesFromCluster(cluster: ClusteredEvent): NewsEntityContext {
  const primaryEntities = extractEntitiesFromTitle(cluster.primaryTitle);
  const entityMap = new Map<string, ExtractedEntity>();

  for (const entity of primaryEntities) {
    if (!entityMap.has(entity.entityId)) {
      entityMap.set(entity.entityId, entity);
    }
  }

  if (cluster.allItems?.length > 1) {
    for (const item of cluster.allItems.slice(0, 5)) {
      const itemEntities = extractEntitiesFromTitle(item.title);
      for (const entity of itemEntities) {
        if (!entityMap.has(entity.entityId)) {
          entity.confidence *= 0.9;
          entityMap.set(entity.entityId, entity);
        }
      }
    }
  }

  const entities = Array.from(entityMap.values()).sort((a, b) => b.confidence - a.confidence);
  const primaryEntity = entities[0]?.entityId;

  const relatedEntityIds = new Set<string>();
  for (const entity of entities) {
    for (const rel of findRelatedEntities(entity.entityId)) {
      relatedEntityIds.add(rel.id);
    }
  }

  return {
    clusterId: cluster.id,
    title: cluster.primaryTitle,
    entities,
    primaryEntity,
    relatedEntityIds: Array.from(relatedEntityIds),
  };
}

export function extractEntitiesFromClusters(
  clusters: ClusteredEvent[]
): Map<string, NewsEntityContext> {
  const contextMap = new Map<string, NewsEntityContext>();
  for (const cluster of clusters) {
    contextMap.set(cluster.id, extractEntitiesFromCluster(cluster));
  }
  return contextMap;
}

export function getTopEntitiesFromNews(
  newsContexts: Map<string, NewsEntityContext>,
  limit = 10
): Array<{ entityId: string; name: string; mentionCount: number; avgConfidence: number }> {
  const stats = new Map<string, { count: number; totalConf: number }>();

  for (const ctx of newsContexts.values()) {
    for (const entity of ctx.entities) {
      const s = stats.get(entity.entityId) ?? { count: 0, totalConf: 0 };
      s.count++;
      s.totalConf += entity.confidence;
      stats.set(entity.entityId, s);
    }
  }

  return Array.from(stats.entries())
    .map(([entityId, s]) => ({
      entityId,
      name: getEntityDisplayName(entityId),
      mentionCount: s.count,
      avgConfidence: s.totalConf / s.count,
    }))
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, limit);
}
