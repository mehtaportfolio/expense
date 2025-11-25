---
description: Repository Information Overview
alwaysApply: true
---

# Expense Tracker Information

## Summary
A simple expense tracking application built with React, TypeScript, and Vite. Uses Supabase for backend database operations.

## Structure
- **src/**: Main source code including components, hooks, pages, types, and entry points (App.tsx, index.tsx)
- **dist/**: Built application assets and index.html
- **node_modules/**: Installed npm dependencies
- **create_master_table.sql**: SQL script for initializing the master table in Supabase database

## Language & Runtime
**Language**: TypeScript/JavaScript  
**Version**: TypeScript 5.5.3, ES2020 target  
**Build System**: Vite  
**Package Manager**: npm  

## Dependencies
**Main Dependencies**:  
- @supabase/supabase-js: ^2.45.4  
- lucide-react: ^0.439.0  
- react: ^18.3.1  
- react-dom: ^18.3.1  
- react-tabs: ^6.0.2  

**Development Dependencies**:  
- @types/react: ^18.3.1  
- @types/react-dom: ^18.3.1  
- @typescript-eslint/eslint-plugin: ^8.7.0  
- @typescript-eslint/parser: ^8.7.0  
- autoprefixer: ^10.4.20  
- eslint: ^9.9.0  
- eslint-plugin-react-hooks: ^5.1.0-rc.0  
- eslint-plugin-react-refresh: ^0.4.9  
- postcss: ^8.4.47  
- tailwindcss: ^3.4.13  
- ts-interface-checker: ^1.0.2  
- typescript: ^5.5.3  
- vite: ^5.4.1  

## Build & Installation
```bash
npm install
npm run build
```

## Main Files & Resources
**Entry Point**: src/index.tsx  
**Main App Component**: src/App.tsx  
**Database Schema**: create_master_table.sql  
**Configuration Files**: tsconfig.json, vite.config.ts, tailwind.config.js, postcss.config.js, .eslintrc.cjs