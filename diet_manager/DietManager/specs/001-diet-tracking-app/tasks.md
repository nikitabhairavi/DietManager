# Tasks: Diet Tracking App

**Input**: Design documents from `/specs/001-diet-tracking-app/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks were created for this feature because the request explicitly asked not to write tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the Expo app shell and shared project structure for the feature.

- [ ] T001 Create the Expo TypeScript project structure in app/, src/, and tests/ per the implementation plan
- [ ] T002 Initialize Expo dependencies for routing, local storage, state management, and safe-area support in package.json
- [ ] T003 [P] Configure TypeScript, basic linting, and app scripts in tsconfig.json, package.json, and .eslintrc.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared data layer and navigation foundation that all user stories depend on.

- [ ] T004 Create the SQLite-backed storage service in src/services/storage.ts
- [ ] T005 Create shared nutrition calculation helpers and portion multiplier utilities in src/utils/nutrition.ts and src/utils/portionFactors.ts
- [ ] T006 [P] Create the Zustand app store for ingredients, recipes, daily entries, and targets in src/store/appStore.ts
- [ ] T007 [P] Create the Expo Router shell and tab layout in app/_layout.tsx and app/(tabs)/_layout.tsx
- [ ] T008 Implement schema initialization and data validation rules in src/services/schema.ts and src/services/validation.ts
- [ ] T009 Create shared UI primitives for cards, form fields, and progress indicators in src/components/

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Maintain a personal ingredient library (Priority: P1) 🎯 MVP

**Goal**: Let users add, view, and reuse ingredients with nutrition values.

**Independent Test**: A user can add a new ingredient, save it, and see it appear in the ingredient list for later use.

### Implementation for User Story 1

- [ ] T010 [P] [US1] Implement ingredient CRUD persistence in src/services/ingredientService.ts
- [ ] T011 [P] [US1] Build the ingredient entry form and list screen in app/ingredients.tsx
- [ ] T012 [US1] Add duplicate-name handling and validation messages for ingredient entry in src/services/validation.ts and app/ingredients.tsx
- [ ] T013 [US1] Connect the ingredient screen to the app store and show saved ingredients from storage in src/store/appStore.ts and app/ingredients.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Create recipes from saved ingredients (Priority: P1)

**Goal**: Let users build recipes from saved ingredients and calculate recipe totals.

**Independent Test**: A user can create a recipe from stored ingredients, save it, and see the calculated totals.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Implement recipe persistence and recipe-ingredient line storage in src/services/recipeService.ts
- [ ] T015 [P] [US2] Build the recipe creation form and recipe list screen in app/recipes.tsx
- [ ] T016 [US2] Implement recipe total calculation from ingredient values and units used in src/utils/nutrition.ts
- [ ] T017 [US2] Allow new ingredients to be added during recipe creation and persist them for future use in app/recipes.tsx and src/services/ingredientService.ts

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently.

---

## Phase 5: User Story 3 - Log daily meals and adjust portions (Priority: P1)

**Goal**: Let users record daily meals, choose recipes, and apply portion factors such as 1/2 and 1/3.

**Independent Test**: A user can log a recipe for a day, select a portion factor, and see the daily totals update.

### Implementation for User Story 3

- [ ] T018 [P] [US3] Build the daily logging screen in app/(tabs)/index.tsx
- [ ] T019 [P] [US3] Implement portion-factor selection and multiplier mapping in src/utils/portionFactors.ts and app/(tabs)/index.tsx
- [ ] T020 [US3] Persist daily entries and compute consumed calories, protein, and fiber in src/services/dailyEntryService.ts
- [ ] T021 [US3] Add history support for today, yesterday, and prior days in app/(tabs)/history.tsx and src/store/appStore.ts

**Checkpoint**: At this point, User Story 3 should be fully functional and testable independently.

---

## Phase 6: User Story 4 - Track progress toward daily nutrition targets (Priority: P2)

**Goal**: Let users set targets and see remaining calories, protein, and fiber with a clear visual status.

**Independent Test**: A user can set daily targets and see remaining values and progress indicators for the current day.

### Implementation for User Story 4

- [ ] T022 [P] [US4] Build the target settings UI in app/(tabs)/settings.tsx
- [ ] T023 [US4] Persist daily targets and load them into the app store in src/services/targetService.ts and src/store/appStore.ts
- [ ] T024 [US4] Calculate remaining nutrition values and visual status states in src/utils/targets.ts
- [ ] T025 [US4] Render the daily summary tracker cards and color-coded progress states in app/(tabs)/index.tsx and app/(tabs)/history.tsx

**Checkpoint**: At this point, User Stories 1 through 4 should be independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improve usability, accessibility, and reliability across the app.

- [ ] T026 [P] Add accessibility labels, focus states, and readable error messaging across app/ and src/components/
- [ ] T027 Improve empty states, loading states, and onboarding copy across the ingredient, recipe, and daily log flows
- [ ] T028 Validate the quickstart scenarios end to end and fix any issues in the Expo app flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on the ingredient library from US1 for reuse
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on recipes from US2 for daily logging
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Depends on daily entries and targets from earlier flows

### Parallel Opportunities

- Setup tasks T001-T003 can run in parallel
- Foundational tasks T004-T009 can run in parallel where the files differ
- US1 tasks T010-T013 can proceed in parallel after foundational work
- US2 tasks T014-T017 can proceed in parallel after foundational work
- US3 tasks T018-T021 can proceed in parallel after foundational work
- US4 tasks T022-T025 can proceed in parallel after foundational work

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate ingredient entry and persistence
5. Continue to User Story 2 and 3 for the full feature

### Incremental Delivery

1. Complete Setup + Foundational to create the app shell and shared data layer
2. Add User Story 1 for ingredient management
3. Add User Story 2 for recipe creation
4. Add User Story 3 for daily logging and history
5. Add User Story 4 for target-based progress tracking
6. Apply polish and validation
