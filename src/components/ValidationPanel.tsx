import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  List, 
  ListItem, 
  Alert,
  Button,
  Divider
} from '@mui/material';
import { z } from 'zod';

interface ValidationError {
  field: string;
  message: string;
  value: unknown;
  rowIndex: number;
}

interface ValidationPanelProps {
  data: unknown[];
  title: string;
  onValidationComplete?: (errors: ValidationError[]) => void;
}

const ValidationPanel: React.FC<ValidationPanelProps> = ({ 
  data, 
  title, 
  onValidationComplete 
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Common validation schemas
  const commonSchemas = {
    email: z.string().email('Invalid email format'),
    phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
    number: z.number().or(z.string().transform((val) => parseFloat(val))),
    required: z.string().min(1, 'This field is required'),
  };

  // Generate validation schema based on data structure
  const generateSchema = (sampleRow: Record<string, unknown>) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    Object.keys(sampleRow).forEach((key) => {
      const value = sampleRow[key];
      const lowerKey = key.toLowerCase();
      
      // Auto-detect field types based on content and field name
      if (lowerKey.includes('email')) {
        schemaFields[key] = commonSchemas.email.optional();
      } else if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
        schemaFields[key] = commonSchemas.phone.optional();
      } else if (lowerKey.includes('date')) {
        schemaFields[key] = commonSchemas.date.optional();
      } else if (typeof value === 'number' || !isNaN(Number(value))) {
        schemaFields[key] = commonSchemas.number.optional();
      } else {
        schemaFields[key] = commonSchemas.required.optional();
      }
    });
    
    return z.object(schemaFields);
  };

  const validateData = () => {
    if (!data || data.length === 0) return;
    
    setIsValidating(true);
    const errors: ValidationError[] = [];
    
    try {
      const schema = generateSchema(data[0] as Record<string, unknown>);
      
      data.forEach((row, index) => {
        const result = schema.safeParse(row as Record<string, unknown>);
        if (!result.success) {
          result.error.issues.forEach((issue) => {
            errors.push({
              field: issue.path.join('.'),
              message: issue.message,
              value: (row as Record<string, unknown>)[issue.path[0]],
              rowIndex: index + 1,
            });
          });
        }
      });
    } catch (error) {
      console.error('Validation error:', error);
    }
    
    setValidationErrors(errors);
    onValidationComplete?.(errors);
    setIsValidating(false);
  };

  const validationStats = useMemo(() => {
    if (!data) return null;
    
    const totalRows = data.length;
    const errorRows = new Set(validationErrors.map(e => e.rowIndex)).size;
    const validRows = totalRows - errorRows;
    const errorCount = validationErrors.length;
    
    return {
      totalRows,
      validRows,
      errorRows,
      errorCount,
      fieldsWithErrors: new Set(validationErrors.map(e => e.field)).size,
    };
  }, [data, validationErrors]);

  const groupedErrors = useMemo(() => {
    const grouped: Record<string, ValidationError[]> = {};
    validationErrors.forEach(error => {
      if (!grouped[error.field]) {
        grouped[error.field] = [];
      }
      grouped[error.field].push(error);
    });
    return grouped;
  }, [validationErrors]);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No {title} data to validate
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{title} Validation</Typography>
          <Button 
            variant="contained" 
            onClick={validateData}
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Validate Data'}
          </Button>
        </Box>

        {validationStats && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip 
                label={`Total: ${validationStats.totalRows}`} 
                color="default" 
                size="small" 
              />
              <Chip 
                label={`Valid: ${validationStats.validRows}`} 
                color="success" 
                size="small" 
              />
              <Chip 
                label={`Errors: ${validationStats.errorRows}`} 
                color="error" 
                size="small" 
              />
              <Chip 
                label={`Issues: ${validationStats.errorCount}`} 
                color="warning" 
                size="small" 
              />
            </Box>
          </Box>
        )}

        {validationErrors.length > 0 ? (
          <Box>
            <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
              Validation Errors ({validationErrors.length} issues found)
            </Typography>
            <List dense>
              {Object.entries(groupedErrors).map(([field, errors]) => (
                <Box key={field}>
                  <ListItem>
                    <span style={{ width: '100%' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Typography component="span" variant="subtitle2" color="error">
                          {field}
                        </Typography>
                        <Chip label={errors.length} size="small" color="error" />
                      </span>
                      {errors.slice(0, 3).map((error, index) => (
                        <Typography key={index} component="span" variant="body2" color="text.secondary" style={{ display: 'block' }}>
                          Row {error.rowIndex}: {error.message} (Value: &quot;{String(error.value)}&quot;)
                        </Typography>
                      ))}
                      {errors.length > 3 && (
                        <Typography component="span" variant="body2" color="text.secondary" style={{ display: 'block' }}>
                          ... and {errors.length - 3} more errors
                        </Typography>
                      )}
                    </span>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </List>
          </Box>
        ) : validationStats && validationStats.errorCount === 0 ? (
          <Alert severity="success">
            All data passed validation! No errors found.
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ValidationPanel;
