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
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface DataModification {
  id: string;
  command: string;
  operation: 'update' | 'delete' | 'add' | 'replace' | 'transform';
  field: string;
  condition: string;
  newValue: string;
  affectedRows: number[];
  status: 'pending' | 'applied' | 'failed';
  timestamp: Date;
}

interface NaturalLanguageDataModifierProps {
  data: unknown[];
  title: string;
  onDataChange?: (newData: unknown[]) => void;
}

// Move normalization and availableFields outside parseCommand
const normalize = (str: string) => str.replace(/\s|_/g, '').toLowerCase();

const NaturalLanguageDataModifier: React.FC<NaturalLanguageDataModifierProps> = ({
  data,
  title,
  onDataChange
}) => {
  const [command, setCommand] = useState('');
  const [modifications, setModifications] = useState<DataModification[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Available fields from data
  const availableFields = data && data.length > 0 ? Object.keys(data[0] as Record<string, unknown>) : [];

  // Updated parseCommand to accept setError and availableFields
  const parseCommand = (command: string, setError?: (msg: string) => void): Partial<DataModification> | null => {
    const lowerCommand = command.toLowerCase();
    let operation: DataModification['operation'] = 'update';
    let newValue = '';

    // Recognize transform operations
    const transformMatch = lowerCommand.match(/to (uppercase|lowercase|capitalize|trim|reverse|length|wordcount)/);
    if (transformMatch) {
      operation = 'transform';
      newValue = transformMatch[1];
    } else if (lowerCommand.includes('delete') || lowerCommand.includes('remove')) {
      operation = 'delete';
    } else if (lowerCommand.includes('add') || lowerCommand.includes('insert')) {
      operation = 'add';
    } else if (lowerCommand.includes('replace') || lowerCommand.includes('swap')) {
      operation = 'replace';
    } else if (lowerCommand.includes('transform') || lowerCommand.includes('convert')) {
      operation = 'transform';
      const tMatch = lowerCommand.match(/transform.*to (\w+)/);
      if (tMatch) newValue = tMatch[1];
    }

    // Flexible field matching: ignore spaces, underscores, and case
    const normalizedCommand = normalize(lowerCommand);
    let matchedField = '';
    for (const field of availableFields) {
      if (normalizedCommand.includes(normalize(field as string))) {
        matchedField = field as string;
        break;
      }
    }

    // Extract conditions (where clauses)
    const whereMatch = lowerCommand.match(/where\s+(\w+)\s*(=|>|<|contains|starts with|ends with)\s*["']?([^"']+)["']?/i);
    const condition = whereMatch ? `${whereMatch[1]} ${whereMatch[2]} ${whereMatch[3]}` : '';

    // Extract new values for update/replace
    if (!newValue && (operation === 'update' || operation === 'replace')) {
      const toMatch = lowerCommand.match(/to\s+["']?([^"']+)["']?/i);
      const withMatch = lowerCommand.match(/with\s+["']?([^"']+)["']?/i);
      const setMatch = lowerCommand.match(/set\s+["']?([^"']+)["']?/i);
      newValue = toMatch?.[1] || withMatch?.[1] || setMatch?.[1] || '';
    }

    // Extract row numbers
    const rowMatches = lowerCommand.match(/row\s+(\d+)/gi);
    const rowNumbers = rowMatches?.map(match => 
      parseInt(match.replace(/row\s+/i, ''))
    ) || [];

    // If no field matched, return null and helpful error
    if (!matchedField) {
      if (setError) {
        setError(`Could not find a matching field. Available fields: ${availableFields.join(', ')}`);
      }
      return null;
    }

    return {
      operation,
      field: matchedField,
      condition,
      newValue,
      affectedRows: rowNumbers
    };
  };

  // Apply modification to data
  const applyModification = (modification: DataModification): unknown[] => {
    const newData = [...data];
    
    try {
      switch (modification.operation) {
        case 'update':
          return newData.map((row, index) => {
            if (modification.affectedRows.includes(index + 1) || 
                (modification.condition && evaluateCondition(row as Record<string, unknown>, modification.condition))) {
              return { ...(row as Record<string, unknown>), [modification.field]: modification.newValue };
            }
            return row;
          });

        case 'delete':
          return newData.filter((row, index) => {
            if (modification.affectedRows.includes(index + 1) || 
                (modification.condition && evaluateCondition(row as Record<string, unknown>, modification.condition))) {
              return false;
            }
            return true;
          });

        case 'add':
          const newRow: Record<string, unknown> = {};
          availableFields.forEach(field => {
            newRow[field] = field === modification.field ? modification.newValue : '';
          });
          return [...newData, newRow];

        case 'replace':
          return newData.map((row, index) => {
            if (modification.affectedRows.includes(index + 1) || 
                (modification.condition && evaluateCondition(row as Record<string, unknown>, modification.condition))) {
              const oldValue = (row as Record<string, unknown>)[modification.field];
              const newValue = String(oldValue).replace(
                new RegExp(modification.condition.split(' ')[2], 'gi'), 
                modification.newValue
              );
              return { ...(row as Record<string, unknown>), [modification.field]: newValue };
            }
            return row;
          });

        case 'transform':
          return newData.map((row, index) => {
            if (modification.affectedRows.includes(index + 1) || 
                (modification.condition && evaluateCondition(row as Record<string, unknown>, modification.condition))) {
              const transformedValue = transformValue((row as Record<string, unknown>)[modification.field], modification.newValue);
              return { ...(row as Record<string, unknown>), [modification.field]: transformedValue };
            }
            return row;
          });

        default:
          return newData;
      }
    } catch {
      setModifications(prev => prev.map(mod => 
        mod.id === modification.id 
          ? { ...mod, status: 'failed' as const }
          : mod
      ));
    }
    return newData;
  };

  // Evaluate condition for filtering rows
  const evaluateCondition = (row: Record<string, unknown>, condition: string): boolean => {
    if (!condition) return true;
    
    const parts = condition.split(' ');
    const field = parts[0];
    const operator = parts[1];
    const value = parts[2];
    
    const fieldValue = String((row as Record<string, unknown>)[field] || '').toLowerCase();
    const compareValue = value.toLowerCase();
    
    switch (operator) {
      case '=':
        return fieldValue === compareValue;
      case '>':
        return parseFloat(fieldValue) > parseFloat(compareValue);
      case '<':
        return parseFloat(fieldValue) < parseFloat(compareValue);
      case 'contains':
        return fieldValue.includes(compareValue);
      case 'starts':
        return fieldValue.startsWith(compareValue);
      case 'ends':
        return fieldValue.endsWith(compareValue);
      default:
        return false;
    }
  };

  // Transform values based on transformation type
  const transformValue = (value: unknown, transformType: string): unknown => {
    const stringValue = String(value);
    
    switch (transformType.toLowerCase()) {
      case 'uppercase':
        return stringValue.toUpperCase();
      case 'lowercase':
        return stringValue.toLowerCase();
      case 'capitalize':
        return stringValue.charAt(0).toUpperCase() + stringValue.slice(1).toLowerCase();
      case 'trim':
        return stringValue.trim();
      case 'reverse':
        return stringValue.split('').reverse().join('');
      case 'length':
        return stringValue.length;
      case 'wordcount':
        return stringValue.split(/\s+/).filter(word => word.length > 0).length;
      default:
        return value;
    }
  };

  // Update processCommand to pass setError
  const processCommand = async () => {
    if (!command.trim() || !data || data.length === 0) return;

    setIsProcessing(true);

    try {
      const parsed = parseCommand(command);
      if (!parsed || !parsed.field) {
        // setError is already called in parseCommand
        return;
      }

      const modification: DataModification = {
        id: Date.now().toString(),
        command,
        operation: parsed.operation || 'update',
        field: parsed.field,
        condition: parsed.condition || '',
        newValue: parsed.newValue || '',
        affectedRows: parsed.affectedRows || [],
        status: 'pending',
        timestamp: new Date()
      };

      // Preview the changes
      if (previewMode) {
        const affectedRows = data.map((row, index) => {
          if (modification.affectedRows.includes(index + 1) || 
              (modification.condition && evaluateCondition(row as Record<string, unknown>, modification.condition))) {
            return index + 1;
          }
          return null;
        }).filter(row => row !== null);

        modification.affectedRows = affectedRows as number[];
      }

      setModifications(prev => [modification, ...prev]);
      setCommand('');

    } catch (err) {
      console.error('Command processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Apply a modification
  const applyModificationToData = (modification: DataModification) => {
    try {
      const newData = applyModification(modification);
      onDataChange?.(newData);
      
      // Update modification status
      setModifications(prev => prev.map(mod => 
        mod.id === modification.id 
          ? { ...mod, status: 'applied' as const }
          : mod
      ));
    } catch {
      setModifications(prev => prev.map(mod => 
        mod.id === modification.id 
          ? { ...mod, status: 'failed' as const }
          : mod
      ));
    }
  };

  // Get operation color
  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'update': return 'primary';
      case 'delete': return 'error';
      case 'add': return 'success';
      case 'replace': return 'warning';
      case 'transform': return 'info';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No {title} data to modify
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title} Natural Language Data Modifier
        </Typography>

        {/* Command Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Natural Language Commands
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              placeholder="e.g., 'Update email field to uppercase where name contains John' or 'Delete row 5' or 'Add new row with name John'"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              disabled={isProcessing}
              size="small"
            />
            <Button
              variant="contained"
              onClick={processCommand}
              disabled={isProcessing || !command.trim()}
            >
              {isProcessing ? 'Processing...' : 'Process Command'}
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Preview Mode</InputLabel>
              <Select
                value={previewMode ? 'preview' : 'direct'}
                onChange={(e) => setPreviewMode(e.target.value === 'preview')}
                label="Preview Mode"
              >
                <MenuItem value="direct">Direct Apply</MenuItem>
                <MenuItem value="preview">Preview First</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Example Commands */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Example Commands
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              label="Update email to uppercase" 
              size="small" 
              variant="outlined"
              onClick={() => setCommand('Update email field to uppercase')}
            />
            <Chip 
              label="Delete row 5" 
              size="small" 
              variant="outlined"
              onClick={() => setCommand('Delete row 5')}
            />
            <Chip 
              label="Add new row" 
              size="small" 
              variant="outlined"
              onClick={() => setCommand('Add new row with name John')}
            />
            <Chip 
              label="Replace text" 
              size="small" 
              variant="outlined"
              onClick={() => setCommand('Replace old with new in name field')}
            />
            <Chip 
              label="Transform to uppercase" 
              size="small" 
              variant="outlined"
              onClick={() => setCommand('Transform name field to uppercase')}
            />
          </Box>
        </Box>

        {/* Modifications History */}
        {modifications.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Modification History ({modifications.length})
            </Typography>
            
            {modifications.map((modification) => (
              <Accordion key={modification.id} sx={{ mb: 1 }}>
                <AccordionSummary>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ flex: 1 }}>
                      {modification.command}
                    </Typography>
                    <Chip 
                      label={modification.operation} 
                      size="small" 
                      color={getOperationColor(modification.operation)}
                      variant="outlined"
                    />
                    <Chip 
                      label={modification.status} 
                      size="small" 
                      color={getStatusColor(modification.status)}
                      variant="outlined"
                    />
                    <Chip 
                      label={`${modification.affectedRows.length} rows`} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      <strong>Field:</strong> {modification.field}<br/>
                      <strong>Condition:</strong> {modification.condition || 'None'}<br/>
                      <strong>New Value:</strong> {modification.newValue || 'N/A'}<br/>
                      <strong>Affected Rows:</strong> {modification.affectedRows.join(', ') || 'None'}<br/>
                      <strong>Timestamp:</strong> {modification.timestamp.toLocaleString()}
                    </Typography>
                    
                    {modification.status === 'pending' && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => applyModificationToData(modification)}
                      >
                        Apply Modification
                      </Button>
                    )}
                    
                    {modification.status === 'applied' && (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        Modification applied successfully!
                      </Alert>
                    )}
                    
                    {modification.status === 'failed' && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        Failed to apply modification.
                      </Alert>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {modifications.length === 0 && !isProcessing && (
          <Alert severity="info">
            No modifications yet. Use natural language commands to modify your data.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NaturalLanguageDataModifier; 