/**
 * Global On-Chain State Search Types
 * Defines the structure for indexed contracts, functions, and search results
 */

export interface ContractFunction {
  id: string;
  name: string;
  description: string;
  params?: string[];
  returns?: string;
  tags: string[];
}

export interface ContractMetadata {
  id: string;
  address: string;
  name: string;
  description: string;
  type: 'task' | 'vote' | 'reputation' | 'governance' | 'network' | 'custom';
  functions: ContractFunction[];
  tags: string[];
  deployedAt?: number;
  network?: string;
}

export interface SearchIndex {
  version: number;
  generatedAt: number;
  contracts: ContractMetadata[];
  tokenMap: Map<string, Set<string>>;
}

export interface SearchResult {
  contract: ContractMetadata;
  function?: ContractFunction;
  score: number;
  matchType: 'contract' | 'function' | 'description' | 'tag';
  highlightedText: string;
}

export interface RankedSearchResult extends SearchResult {
  rank: number;
}

export interface IndexerOptions {
  maxResults?: number;
  minScore?: number;
  tokenWeights?: Record<string, number>;
}

export interface SearchOptions {
  maxResults?: number;
  minScore?: number;
  searchFields?: ('contract' | 'function' | 'description' | 'tags')[];
  typeFilter?: ContractMetadata['type'][];
}
