import React, { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box, Typography, Chip } from '@mui/material';

interface DataGridProps {
  data: any[];
  title: string;
  onDataChange?: (newData: any[]) => void;
}

const DataGridComponent: React.FC<DataGridProps> = ({ 
  data, 
  title, 
  onDataChange 
}) => {
  const [rows, setRows] = useState(data);

  // Generate columns dynamically based on data structure
  const columns: GridColDef[] = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sampleRow = data[0];
    return Object.keys(sampleRow).map((key) => ({
      field: key,
      headerName: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
      flex: 1,
      minWidth: 120,
      editable: true,
    }));
  }, [data]);

  // Add unique IDs to rows if they don't exist
  const rowsWithIds = useMemo(() => {
    return rows.map((row, index) => ({
      ...row,
      id: row.id || `row-${index}`,
    }));
  }, [rows]);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No {title} data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <Chip 
          label={`${rowsWithIds.length} rows`} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
      </Box>
      <DataGrid
        rows={rowsWithIds}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
        }}
        pageSizeOptions={[5, 10, 25]}
        checkboxSelection
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
};

export default DataGridComponent;
