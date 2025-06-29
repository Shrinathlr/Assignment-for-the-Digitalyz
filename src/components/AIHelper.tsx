import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

interface AIRecommendation {
  id: string;
  type: 'validation' | 'cleaning' | 'transformation' | 'analysis';
  title: string;
  description: string;
  confidence: number;
  suggestedAction: string;
  impact: 'high' | 'medium' | 'low';
}

interface AIHelperProps {
  data: unknown[];
  title: string;
  onRecommendationApply?: (recommendation: AIRecommendation) => void;
}

const AIHelper: React.FC<AIHelperProps> = ({
  data,
  title,
  onRecommendationApply
}) => {
  const [query, setQuery] = useState('');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze data and generate AI recommendations
  const analyzeData = async () => {
    if (!data || data.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate AI analysis with basic data insights
      const newRecommendations: AIRecommendation[] = [];
      
      if (data.length > 0) {
        const sampleRow = data[0] as Record<string, unknown>;
        const fields = Object.keys(sampleRow);

        // Analyze each field for potential issues
        fields.forEach((field, index) => {
          const values = data.map(row => (row as Record<string, unknown>)[field as string]).filter(val => val !== null && val !== undefined);
          const uniqueValues = new Set(values);
          const emptyCount = values.filter(val => val === '' || val === null || val === undefined).length;
          const totalCount = values.length;

          // Generate recommendations based on data patterns
          if (emptyCount > 0) {
            newRecommendations.push({
              id: `rec-${index}-empty`,
              type: 'cleaning',
              title: `Missing Values in ${field}`,
              description: `${emptyCount} out of ${totalCount} records have empty values in the ${field} field.`,
              confidence: 0.95,
              suggestedAction: `Consider filling missing values or flagging records with empty ${field}.`,
              impact: emptyCount > totalCount * 0.1 ? 'high' : 'medium'
            });
          }

          if (uniqueValues.size < totalCount * 0.1 && totalCount > 10) {
            newRecommendations.push({
              id: `rec-${index}-duplicate`,
              type: 'analysis',
              title: `Low Diversity in ${field}`,
              description: `${field} has only ${uniqueValues.size} unique values out of ${totalCount} records.`,
              confidence: 0.85,
              suggestedAction: `Review ${field} for potential data quality issues or categorization needs.`,
              impact: 'medium'
            });
          }

          // Check for potential email validation
          if (field.toLowerCase().includes('email')) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const invalidEmails = values.filter(val => val && !emailPattern.test(String(val)));
            if (invalidEmails.length > 0) {
              newRecommendations.push({
                id: `rec-${index}-email`,
                type: 'validation',
                title: `Invalid Email Format in ${field}`,
                description: `${invalidEmails.length} records have invalid email formats in ${field}.`,
                confidence: 0.9,
                suggestedAction: `Validate and correct email formats in ${field}.`,
                impact: 'high'
              });
            }
          }

          // Check for potential phone validation
          if (field.toLowerCase().includes('phone') || field.toLowerCase().includes('mobile')) {
            const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
            const invalidPhones = values.filter(val => val && !phonePattern.test(String(val).replace(/\s/g, '')));
            if (invalidPhones.length > 0) {
              newRecommendations.push({
                id: `rec-${index}-phone`,
                type: 'validation',
                title: `Invalid Phone Format in ${field}`,
                description: `${invalidPhones.length} records have invalid phone formats in ${field}.`,
                confidence: 0.85,
                suggestedAction: `Validate and standardize phone number formats in ${field}.`,
                impact: 'medium'
              });
            }
          }
        });

        // General data quality recommendations
        if (data.length > 100) {
          newRecommendations.push({
            id: 'rec-general-quality',
            type: 'analysis',
            title: 'Large Dataset Detected',
            description: `Dataset contains ${data.length} records. Consider batch processing for better performance.`,
            confidence: 0.8,
            suggestedAction: 'Implement pagination or batch processing for large datasets.',
            impact: 'medium'
          });
        }
      }

      setRecommendations(newRecommendations);

    } catch (err) {
      setError('AI analysis failed. Please try again.');
      console.error('AI analysis error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const askAI = async () => {
    if (!query.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Simulate AI response based on query
      const lowerQuery = query.toLowerCase();
      const newRecommendations: AIRecommendation[] = [];

      if (lowerQuery.includes('clean') || lowerQuery.includes('fix')) {
        newRecommendations.push({
          id: `query-${Date.now()}`,
          type: 'cleaning',
          title: 'Data Cleaning Recommendation',
          description: `Based on your query about cleaning, I recommend reviewing missing values and duplicate records.`,
          confidence: 0.75,
          suggestedAction: 'Run data validation and cleaning procedures.',
          impact: 'high'
        });
      } else if (lowerQuery.includes('validate') || lowerQuery.includes('check')) {
        newRecommendations.push({
          id: `query-${Date.now()}`,
          type: 'validation',
          title: 'Data Validation Recommendation',
          description: `I'll help you validate your data. Let me analyze the structure and content.`,
          confidence: 0.8,
          suggestedAction: 'Apply validation rules to ensure data quality.',
          impact: 'high'
        });
      } else if (lowerQuery.includes('transform') || lowerQuery.includes('convert')) {
        newRecommendations.push({
          id: `query-${Date.now()}`,
          type: 'transformation',
          title: 'Data Transformation Suggestion',
          description: `I can help you transform your data. What specific changes are you looking for?`,
          confidence: 0.7,
          suggestedAction: 'Define transformation rules based on your requirements.',
          impact: 'medium'
        });
      } else {
        newRecommendations.push({
          id: `query-${Date.now()}`,
          type: 'analysis',
          title: 'General Data Analysis',
          description: `I understand you're asking about: "${query}". Let me analyze your data to provide specific recommendations.`,
          confidence: 0.6,
          suggestedAction: 'Review the data structure and apply appropriate processing rules.',
          impact: 'medium'
        });
      }

      setRecommendations(prev => [...prev, ...newRecommendations]);
      setQuery('');

    } catch (err) {
      setError('AI query failed. Please try again.');
      console.error('AI query error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const applyRecommendation = (recommendation: AIRecommendation) => {
    onRecommendationApply?.(recommendation);
    // Remove the applied recommendation
    setRecommendations(prev => prev.filter(rec => rec.id !== recommendation.id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'validation': return 'error';
      case 'cleaning': return 'warning';
      case 'transformation': return 'info';
      case 'analysis': return 'primary';
      default: return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No {title} data to analyze
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title} AI Assistant
        </Typography>

        {/* AI Query Interface */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Ask AI for Help
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Ask about data cleaning, validation, transformation, or analysis..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isProcessing}
              size="small"
            />
            <Button
              variant="contained"
              onClick={askAI}
              disabled={isProcessing || !query.trim()}
            >
              {isProcessing ? 'Processing...' : 'Ask AI'}
            </Button>
          </Box>
          <Button
            variant="outlined"
            onClick={analyzeData}
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Analyzing...' : 'Auto-Analyze Data'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              AI Recommendations ({recommendations.length})
            </Typography>
            
            {recommendations.map((recommendation) => (
              <Accordion key={recommendation.id} sx={{ mb: 1 }}>
                <AccordionSummary>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>
                      {recommendation.title}
                    </Typography>
                    <Chip 
                      label={recommendation.type} 
                      size="small" 
                      color={getTypeColor(recommendation.type)}
                      variant="outlined"
                    />
                    <Chip 
                      label={`${Math.round(recommendation.confidence * 100)}%`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={recommendation.impact} 
                      size="small" 
                      color={getImpactColor(recommendation.impact)}
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {recommendation.description}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>Suggested Action:</strong> {recommendation.suggestedAction}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => applyRecommendation(recommendation)}
                    >
                      Apply Recommendation
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {recommendations.length === 0 && !isProcessing && (
          <Alert severity="info">
            No AI recommendations yet. Use &quot;Auto-Analyze Data&quot; or ask a specific question to get started.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AIHelper;
