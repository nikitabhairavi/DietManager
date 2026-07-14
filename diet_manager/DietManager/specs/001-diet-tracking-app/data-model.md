# Data Model: Diet Tracking App

## Entities

### Ingredient

Represents a reusable food or ingredient that can be used in recipes.

- id: string
- name: string
- quantityPerUnit: number
- caloriesPerUnit: number
- proteinPerUnit: number
- fiberPerUnit: number
- createdAt: string

**Validation rules**:
- name MUST be non-empty.
- quantityPerUnit MUST be greater than 0.
- caloriesPerUnit, proteinPerUnit, and fiberPerUnit MUST be greater than or equal to 0.

### Recipe

Represents a meal template composed of one or more ingredient entries.

- id: string
- name: string
- ingredientLines: RecipeIngredientLine[]
- totalCalories: number
- totalProtein: number
- totalFiber: number
- createdAt: string

**Validation rules**:
- name MUST be non-empty.
- ingredientLines MUST contain at least one entry.
- totals MUST be derived from the selected ingredient values and stored for quick display.

### RecipeIngredientLine

A single ingredient reference inside a recipe.

- ingredientId: string
- unitsUsed: number
- createdAt: string

**Validation rules**:
- ingredientId MUST reference a saved ingredient.
- unitsUsed MUST be greater than 0.

### DailyEntry

Represents a recipe logged for a day with a chosen portion factor.

- id: string
- date: string
- recipeId: string
- portionFactor: string
- portionMultiplier: number
- consumedCalories: number
- consumedProtein: number
- consumedFiber: number
- createdAt: string

**Validation rules**:
- date MUST be a valid day identifier.
- portionFactor MUST be one of the supported values such as 1, 1/2, 1/3, or 1/4.
- portionMultiplier MUST be greater than 0.

### UserTarget

Represents the daily nutrition goals for the current user.

- id: string
- dailyCaloriesTarget: number
- dailyProteinTarget: number
- dailyFiberTarget: number
- updatedAt: string

**Validation rules**:
- all target values MUST be greater than or equal to 0.

## Relationships

- One Recipe contains many RecipeIngredientLine entries.
- Each RecipeIngredientLine references one Ingredient.
- One DailyEntry references one Recipe.
- The app calculates a DailyNutritionSummary from all DailyEntry records for a selected day.

## Derived Values

- Recipe totals are derived from Ingredient per-unit nutrition values multiplied by unitsUsed.
- DailyEntry totals are derived from Recipe totals multiplied by the selected portionMultiplier.
- DailyNutritionSummary is derived from the sum of DailyEntry totals and compared with the current UserTarget.

## State Transitions

- Ingredient creation: new ingredient added to storage and becomes reusable in recipes.
- Recipe creation: recipe totals are recalculated immediately after ingredients are added.
- Daily logging: adding or editing a DailyEntry updates the daily summary in real time.
