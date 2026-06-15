# Persistence Layer Documentation

## Overview

The Studio Boss persistence layer handles saving and loading game state across different environments (Electron desktop app and web browser). It uses a dual-strategy approach:

1. **Electron Environment**: Uses IPC (Inter-Process Communication) to access the native file system
2. **Web Environment**: Uses Origin Private File System (OPFS) with a Web Worker for background I/O

## Architecture

### Files

- `src/persistence/saveLoad.ts` - High-level orchestration layer
- `src/persistence/PersistenceService.ts` - Web Worker communication manager
- `src/persistence/saveWorker.ts` - Background I/O worker for OPFS operations

### Data Flow

```
UI/Store → saveLoad.ts → [Electron IPC or PersistenceService] → Storage
```

## Save/Load Operations

### Saving Game State

**Electron Path:**
1. `saveGame(slot, state)` called from store
2. Detects Electron environment via `window.electronAPI`
3. Calls `window.electronAPI.saveGame(slot, state)` via IPC
4. Electron main process writes to file system
5. Returns success/failure boolean

**Web Path:**
1. `saveGame(slot, state)` called from store
2. Detects web environment (no electronAPI)
3. Dynamically imports `PersistenceService`
4. Creates Web Worker message with `SAVE_GAME` type
5. Worker writes to OPFS using `navigator.storage.getDirectory()`
6. Worker responds with `SAVE_SUCCESS` message
7. Promise resolved

### Loading Game State

**Electron Path:**
1. `loadGame(slot)` called from store
2. Calls `window.electronAPI.loadGame(slot)` via IPC
3. Electron main process reads from file system
4. Returns `GameState` object or `null`

**Web Path:**
1. `loadGame(slot)` called from store
2. Dynamically imports `PersistenceService`
3. Creates Web Worker message with `LOAD_GAME` type
4. Worker reads from OPFS
5. Worker responds with `LOAD_SUCCESS` message containing state
6. Returns `GameState` object or `null`

## Save Slots

The game supports 3 save slots (0, 1, 2) by default.

### Save Slot Metadata

```typescript
interface SaveSlotInfo {
  slot: number;
  exists: boolean;
  studioName: string;
  archetype: string;
  week: number;
  cash: number;
  timestamp: number;
}
```

### Getting Save Slots

`getSaveSlots()` returns an array of all 3 slots with their current state, allowing the UI to display available saves.

## Web Worker Architecture

### PersistenceService

Manages Web Worker lifecycle and message passing:

- **Worker Initialization**: Creates module worker from `saveWorker.ts`
- **Request Management**: Uses request IDs to track pending operations
- **Promise Resolution**: Maps worker responses to pending promises
- **Error Handling**: Catches and logs worker errors

### Message Protocol

**Save Request:**
```typescript
{
  type: 'SAVE_GAME',
  slotId: string | number,
  requestId: string,
  state: GameState
}
```

**Load Request:**
```typescript
{
  type: 'LOAD_GAME',
  slotId: string | number,
  requestId: string
}
```

**Worker Response:**
```typescript
{
  type: 'SAVE_SUCCESS' | 'LOAD_SUCCESS' | 'ERROR',
  slotId: string | number,
  requestId: string,
  state?: GameState,
  message?: string
}
```

## OPFS (Origin Private File System)

Used in web environments to provide persistent storage:

- **Directory Access**: `navigator.storage.getDirectory()`
- **File Operations**: `getFileHandle`, `createWritable`, `write`
- **File Naming**: `slot_{slotId}.sb`
- **Storage Scope**: Private to origin (not accessible across websites)

## Electron IPC

In the Electron desktop app, the persistence layer uses IPC to communicate with the main process:

- **saveGame**: Writes JSON to `userData/saves/slot_{n}.json`
- **loadGame**: Reads JSON from `userData/saves/slot_{n}.json`
- **listSaves**: Returns array of existing slot numbers
- **deleteSave**: Removes save file
- **exportSave**: Exports save to user-selected location
- **importSave**: Imports save from user-selected file

## Error Handling

All persistence operations include try-catch blocks:

- Save failures are logged to console
- Load failures return `null` instead of throwing
- Worker errors are caught and promises resolved with `null`

## Performance Considerations

- **Web Worker**: I/O operations run off main thread to prevent UI blocking
- **Debouncing**: Store should debounce save operations (recommended)
- **Async Operations**: All operations are async to prevent blocking
- **Dynamic Imports**: Web-specific code only loaded when needed

## Migration & Compatibility

The persistence layer handles game state serialization automatically via JSON. No explicit migration logic is currently implemented, but the structure allows for:

- Adding new fields to `GameState` (will be ignored on load)
- Version checking (can be added to save metadata)
- Data transformation (can be added to load path)

## Security Notes

- **OPFS**: Private to origin, requires HTTPS in production
- **Electron**: Access to full file system (user data directory)
- **Data Validation**: Loaded state should be validated before use
- **Serialization**: Uses JSON.stringify/parse (no custom serializers)
