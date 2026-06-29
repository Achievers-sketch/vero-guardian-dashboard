# Global On-Chain State Search

A high-performance, production-ready search system for discovering and indexing contracts and functions in the Vero Guardian Dashboard.

## Features

✨ **Core Features:**
- ⚡ **Instant Search** - Find contracts and functions instantly with fuzzy matching
- 🔍 **Fuzzy Matching** - Intelligent token-based search algorithm
- 📑 **Smart Indexing** - Efficient in-memory index with token mapping
- 💾 **Local Persistence** - Contracts indexed and cached in localStorage
- 🏷️ **Type Filtering** - Filter search results by contract type
- ♿ **Accessible** - Full WCAG compliance with keyboard navigation
- 📱 **Responsive** - Mobile-friendly design with dark mode support

## Installation

The search module is built-in to the dashboard. Import from the search component:

```typescript
import { GlobalSearchPanel, useSearchIndex } from '@/components/search';
```

## Quick Start

### Basic Usage

```typescript
import { GlobalSearchPanel } from '@/components/search';
import type { ContractMetadata } from '@/components/search';

const contracts: ContractMetadata[] = [
  {
    id: 'task-registry',
    address: 'CBXYZ123',
    name: 'Task Registry',
    description: 'Manages PR tracking and task registration',
    type: 'task',
    tags: ['registry', 'github', 'tasks'],
    functions: [
      {
        id: 'register-task',
        name: 'registerTask',
        description: 'Register a new task from GitHub PR',
        tags: ['write', 'transaction'],
      },
    ],
  },
];

export default function Dashboard() {
  return (
    <GlobalSearchPanel
      contracts={contracts}
      onResultClick={(result) => {
        console.log('Selected:', result);
      }}
    />
  );
}
```

### Using the Hook

```typescript
import { useSearchIndex } from '@/components/search';

export function SearchContainer() {
  const { search, addContracts, contracts } = useSearchIndex({
    initialContracts: [],
    storageKey: 'my-search-index',
  });

  const results = search('task registry', { maxResults: 5 });

  return (
    <div>
      <p>Indexed contracts: {contracts.length}</p>
      <p>Search results: {results.length}</p>
    </div>
  );
}
```

## API Reference

### Types

#### `ContractMetadata`

```typescript
interface ContractMetadata {
  id: string; // Unique identifier
  address: string; // Contract address
  name: string; // Display name
  description: string; // Human-readable description
  type: 'task' | 'vote' | 'reputation' | 'governance' | 'network' | 'custom';
  functions: ContractFunction[];
  tags: string[]; // Search tags
  deployedAt?: number; // Deployment timestamp
  network?: string; // Network identifier
}
```

#### `ContractFunction`

```typescript
interface ContractFunction {
  id: string;
  name: string;
  description: string;
  params?: string[]; // Parameter names
  returns?: string; // Return type
  tags: string[];
}
```

#### `SearchOptions`

```typescript
interface SearchOptions {
  maxResults?: number; // Default: 10
  minScore?: number; // Default: 20 (0-100)
  searchFields?: ('contract' | 'function' | 'description' | 'tags')[];
  typeFilter?: ContractMetadata['type'][]; // Filter by type
}
```

#### `RankedSearchResult`

```typescript
interface RankedSearchResult {
  contract: ContractMetadata;
  function?: ContractFunction; // Present if function match
  score: number; // Match score (0-100)
  matchType: 'contract' | 'function' | 'description' | 'tag';
  highlightedText: string;
  rank: number; // Result position
}
```

### Components

#### `GlobalSearchPanel`

Main search interface component.

**Props:**

```typescript
interface GlobalSearchPanelProps {
  contracts?: ContractMetadata[];
  onResultClick?: (result: RankedSearchResult) => void;
  showFilters?: boolean; // Default: true
  showStats?: boolean; // Default: true
  maxResults?: number; // Default: 10
  minScore?: number; // Default: 20
  debounceMs?: number; // Default: 300
  placeholder?: string;
  storageKey?: string; // Default: 'search-index-contracts'
}
```

**Example:**

```typescript
<GlobalSearchPanel
  contracts={contracts}
  showFilters={true}
  showStats={true}
  maxResults={15}
  minScore={25}
  onResultClick={(result) => {
    if (result.function) {
      navigateToFunction(result.function.id);
    } else {
      navigateToContract(result.contract.id);
    }
  }}
/>
```

#### `SearchInput`

Input field with loading and error states.

**Props:**

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  error?: Error | null;
  disabled?: boolean;
  autoFocus?: boolean;
  ariaLabel?: string;
}
```

#### `SearchResults`

Results display component with ranking and scoring.

**Props:**

```typescript
interface SearchResultsProps {
  results: RankedSearchResult[];
  isLoading?: boolean;
  isEmpty?: boolean;
  onResultClick?: (result: RankedSearchResult) => void;
  maxHeight?: string;
  showRank?: boolean;
}
```

### Hooks

#### `useSearchIndex`

Manages search index state and operations.

```typescript
const {
  index,
  isLoading,
  error,
  contracts,
  search,
  addContracts,
  removeContracts,
  updateContracts,
  clearIndex,
  reloadIndex,
} = useSearchIndex(options);
```

**Options:**

```typescript
interface UseSearchIndexOptions {
  initialContracts?: ContractMetadata[];
  storageKey?: string; // Default: 'search-index-contracts'
  debounceMs?: number; // Default: 300
}
```

**Returns:**

```typescript
interface UseSearchIndexState {
  index: SearchIndex | null;
  isLoading: boolean;
  error: Error | null;
  contracts: ContractMetadata[];
  search: (query: string, options?: SearchOptions) => RankedSearchResult[];
  addContracts: (contracts: ContractMetadata[]) => void;
  removeContracts: (contractIds: string[]) => void;
  updateContracts: (contracts: ContractMetadata[]) => void;
  clearIndex: () => void;
  reloadIndex: () => void;
}
```

### Utility Functions

#### Indexing

```typescript
import {
  buildIndex,
  searchIndex,
  validateIndex,
  getContractsByType,
  getContractTypes,
} from '@/components/search';

