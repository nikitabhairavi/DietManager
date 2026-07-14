<!--
Sync Impact Report
- Version change: template placeholders -> 1.0.0
- Modified principles: none (initial constitution)
- Added sections: Data & Safety Requirements; Development Workflow & Review Gates
- Removed sections: none
- Templates requiring updates: ✅ .specify/templates/plan-template.md; ✅ .specify/templates/spec-template.md; ✅ .specify/templates/tasks-template.md
- Follow-up TODOs: none
-->

# DietManager Constitution

## Core Principles

### I. Nutrition Accuracy & Explainability
Every feature that affects meal logging, calorie totals, nutrient calculations,
or recommendations MUST use explicit rules and visible assumptions. When data
is derived from user input, defaults, or external sources, the system MUST
expose the source and explain how the value was calculated. Silent rounding,
hidden defaults, and unverifiable nutrition assumptions are prohibited.

### II. Privacy & Secure Health Data
Personal health, dietary, and activity data MUST be treated as sensitive
information. The system MUST protect it with least-privilege access, secure
storage and transport, and clear consent boundaries. Secrets, tokens, and
personal health data MUST NOT be exposed in logs, telemetry, or debug output.

### III. Test-First for Behavior Changes
Any change to user-visible behavior, data calculations, or workflow logic MUST
be specified before implementation and covered by automated tests before merge.
For features that affect meal entry, nutrition totals, reminders, or progress
tracking, the test suite MUST prove the intended behavior and the failure mode
of incorrect calculations.

### IV. Accessibility & Inclusive Experience
Dietary tools MUST be usable by people with different abilities and contexts.
New interfaces MUST support keyboard navigation, screen-reader compatible
labels, readable contrast, and clear error states. Features MUST remain
understandable when users are interrupted, low-bandwidth, or using assistive
technologies.

### V. Incremental Delivery & Operational Visibility
Work MUST be delivered in small, reviewable increments with clear ownership and
rollback paths. New features or changes to data flow MUST include observable
telemetry, human-readable errors, and migration or rollback guidance when they
affect existing user data or workflows.

## Data & Safety Requirements
All features MUST preserve data integrity for meal entries, goals, and progress
records. When a feature changes schema, formulas, or imported data, it MUST
include a migration plan, validation rules, and backward-compatible handling
for existing records. Nutrition guidance or health-related claims MUST be
clearly labeled as informational and MUST NOT present unverified medical advice
as authoritative.

## Development Workflow & Review Gates
Every feature proposal MUST define the user impact, the affected data flows,
and the approval path before implementation. Pull requests MUST verify
compliance with this constitution through review of privacy handling,
accessibility, test coverage, and data integrity. Changes that alter user-facing
behavior or stored data MUST not merge without documented validation and a
rollback plan.

## Governance
This constitution supersedes conflicting local practices for DietManager work.
Amendments require a pull request that explains the rationale, lists affected
templates or workflows, and updates the version and any dependent artifacts.
Any change to principles or governance rules MUST be reviewed by at least one
maintainer and one domain reviewer before approval.

Versioning follows semantic versioning: MAJOR for backward-incompatible
governance or principle changes, MINOR for new principles or materially expanded
guidance, and PATCH for clarifications or non-semantic refinements. Compliance
reviews MUST confirm that specs, plans, and tasks explicitly address the
relevant principles before implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-07-14 | **Last Amended**: 2026-07-14
