"use client";
import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Container, 
  Paper,
  Button,
  Chip,
  Divider
} from "@mui/material";
import FileUploader from "../components/FileUploader";
import DataGridComponent from "../components/DataGrid";
import ValidationPanel from "../components/ValidationPanel";
import NaturalLanguageSearch from "../components/NaturalLanguageSearch";
import RuleBuilder from "../components/RuleBuilder";
import PriorityPanel from "../components/PriorityPanel";
import AIHelper from "../components/AIHelper";
import NaturalLanguageDataModifier from "../components/NaturalLanguageDataModifier";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Home() {
  const [clients, setClients] = useState<any[] | null>(null);
  const [workers, setWorkers] = useState<any[] | null>(null);
  const [tasks, setTasks] = useState<any[] | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [activeDataset, setActiveDataset] = useState<string>('clients');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getActiveData = () => {
    switch (activeDataset) {
      case 'clients': return clients;
      case 'workers': return workers;
      case 'tasks': return tasks;
      default: return clients;
    }
  };

  const getActiveTitle = () => {
    switch (activeDataset) {
      case 'clients': return 'Clients';
      case 'workers': return 'Workers';
      case 'tasks': return 'Tasks';
      default: return 'Data';
    }
  };

  const handleDataChange = (newData: any[]) => {
    switch (activeDataset) {
      case 'clients':
        setClients(newData);
        break;
      case 'workers':
        setWorkers(newData);
        break;
      case 'tasks':
        setTasks(newData);
        break;
    }
  };

  const totalRecords = (clients?.length || 0) + (workers?.length || 0) + (tasks?.length || 0);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Data Alchemist: AI Resource-Allocation Configurator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Upload, validate, and process your data with AI-powered insights and natural language processing
        </Typography>
        
        {/* Data Upload Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Data Upload
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <FileUploader label="Clients" onData={setClients} />
      <FileUploader label="Workers" onData={setWorkers} />
      <FileUploader label="Tasks" onData={setTasks} />
          </Box>
          
          {totalRecords > 0 && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip label={`${clients?.length || 0} Clients`} color="primary" />
              <Chip label={`${workers?.length || 0} Workers`} color="secondary" />
              <Chip label={`${tasks?.length || 0} Tasks`} color="success" />
              <Typography variant="body2" color="text.secondary">
                Total: {totalRecords} records loaded
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Dataset Selector */}
        {totalRecords > 0 && (
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active Dataset
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={activeDataset === 'clients' ? 'contained' : 'outlined'}
                onClick={() => setActiveDataset('clients')}
                disabled={!clients || clients.length === 0}
              >
                Clients ({clients?.length || 0})
              </Button>
              <Button
                variant={activeDataset === 'workers' ? 'contained' : 'outlined'}
                onClick={() => setActiveDataset('workers')}
                disabled={!workers || workers.length === 0}
              >
                Workers ({workers?.length || 0})
              </Button>
              <Button
                variant={activeDataset === 'tasks' ? 'contained' : 'outlined'}
                onClick={() => setActiveDataset('tasks')}
                disabled={!tasks || tasks.length === 0}
              >
                Tasks ({tasks?.length || 0})
              </Button>
            </Box>
          </Paper>
        )}

        {/* Main Interface Tabs */}
        {totalRecords > 0 && (
          <Paper sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="data processing tabs">
                <Tab label="Data Grid" />
                <Tab label="Validation" />
                <Tab label="Search" />
                <Tab label="Rules" />
                <Tab label="Priorities" />
                <Tab label="Data Modifier" />
                <Tab label="AI Assistant" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              <DataGridComponent
                data={getActiveData() || []}
                title={getActiveTitle()}
                onDataChange={handleDataChange}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <ValidationPanel
                data={getActiveData() || []}
                title={getActiveTitle()}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <NaturalLanguageSearch
                data={getActiveData() || []}
                title={getActiveTitle()}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <RuleBuilder
                data={getActiveData() || []}
                title={getActiveTitle()}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <PriorityPanel
                data={getActiveData() || []}
                title={getActiveTitle()}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <NaturalLanguageDataModifier
                data={getActiveData() || []}
                title={getActiveTitle()}
                onDataChange={handleDataChange}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
              <AIHelper
                data={getActiveData() || []}
                title={getActiveTitle()}
              />
            </TabPanel>
          </Paper>
        )}

        {/* No Data State */}
        {totalRecords === 0 && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No Data Loaded
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload your CSV or XLSX files above to get started with data processing, validation, and AI-powered insights.
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}
