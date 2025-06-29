import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Slider,
  Chip,
  Button,
  TextField,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

interface PriorityItem {
  id: string;
  name: string;
  priority: number;
  weight: number;
  category: string;
  description: string;
}

interface PriorityPanelProps {
  data: any[];
  title: string;
  onPrioritiesChange?: (priorities: PriorityItem[]) => void;
}

const PriorityPanel: React.FC<PriorityPanelProps> = ({
  data,
  title,
  onPrioritiesChange
}) => {
  const [priorities, setPriorities] = useState<PriorityItem[]>([]);
  const [newItem, setNewItem] = useState<Partial<PriorityItem>>({
    name: '',
    priority: 5,
    weight: 1,
    category: 'default',
    description: ''
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Available fields from data
  const availableFields = data && data.length > 0 ? Object.keys(data[0]) : [];

  // Categories
  const categories = [
    { value: 'default', label: 'Default' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' },
    { value: 'critical', label: 'Critical' }
  ];

  const addPriorityItem = () => {
    if (!newItem.name) return;

    const item: PriorityItem = {
      id: Date.now().toString(),
      name: newItem.name,
      priority: newItem.priority || 5,
      weight: newItem.weight || 1,
      category: newItem.category || 'default',
      description: newItem.description || ''
    };

    const updatedPriorities = [...priorities, item];
    setPriorities(updatedPriorities);
    onPrioritiesChange?.(updatedPriorities);

    // Reset form
    setNewItem({
      name: '',
      priority: 5,
      weight: 1,
      category: 'default',
      description: ''
    });
  };

  const updatePriority = (id: string, priority: number) => {
    const updatedPriorities = priorities.map(item =>
      item.id === id ? { ...item, priority } : item
    );
    setPriorities(updatedPriorities);
    onPrioritiesChange?.(updatedPriorities);
  };

  const updateWeight = (id: string, weight: number) => {
    const updatedPriorities = priorities.map(item =>
      item.id === id ? { ...item, weight } : item
    );
    setPriorities(updatedPriorities);
    onPrioritiesChange?.(updatedPriorities);
  };

  const deleteItem = (id: string) => {
    const updatedPriorities = priorities.filter(item => item.id !== id);
    setPriorities(updatedPriorities);
    onPrioritiesChange?.(updatedPriorities);
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'error';
    if (priority >= 6) return 'warning';
    if (priority >= 4) return 'info';
    return 'success';
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return 'Critical';
    if (priority >= 6) return 'High';
    if (priority >= 4) return 'Medium';
    return 'Low';
  };

  const filteredPriorities = selectedCategory === 'all' 
    ? priorities 
    : priorities.filter(item => item.category === selectedCategory);

  const totalWeight = priorities.reduce((sum, item) => sum + item.weight, 0);
  const averagePriority = priorities.length > 0 
    ? priorities.reduce((sum, item) => sum + item.priority, 0) / priorities.length 
    : 0;

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No {title} data to prioritize
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {title} Priority Management
        </Typography>

        {/* Summary Stats */}
        {priorities.length > 0 && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Chip label={`${priorities.length} items`} size="small" />
              <Chip label={`Total Weight: ${totalWeight}`} size="small" />
              <Chip label={`Avg Priority: ${averagePriority.toFixed(1)}`} size="small" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Manage priorities and weights for data processing rules
            </Typography>
          </Box>
        )}

        {/* Add New Item */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add Priority Item
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Item Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                size="small"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  label="Category"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Priority: {newItem.priority || 5}
                </Typography>
                <Slider
                  value={newItem.priority || 5}
                  onChange={(_, value) => setNewItem({ ...newItem, priority: value as number })}
                  min={1}
                  max={10}
                  marks
                  valueLabelDisplay="auto"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Weight: {newItem.weight || 1}
                </Typography>
                <Slider
                  value={newItem.weight || 1}
                  onChange={(_, value) => setNewItem({ ...newItem, weight: value as number })}
                  min={0.1}
                  max={5}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Box>
            
            <TextField
              fullWidth
              label="Description (Optional)"
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              size="small"
            />
            
            <Button
              variant="contained"
              onClick={addPriorityItem}
              disabled={!newItem.name}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Item
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Filter */}
        <Box sx={{ mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Filter by Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Priorities List */}
        {filteredPriorities.length > 0 ? (
          <List dense>
            {filteredPriorities.map((item) => (
              <Box key={item.id}>
                <ListItem>
                  <span style={{ width: '100%' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Typography component="span" variant="subtitle2">
                        {item.name}
                      </Typography>
                      <Chip label={getPriorityLabel(item.priority)} size="small" color={getPriorityColor(item.priority)} variant="outlined" />
                      <Chip label={`Weight: ${item.weight}`} size="small" variant="outlined" />
                      <Chip label={item.category} size="small" variant="outlined" />
                    </span>
                    {item.description && (
                      <Typography component="span" variant="body2" color="text.secondary" style={{ marginBottom: 8, display: 'block' }}>
                        {item.description}
                      </Typography>
                    )}
                    <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ flex: 1 }}>
                        <Typography component="span" variant="body2" color="text.secondary">
                          Priority: {item.priority}
                        </Typography>
                        <Slider value={item.priority} onChange={(_, value) => updatePriority(item.id, value as number)} min={1} max={10} size="small" />
                      </span>
                      <span style={{ flex: 1 }}>
                        <Typography component="span" variant="body2" color="text.secondary">
                          Weight: {item.weight}
                        </Typography>
                        <Slider value={item.weight} onChange={(_, value) => updateWeight(item.id, value as number)} min={0.1} max={5} step={0.1} size="small" />
                      </span>
                    </span>
                  </span>
                  <Button size="small" onClick={() => deleteItem(item.id)} color="error" variant="outlined">Delete</Button>
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        ) : priorities.length > 0 ? (
          <Alert severity="info">
            No items match the selected category filter.
          </Alert>
        ) : (
          <Alert severity="info">
            No priority items created yet. Add items to manage priorities and weights.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PriorityPanel;
