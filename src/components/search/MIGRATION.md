# Migration Guide: Global On-Chain State Search

This guide helps you integrate the new search module with the existing Vero Guardian Dashboard.

## Overview

The new `src/components/search/` module provides a more sophisticated, performance-optimized search system that complements the existing `GlobalStateSearch` component.

**Key Differences:**

| Aspect | GlobalStateSearch | New Search Module |
|--------|------------------|-------------------|
| **Scope** | Static demo targets (6 items) | Dynamic contracts & functions |
| **Data** | Hardcoded examples | Your contract metadata |
| **Performance** | Educational | Production-optimized |
| **Indexing** | None | Efficient token-based index |
| **Filtering** | Type badges only | Type filters + search query |
| **Customization** | Limited | Highly extensible |
| **Use Case** | Learning/reference | Real search functionality |

## Integration Scenarios

### Scenario 1: Replace GlobalStateSearch with New Module

If you want to use the new search as a complete replacement:

```typescript
// Before
import GlobalStateSearch from '@/components/GlobalStateSearch/GlobalStateSearch';

export function Dashboard() {
  return <GlobalStateSearch />;
}

// After
import { GlobalSearchPanel } from '@/components/search';
import type { ContractMetadata } from '@/components/search';

export function Dashboard() {
  const contracts: ContractMetadata[] = [
    // Your contract definitions
  ];

  return <GlobalSearchPanel contracts={contracts} />;
}
```

### Scenario 2: Use Both Components

Keep GlobalStateSearch as a reference and add the new search module:

```typescript
import GlobalStateSearch from '@/components/GlobalStateSearch/GlobalStateSearch';
import { GlobalSearchPanel } from '@/components/search';

export function Dashboard() {
  const myContracts: ContractMetadata[] = [
    // Your actual deployed contracts
  ];

  return (
    <div className="space-y-8">
      {/* Reference: How on-chain state works */}
      <section>
        <h2>On-Chain State Reference</h2>
        <GlobalStateSearch />
      </section>

      {/* Production: Search your contracts */}
      <section>
        <h2>Search Deployed Contracts</h2>
        <GlobalSearchPanel contracts={myContracts} />
      </section>
    </div>
  );
}
```

### Scenario 3: Integrate with On-Chain Data

Load contracts from on-chain and populate the search index:

```typescript
import { useChainState } from '@/hooks/useChainState';
import { useOnChainCache } from '@/hooks/useOnChainCache';
import { GlobalSearchPanel } from '@/components/search';
import type { ContractMetadata } from '@/components/search';

export function DashboardWithLiveSearch() {
  const { syncVersion } = useChainState({
    cacheKeys: ['deployed-contracts'],
  });

  const { data: deployedContracts, isLoading } = useOnChainCache({
    cacheKey: 'deployed-contracts',
    fetcher: async () => {
      // Fetch from your contract client
      return fetchDeployedContracts();
    },
    revalidateOnMount: true,
  });

  // Transform on-chain data to search format
  const searchableContracts: ContractMetadata[] = useMemo(() => {
    return (deployedContracts || []).map((contract) => ({
      id: contract.id,
      address: contract.address,
      name: contract.name,
      description: contract.description,
      type: contract.type as any,
      tags: contract.tags || [],
      functions: (contract.functions || []).map((f) => ({
        id: f.id,
        name: f.name,
        description: f.description,
        tags: f.tags || [],
      })),
    }));
  }, [deployedContracts]);

  return (
    <GlobalSearchPanel
      contracts={searchableContracts}
      showStats={true}
      showFilters={true}
    />
  );
}
```

## Using the Hook in Existing Components

If you have custom components, use the `useSearchIndex` hook:

```typescript
import { useSearchIndex } from '@/components/search';

export function MyCustomSearchUI() {
  const { search, addContracts, contracts } = useSearchIndex({
    initialContracts: [],
    storageKey: 'my-search-index',
  });

  const [query, setQuery] = useState('');
  const results = useMemo(() => search(query), [query, search]);

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div>Found {results.length} matches</div>
      {/* Your custom result display */}
    </div>
  );
}
```

## Converting GlobalStateSearch Targets

If you want to convert the existing GlobalStateSearch targets to use the new search module:

```typescript
import { DEFAULT_ON_CHAIN_SEARCH_TARGETS } from '@/components/GlobalStateSearch/GlobalStateSearch';
import type { ContractMetadata } from '@/components/search';

// Convert static targets to dynamic contracts
const convertedContracts: ContractMetadata[] = DEFAULT_ON_CHAIN_SEARCH_TARGETS.map(
  (target) => ({
    id: target.id,
    address: target.account, // Note: account becomes address
    name: target.label,
    description: target.description,
    type: target.type,
    tags: target.tags,
    functions: [
      {
        id: target.functionId,
        name: target.functionId,
        description: `Function: ${target.functionId}`,
        tags: ['on-chain-state'],
      },
    ],
  })
);

// Use in GlobalSearchPanel
<GlobalSearchPanel contracts={convertedContracts} />
```

## Updating Imports

### Old imports (still work):

```typescript
// GlobalStateSearch
import GlobalStateSearch from '@/components/GlobalStateSearch/GlobalStateSearch';
import { searchOnChainTargets } from '@/components/GlobalStateSearch/GlobalStateSearch';
```

