# Runtime Error Fix - "use server" Export Issue

## 🐛 **Problem Identified**
```
Error: A "use server" file can only export async functions, found object.
```

**Location**: `/src/ai/flows/customer-advisor.ts`

## 🔍 **Root Cause**
In Next.js, files marked with `'use server'` directive can only export async functions. The `customer-advisor.ts` file was exporting two objects:
- `quickHelpTopics` - Array of help topic objects
- `commonQueries` - Object with predefined query responses

This violated Next.js server action rules and caused a runtime error.

## ✅ **Solution Implemented**

### 1. **Created Separate Data File**
- **New File**: `/src/lib/customer-help-data.ts`
- **Purpose**: Houses all non-function exports (objects, arrays, constants)
- **Content**: Moved `quickHelpTopics` and `commonQueries` to this file

### 2. **Updated Customer Advisor Flow**
- **File**: `/src/ai/flows/customer-advisor.ts`
- **Change**: Removed all object exports, kept only async function exports
- **Result**: Now complies with `'use server'` directive requirements

### 3. **Fixed Import References**
- **File**: `/src/components/customer/ai-advisor-chat.tsx`
- **Change**: Updated import statement from:
  ```typescript
  import { quickHelpTopics } from '@/ai/flows/customer-advisor';
  ```
  To:
  ```typescript
  import { quickHelpTopics } from '@/lib/customer-help-data';
  ```

## 🎯 **Files Modified**

### Created:
- `src/lib/customer-help-data.ts` - Contains all static data objects

### Modified:
- `src/ai/flows/customer-advisor.ts` - Removed object exports
- `src/components/customer/ai-advisor-chat.tsx` - Updated import path

## 🔐 **Next.js Server Action Rules**

### ✅ **Allowed in 'use server' files:**
- `export async function functionName() { ... }`
- Default async function exports
- Named async function exports

### ❌ **NOT Allowed in 'use server' files:**
- Object exports (`export const obj = { ... }`)
- Array exports (`export const arr = [ ... ]`)
- Class exports (`export class ClassName { ... }`)
- Non-function variable exports

## ✨ **Result**
- ✅ Runtime error resolved
- ✅ Customer dashboard loads successfully
- ✅ AI chatbot functionality preserved
- ✅ All imports and exports working correctly
- ✅ Development server running without errors

## 🧪 **Testing**
1. **Server Status**: ✅ Running on localhost:9002
2. **Customer Dashboard**: ✅ Loads without runtime errors
3. **AI Chatbot**: ✅ Quick help topics display correctly
4. **Import Resolution**: ✅ All imports resolve properly

The fix maintains all functionality while ensuring compliance with Next.js server action export restrictions.
