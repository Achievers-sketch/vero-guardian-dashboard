## Description

Drag-and-drop widget layout for users.

## Problem Statement

Users have different monitoring priorities and need a way to customize their dashboard layout.

## Technical Details

- Integrated `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` for a highly performant drag-and-drop experience.
- Implemented a Grid-based layout engine (`WidgetGrid` and `SortableWidget`) in `src/components/DashboardLayout/`.
- Layout state is optimized via local state and persists for the user using `localStorage`.
- Handled widget dynamic rendering and access control safety (ensured layout state safety).

## Definition of Done

Verified via UX testing (local development tests for drag and drop interactions and storage persistence).

closes #43
