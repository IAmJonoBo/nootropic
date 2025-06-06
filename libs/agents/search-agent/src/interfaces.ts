// TODO: Implement search agent interfaces
import { SearchResult, DocResult, Location } from './types';

export interface SearchService {
  searchCode(query: string): Promise<SearchResult[]>;
  searchDocs(query: string): Promise<DocResult[]>;
  navigateSymbol(symbol: string): Promise<Location>;
}

export interface SearchConfig {
  maxResults: number;
  minRelevance: number;
  filters: Filter[];
}

export interface Filter {
  field: string;
  value: string;
  operator: FilterOperator;
}

export interface SearchStats {
  totalResults: number;
  searchTime: number;
  hitRate: number;
}

export enum FilterOperator {
  EQUALS = 'EQUALS',
  CONTAINS = 'CONTAINS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN'
} 