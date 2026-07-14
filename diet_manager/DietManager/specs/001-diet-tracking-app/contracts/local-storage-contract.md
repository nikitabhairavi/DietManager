# Local Storage Contract: Diet Tracking App

## Purpose

This contract defines the local persistence shape for the Expo app’s core domain data.

## Collections

### ingredients

Stores the ingredient library entries.

- id: string
- name: string
- quantityPerUnit: number
- caloriesPerUnit: number
- proteinPerUnit: number
- fiberPerUnit: number
- createdAt: string

### recipes

Stores recipe definitions.

- id: string
- name: string
- ingredientLines: array of { ingredientId, unitsUsed }
- totalCalories: number
- totalProtein: number
- totalFiber: number
- createdAt: string

### dailyEntries

Stores food entries logged for a day.

- id: string
- date: string
- recipeId: string
- portionFactor: string
- portionMultiplier: number
- consumedCalories: number
- consumedProtein: number
- consumedFiber: number
- createdAt: string

### userTargets

Stores the current user’s daily nutrition targets.

- id: string
- dailyCaloriesTarget: number
- dailyProteinTarget: number
- dailyFiberTarget: number
- updatedAt: string

## Operations

- Create, read, update, and delete operations MUST be supported for ingredients, recipes, and daily entries.
- Daily summaries MUST be derived from dailyEntries and userTargets at read time.
- Data writes MUST preserve the nutrition totals used for display and history.