### New imports:

```typescript
// New search module
import {
  GlobalSearchPanel,
  SearchInput,
  SearchResults,
  useSearchIndex,
  // Types
  type ContractMetadata,
  type ContractFunction,
  type SearchOptions,
  type RankedSearchResult,
  // Utilities
  fuzzyMatch,
  buildIndex,
  validateIndex,
} from '@/components/search';
```

## Data Structure Mapping

Convert your existing data to `ContractMetadata`:

```typescript
interface YourContract {
  id: string;
  address: string;
  name: string;
  description: string;
  type: 'task' | 'vote' | 'reputation' | 'governance' | 'network';
  functions?: Array<{
    name: string;
    description?: string;
    tags?: string[];
  }>;
}

const contract: YourContract = {
  id: 'my-contract',
  address: 'CA123456',
  name: 'My Contract',
  description: 'My contract description',
  type: 'task',
  functions: [
    {
      name: 'execute',
      description: 'Execute contract',
      tags: ['write'],
    },
  ],
};

// Convert to ContractMetadata
const searchableContract: ContractMetadata = {
  id: contract.id,
  address: contract.address,
  name: contract.name,
  description: contract.description,
  type: contract.type,
  tags: [], // Add relevant tags
  functions: (contract.functions || []).map((f, idx) => ({
    id: `${contract.id}-${idx}`,
    name: f.name,
    description: f.description || '',
    tags: f.tags || [],
  })),
};
```

## Feature Comparison

### GlobalStateSearch Features

- ✅ Educational display of on-chain state targets
- ✅ Token-based fuzzy matching
- ✅ Type badges with color coding
- ✅ Fixed set of 6 search targets
- ✅ Internationalization support

### New Search Module Features

- ✅ All GlobalStateSearch features +
- ✅ Dynamic contract indexing
- ✅ Function-level search
- ✅ Performance-optimized index
- ✅ localStorage persistence
- ✅ Type filtering UI
- ✅ Score visualization
- ✅ Result ranking
- ✅ Custom search options
- ✅ Advanced API for developers
- ✅ 360+ unit tests

## Performance Considerations

### SearchIndex Hook Optimization

```typescript
// Good: Debounce is automatic
const { search } = useSearchIndex({ debounceMs: 300 });

// Good: Search results are memoized
const results = useMemo(() => search(query), [query, search]);

// Avoid: Searching on every render
const badResults = search(query); // Don't do this!
```

### localStorage Management

```typescript
// Contracts are automatically persisted
const { contracts } = useSearchIndex({
  storageKey: 'my-contracts', // Persistent key
});

// Monitor storage size
const storedSize = localStorage.getItem('my-contracts')?.length || 0;
console.log('Storage used:', storedSize, 'bytes');

// Clear if needed
localStorage.removeItem('my-contracts');
```

## Testing Your Integration

### Test the search with mock data:

```typescript
import { buildIndex, searchIndex } from '@/components/search';

const mockContracts = [/* your test contracts */];
const index = buildIndex(mockContracts);
const results = searchIndex('test query', index);

expect(results.length).toBeGreaterThan(0);
expect(results[0].score).toBeGreaterThan(0);
```

### Test the component:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalSearchPanel } from '@/components/search';

test('should search contracts', async () => {
  const contracts = [/* your test data */];
  render(<GlobalSearchPanel contracts={contracts} />);

  const input = screen.getByPlaceholderText(/search/i);
  await userEvent.type(input, 'task');

  const results = await screen.findAllByRole('button');
  expect(results.length).toBeGreaterThan(0);
});
```

## Troubleshooting

### Search returns no results

1. Check contract structure:
```typescript
const validation = validateIndex(buildIndex(contracts));
if (!validation.valid) {
  console.warn('Invalid index:', validation.errors);
}
```

2. Verify search query:
```typescript
const results = search('test', { minScore: 0 }); // Lower minimum
```

### Performance is slow

1. Reduce number of contracts:
```typescript
const contracts = allContracts.slice(0, 100);
```

2. Increase debounce time:
```typescript
const { search } = useSearchIndex({ debounceMs: 500 });
```

3. Filter by type:
```typescript
const results = search('test', { typeFilter: ['task'] });
```

### localStorage quota exceeded

1. Clear old data:
```typescript
localStorage.removeItem('search-index-contracts');
```

2. Disable persistence:
```typescript
const { search } = useSearchIndex({
  storageKey: '', // Empty = no persistence
});
```

## Next Steps

1. **Review** the [README.md](./README.md) for detailed API documentation
2. **Check** [EXAMPLES.tsx](./EXAMPLES.tsx) for code samples
3. **Run** tests: `npm test -- src/components/search/__tests__`
4. **Integrate** with your dashboard following the scenarios above
5. **Customize** colors, sizes, and behavior as needed

## Support

- 📖 Full documentation in [README.md](./README.md)
- 💻 Code examples in [EXAMPLES.tsx](./EXAMPLES.tsx)
- 🧪 Test patterns in `__tests__/`
- ✅ Implementation details in [IMPLEMENTATION.md](./IMPLEMENTATION.md)

---

**Last Updated**: June 23, 2026