// Build index from contracts
const index = buildIndex(contracts);

// Search the index
const results = searchIndex('task', index, { maxResults: 10 });

// Validate index integrity
const validation = validateIndex(index);
if (!validation.valid) {
  console.warn('Index errors:', validation.errors);
}

// Get contracts by type
const taskContracts = getContractsByType('task', index);

// Get all unique types
const types = getContractTypes(index); // ['task', 'vote', 'reputation', ...]
```

#### Fuzzy Search

```typescript
import {
  fuzzyMatch,
  tokenize,
  normalizeText,
  multiFieldFuzzyMatch,
} from '@/components/search';

// Normalize text
const normalized = normalizeText('Hello_World-Test'); // 'hello world test'

// Tokenize
const tokens = tokenize('hello world'); // ['hello', 'world']

// Fuzzy match strings
const score = fuzzyMatch('helo', 'hello'); // ~85

// Multi-field match with weighting
const fieldScore = multiFieldFuzzyMatch('task', {
  name: 'Task Registry',
  description: 'Task management system',
  tags: 'task,registry',
});
```

## Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|-----------------|-------|
| Build Index | O(n*m) | n = contracts, m = avg functions |
| Search | O(n) | Full scan with fuzzy matching |
| Token Lookup | O(1) | Hash table lookup |
| Add Contract | O(1) | Amortized |
| Type Filter | O(n) | Single pass filter |

**Optimization:**
- Contracts cached in localStorage (async load)
- Debounced index rebuilds (default 300ms)
- Token map for O(1) prefix lookups
- Lazy component rendering with React.memo

## Search Algorithm

### Fuzzy Matching Scoring

Scores range from 0-100:

1. **Exact Match**: 100 points
2. **Starts With**: 85 points  
3. **Contains Substring**: 70 points
4. **Fuzzy Subsequence**: 20-60 points (based on distance)
5. **No Match**: 0 points

### Position Weighting

Matches at the beginning of text receive a 1.3x boost. Early matches (within 30% of text) receive a 1.15x boost.

### Multi-Field Matching

Default field weights:
- name/label: 1.5x
- description: 1.0x
- tags: 0.8x

## Examples

### Search Specific Contract Type

```typescript
const { search } = useSearchIndex({ initialContracts: contracts });

// Search only in vote contracts
const voteResults = search('consensus', {
  typeFilter: ['vote', 'governance'],
  maxResults: 5,
});
```

### Update Contracts

```typescript
const { updateContracts, addContracts, removeContracts } = useSearchIndex();

// Update a contract
updateContracts([{ ...existingContract, name: 'New Name' }]);

// Add new contracts
addContracts([newContract1, newContract2]);

// Remove contracts
removeContracts(['contract-id-1', 'contract-id-2']);
```

### Integrate with On-Chain State

```typescript
import { useChainState } from '@/hooks/useChainState';
import { useOnChainCache } from '@/hooks/useOnChainCache';
import { GlobalSearchPanel } from '@/components/search';

export function DashboardWithSearch() {
  const { syncVersion } = useChainState();
  const { data: contracts } = useOnChainCache({
    cacheKey: 'contracts',
    fetcher: async () => fetchDeployedContracts(),
  });

  return <GlobalSearchPanel contracts={contracts || []} />;
}
```

## Accessibility

The search module is fully accessible:

- ♿ Semantic HTML with proper ARIA labels
- ⌨️ Keyboard navigation support
- 🎯 Focus management
- 📢 Live region updates for results
- 🌙 Dark mode support
- 📱 Touch-friendly targets (min 44x44px)

## Testing

Run tests:

```bash
npm test -- src/components/search/__tests__
```

Test coverage includes:
- ✅ Fuzzy search algorithms
- ✅ Index building and validation
- ✅ Hook state management
- ✅ Component rendering
- ✅ Integration scenarios

## Performance Tips

1. **Limit Initial Contracts**: Load contracts lazily
2. **Debounce Queries**: Adjust `debounceMs` for your use case
3. **Persist Strategically**: Only persist when index changes significantly
4. **Use Type Filters**: Narrow search scope with type filtering
5. **Monitor Score Thresholds**: Adjust `minScore` to reduce noise

## Troubleshooting

### Search Returns No Results

```typescript
// Check if index is built
const { index, contracts } = useSearchIndex();
console.log('Index exists:', index !== null);
console.log('Contracts indexed:', contracts.length);

// Verify contract structure
contracts.forEach(c => {
  if (!c.id || !c.name) console.warn('Invalid contract:', c);
});
```

### Performance Issues

```typescript
// Increase debounce time
const { search } = useSearchIndex({ debounceMs: 500 });

// Reduce search scope
const results = search(query, { 
  maxResults: 5,
  typeFilter: ['task'],
});
```

### localStorage Quota Exceeded

```typescript
// Clear old search data
localStorage.removeItem('search-index-contracts');

// Or limit contract persistence
const { clearIndex } = useSearchIndex({ 
  storageKey: null // Disable persistence
});
```

## Contributing

To extend the search module:

1. **Add New Score Algorithm**: Modify `fuzzySearch.ts`
2. **Add New Field Types**: Update `ContractMetadata` type
3. **Add Custom Filters**: Extend `SearchOptions`
4. **Optimize Performance**: Profile with DevTools

## License

MIT
