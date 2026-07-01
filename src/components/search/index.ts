/**
 * Global On-Chain State Search Module
 * Main entry point for all search functionality
 */

export type {
  ContractFunction,
  ContractMetadata,
  SearchIndex,
  SearchResult,
  RankedSearchResult,
  IndexerOptions,
  SearchOptions,
} from './types';

// Indexer exports
export {
  createEmptyIndex,
  buildIndex,
  buildTokenMap,
  searchIndex,
  getTokenSuggestions,
  getContractsByType,
  getContractTypes,
  validateIndex,
} from './indexer';

// Fuzzy search exports
export {
  normalizeText,
  tokenize,
  levenshteinDistance,
  tokenSimilarity,
  fuzzyMatchToken,
  fuzzyMatch,
  positionWeightedMatch,
  multiFieldFuzzyMatch,
} from './fuzzySearch';

// Hook exports
export { useSearchIndex } from './useSearchIndex';
export type { UseSearchIndexOptions, UseSearchIndexState } from './useSearchIndex';

// Component exports
export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

export { SearchResults } from './SearchResults';
export type { SearchResultsProps } from './SearchResults';

export { GlobalSearchPanel } from './GlobalSearchPanel';
export type { GlobalSearchPanelProps } from './GlobalSearchPanel';
