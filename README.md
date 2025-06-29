# Digitalz: AI-Powered Spreadsheet Processor

## Overview

Digitalz is a Next.js + TypeScript web app for non-technical users to:
- Upload messy CSV/XLSX files (clients, workers, tasks)
- See and edit them in a UI grid (like Excel)
- Validate the data and apply AI-assisted corrections
- Define business rules through UI and natural language
- Export the cleaned data and a `rules.json`

## Features
- File upload (CSV/XLSX)
- Data grid with inline editing
- Data validation and summary
- AI-powered header normalization and suggestions
- Natural language search and rule builder
- Rule export and prioritization UI

## Tech Stack
- Next.js (TypeScript)
- MUI DataGrid
- SheetJS (xlsx)
- Zod (validation)
- Zustand (state management)
- OpenAI API (AI features)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the development server:**
   ```bash
   npm run dev
   ```
3. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Project Structure

```
/src
  /components
    FileUploader.tsx
    DataGrid.tsx
    ValidationPanel.tsx
    RuleBuilder.tsx
    PriorityPanel.tsx
    NaturalLanguageSearch.tsx
    AIHelper.tsx
  /lib
    /parsers
    /validators
    /ai
    utils.ts
/public/samples
  clients.csv
  workers.csv
  tasks.csv
```

## Sample Data
Sample CSVs are in `/public/samples`.

## Deployment
Deploy easily to Vercel or your preferred platform.

## License
MIT
