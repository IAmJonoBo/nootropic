// TODO: Implement search service
import { Injectable } from '@nestjs/common';
import { SearchService } from './interfaces';
import { SearchResult, DocResult, Location } from './types';

@Injectable()
export class SearchServiceImpl implements SearchService {
  async searchCode(query: string): Promise<SearchResult[]> {
    // TODO: Implement code search logic
    throw new Error('Method not implemented.');
  }

  async searchDocs(query: string): Promise<DocResult[]> {
    // TODO: Implement documentation search logic
    throw new Error('Method not implemented.');
  }

  async navigateSymbol(symbol: string): Promise<Location> {
    // TODO: Implement symbol navigation logic
    throw new Error('Method not implemented.');
  }
} 