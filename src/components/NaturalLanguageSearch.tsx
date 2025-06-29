import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';

interface SearchResult {
  rowIndex: number;
  row: any;
  score: number;
  matchedFields: string[];
  highlight: string;
}

interface NaturalLanguageSearchProps {
  data: any[];
  title: string;
  onSearchResults?: (results: SearchResult[]) => void;
}

const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({
  data,
  title,
  onSearchResults
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simple natural language query processing
  const processQuery = (query: string): { keywords: string[], filters: Record<string, string> } => {
    const lowerQuery = query.toLowerCase();
    const keywords: string[] = [];
    const filters: Record<string, string> = {};

    // Extract keywords (words that aren't operators)
    const words = query.split(/\s+/).filter(word => word.length > 0);
    
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2) {
        keywords.push(cleanWord);
      }
    });

    // Extract simple filters (field:value patterns)
    const filterRegex = /(\w+):\s*([^\s]+)/g;
    let match;
    while ((match = filterRegex.exec(query)) !== null) {
      filters[match[1]] = match[2];
    }

    return { keywords, filters };
  };

  // Search through data using natural language processing
  const searchData = useCallback(async () => {
    if (!query.trim() || !data || data.length === 0) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { keywords, filters } = processQuery(query);
      const searchResults: SearchResult[] = [];

      data.forEach((row, index) => {
        let score = 0;
        const matchedFields: string[] = [];
        let highlight = '';

        // Check each field in the row
        Object.entries(row).forEach(([field, value]) => {
          const fieldValue = String(value).toLowerCase();
          
          // Apply filters
          if (filters[field] && fieldValue.includes(filters[field].toLowerCase())) {
            score += 10;
            matchedFields.push(field);
            highlight += `${field}: ${value} `;
          }

          // Check keywords
          keywords.forEach(keyword => {
            if (fieldValue.includes(keyword)) {
              score += 5;
              if (!matchedFields.includes(field)) {
                matchedFields.push(field);
              }
              highlight += `${field}: ${value} `;
            }
          });

          // Exact matches get higher scores
          if (fieldValue === query.toLowerCase()) {
            score += 20;
            if (!matchedFields.includes(field)) {
              matchedFields.push(field);
            }
            highlight += `${field}: ${value} `;
          }
        });

        // Add to results if score > 0
        if (score > 0) {
          searchResults.push({
            rowIndex: index + 1,
            row,
            score,
            matchedFields,
            highlight: highlight.trim()
          });
        }
      });

      // Sort by score (highest first)
      searchResults.sort((a, b) => b.score - a.score);

      setResults(searchResults);
      onSearchResults?.(searchResults);

    } catch (err) {
      setError('Search failed. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [query, data, onSearchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchData();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchData();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No {title} data to search
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title} Natural Language Search
        </Typography>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Search by keywords, field:value, or natural language..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isSearching || !query.trim()}
              startIcon={isSearching ? <CircularProgress size={20} /> : null}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
            {results.length > 0 && (
              <Button
                variant="outlined"
                onClick={clearSearch}
                disabled={isSearching}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {results.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">
                Search Results ({results.length} found)
              </Typography>
              <Chip 
                label={`${data.length} total rows`} 
                size="small" 
                variant="outlined" 
              />
            </Box>
            
            <List dense>
              {results.slice(0, 10).map((result, index) => (
                <Box key={index}>
                  <ListItem>
                    <span style={{ width: '100%' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Typography component="span" variant="subtitle2">
                          Row {result.rowIndex}
                        </Typography>
                        <Chip label={`Score: ${result.score}`} size="small" color="primary" variant="outlined" />
                        <Chip label={`${result.matchedFields.length} fields`} size="small" color="secondary" variant="outlined" />
                      </span>
                      <Typography component="span" variant="body2" color="text.secondary" style={{ marginBottom: 8, display: 'block' }}>
                        {result.highlight}
                      </Typography>
                      <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {result.matchedFields.map((field) => (
                          <Chip key={field} label={field} size="small" variant="outlined" />
                        ))}
                      </span>
                    </span>
                  </ListItem>
                  {index < results.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
            
            {results.length > 10 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Showing first 10 results. Refine your search for more specific results.
              </Typography>
            )}
          </Box>
        )}

        {query && results.length === 0 && !isSearching && !error && (
          <Alert severity="info">
            No results found for "{query}". Try different keywords or check your spelling.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NaturalLanguageSearch;
