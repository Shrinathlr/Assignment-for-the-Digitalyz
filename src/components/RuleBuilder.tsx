import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  Divider
} from '@mui/material';

interface Rule {
  id: string;
  name: string;
  description: string;
  field: string;
  operator: string;
  value: string;
  action: string;
  priority: number;
  isActive: boolean;
}

interface RuleBuilderProps {
  data: any[];
  title: string;
  onRulesChange?: (rules: Rule[]) => void;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  data,
  title,
  onRulesChange
}) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState<Partial<Rule>>({
    name: '',
    description: '',
    field: '',
    operator: 'equals',
    value: '',
    action: 'flag',
    priority: 1,
    isActive: true
  });
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Available fields from data
  const availableFields = data && data.length > 0 ? Object.keys(data[0]) : [];

  // Operators for different data types
  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Not Contains' },
    { value: 'starts_with', label: 'Starts With' },
    { value: 'ends_with', label: 'Ends With' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'is_empty', label: 'Is Empty' },
    { value: 'is_not_empty', label: 'Is Not Empty' }
  ];

  // Actions
  const actions = [
    { value: 'flag', label: 'Flag for Review' },
    { value: 'auto_correct', label: 'Auto Correct' },
    { value: 'reject', label: 'Reject Record' },
    { value: 'highlight', label: 'Highlight' },
    { value: 'transform', label: 'Transform Value' }
  ];

  // Process natural language input to create rules
  const processNaturalLanguage = async () => {
    if (!naturalLanguageInput.trim()) return;

    setIsProcessing(true);
    
    try {
      // Simple natural language processing
      const input = naturalLanguageInput.toLowerCase();
      const newRules: Rule[] = [];

      // Extract field names
      const fieldMatches = availableFields.filter(field => 
        input.includes(field.toLowerCase())
      );

      // Extract operators
      const operatorMap: Record<string, string> = {
        'must be': 'equals',
        'should be': 'equals',
        'cannot be': 'not_equals',
        'must contain': 'contains',
        'cannot contain': 'not_contains',
        'must start with': 'starts_with',
        'must end with': 'ends_with',
        'must be greater than': 'greater_than',
        'must be less than': 'less_than',
        'cannot be empty': 'is_not_empty',
        'must be empty': 'is_empty'
      };

      let detectedOperator = 'equals';
      for (const [phrase, operator] of Object.entries(operatorMap)) {
        if (input.includes(phrase)) {
          detectedOperator = operator;
          break;
        }
      }

      // Extract values (simple approach)
      const valueMatch = input.match(/"([^"]+)"/);
      const value = valueMatch ? valueMatch[1] : '';

      // Create rules for each detected field
      fieldMatches.forEach((field, index) => {
        newRules.push({
          id: Date.now().toString() + index,
          name: `Rule ${rules.length + index + 1}`,
          description: naturalLanguageInput,
          field,
          operator: detectedOperator,
          value,
          action: 'flag',
          priority: rules.length + index + 1,
          isActive: true
        });
      });

      // Add the new rules
      const updatedRules = [...rules, ...newRules];
      setRules(updatedRules);
      onRulesChange?.(updatedRules);
      
      // Clear input
      setNaturalLanguageInput('');
      
    } catch (error) {
      console.error('Error processing natural language:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const addRule = () => {
    if (!newRule.name || !newRule.field) return;

    const rule: Rule = {
      id: Date.now().toString(),
      name: newRule.name,
      description: newRule.description || '',
      field: newRule.field,
      operator: newRule.operator || 'equals',
      value: newRule.value || '',
      action: newRule.action || 'flag',
      priority: newRule.priority || 1,
      isActive: newRule.isActive !== false
    };

    const updatedRules = [...rules, rule];
    setRules(updatedRules);
    onRulesChange?.(updatedRules);

    // Reset form
    setNewRule({
      name: '',
      description: '',
      field: '',
      operator: 'equals',
      value: '',
      action: 'flag',
      priority: rules.length + 1,
      isActive: true
    });
  };

  const deleteRule = (id: string) => {
    const updatedRules = rules.filter(rule => rule.id !== id);
    setRules(updatedRules);
    onRulesChange?.(updatedRules);
  };

  const toggleRule = (id: string) => {
    const updatedRules = rules.map(rule => 
      rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
    );
    setRules(updatedRules);
    onRulesChange?.(updatedRules);
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No {title} data to create rules for
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title} Rule Builder
        </Typography>

        {/* Natural Language Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Natural Language Rule Creation
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="e.g., 'Email field must contain @ symbol' or 'Phone numbers cannot be empty'"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              disabled={isProcessing}
              size="small"
            />
            <Button
              variant="contained"
              onClick={processNaturalLanguage}
              disabled={isProcessing || !naturalLanguageInput.trim()}
            >
              {isProcessing ? 'Processing...' : 'Create Rule'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Manual Rule Creation */}
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Manual Rule Creation
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Rule Name"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Field</InputLabel>
              <Select
                value={newRule.field}
                onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                label="Field"
              >
                {availableFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Operator</InputLabel>
              <Select
                value={newRule.operator}
                onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                label="Operator"
              >
                {operators.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Value"
              value={newRule.value}
              onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
              size="small"
            />
            <FormControl fullWidth size="small">
              <InputLabel>Action</InputLabel>
              <Select
                value={newRule.action}
                onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                label="Action"
              >
                {actions.map((action) => (
                  <MenuItem key={action.value} value={action.value}>
                    {action.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <TextField
            fullWidth
            label="Description (Optional)"
            value={newRule.description}
            onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
            size="small"
          />
          
          <Button
            variant="contained"
            onClick={addRule}
            disabled={!newRule.name || !newRule.field}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Rule
          </Button>
        </Box>

        {/* Rules List */}
        {rules.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Active Rules ({rules.filter(r => r.isActive).length}/{rules.length})
            </Typography>
            <List dense>
              {rules.map((rule) => (
                <Box key={rule.id}>
                  <ListItem>
                    <span style={{ width: '100%' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Typography component="span" variant="subtitle2">
                          {rule.name}
                        </Typography>
                        <Chip label={rule.isActive ? 'Active' : 'Inactive'} size="small" color={rule.isActive ? 'success' : 'default'} variant="outlined" />
                        <Chip label={`Priority: ${rule.priority}`} size="small" variant="outlined" />
                      </span>
                      <Typography component="span" variant="body2" color="text.secondary">
                        {rule.description || `${rule.field} ${rule.operator} "${rule.value}" → ${rule.action}`}
                      </Typography>
                      <span style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                        <Chip label={rule.field} size="small" variant="outlined" />
                        <Chip label={rule.operator} size="small" variant="outlined" />
                        <Chip label={rule.action} size="small" variant="outlined" />
                      </span>
                    </span>
                    <Box>
                      <Button
                        size="small"
                        onClick={() => toggleRule(rule.id)}
                        variant="outlined"
                        sx={{ mr: 1 }}
                      >
                        {rule.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => deleteRule(rule.id)}
                        color="error"
                        variant="outlined"
                      >
                        Delete
                      </Button>
                    </Box>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          </Box>
        )}

        {rules.length === 0 && (
          <Alert severity="info">
            No rules created yet. Use natural language or manual creation to add rules.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default RuleBuilder;
