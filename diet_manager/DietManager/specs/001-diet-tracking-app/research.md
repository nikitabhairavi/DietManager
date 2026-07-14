# Research: Diet Tracking App

## Decision: Build the app as a React Native + TypeScript Expo mobile application

**Rationale**: The feature is centered on a personal, mobile-first nutrition workflow with offline data entry and local persistence. Expo provides the fastest path to ship iOS and Android support from one codebase while keeping development lightweight for an MVP.

**Alternatives considered**:
- Web-only app: Rejected because the requested workflow is centered on daily tracking and mobile convenience.
- React Native without Expo: Rejected because Expo reduces setup time and simplifies deployment for a first version.
- Backend-driven architecture: Rejected because the initial scope is single-user and offline-friendly.

## Decision: Use a local database for structured persistence

**Rationale**: Ingredients, recipes, daily entries, and targets all need reliable storage with query support for history and daily summaries. A local database is simpler and more predictable than a remote API for an MVP.

**Alternatives considered**:
- AsyncStorage only: Rejected because it is less suited to relational queries and history aggregation.
- Firebase/Supabase: Rejected for the initial scope because the feature is single-user and local-first.

## Decision: Store portion factors as fractional values and compute totals from them

**Rationale**: Users need common fractions such as 1/2 and 1/3 while keeping calculations precise and easy to explain. The app can store a decimal multiplier derived from the selected portion factor and display the human-readable label in the UI.

**Alternatives considered**:
- Integer-only portions: Rejected because it would not support common fractional portions requested by the user.
- Free-text portion input: Rejected because it introduces parsing errors and inconsistent validation.

## Decision: Keep the first release focused on a single-user experience

**Rationale**: The current scope centers on personal nutrition tracking, not multi-user collaboration or cloud sync. A single-user model keeps the first release simpler and aligned with the constitution’s emphasis on incremental delivery.

**Alternatives considered**:
- Multi-user account system: Rejected as unnecessary for the initial MVP.
- Shared household data model: Rejected because it adds complexity without clear value for the requested flow.
