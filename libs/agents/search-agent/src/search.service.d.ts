import { SearchService } from "./interfaces";
import { SearchResult, DocResult, Location } from "./types";
export declare class SearchServiceImpl implements SearchService {
  searchCode(query: string): Promise<SearchResult[]>;
  searchDocs(query: string): Promise<DocResult[]>;
  navigateSymbol(symbol: string): Promise<Location>;
}
