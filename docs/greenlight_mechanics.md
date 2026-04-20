# Greenlight Mechanics

The Greenlight System manages the evaluation of projects before they can proceed to production. It determines whether a project is viable based on a score out of 100 and outputs a recommendation alongside lists of positive and negative factors.

## Execution and the Greenlight Report

A project's viability is evaluated by calling `evaluateGreenlight(project, cash, attachedTalent, rng, currentWeek, allProjects)` in `src/engine/systems/greenlight.ts`.

It generates a `GreenlightReport` containing:
- `score`: A numerical value from 0 to 100.
- `recommendation`: A text recommendation ranging from 'Easy Greenlight' to 'Do Not Greenlight Yet'.
- `positives`: A list of strings describing the project's strong points.
- `negatives`: A list of strings describing the project's weaknesses.

## Evaluation Criteria

The system currently assesses four main pillars:

### 1. Market Saturation
The market is checked for recent (within the last 52 weeks) releases of the same genre.

**Impact:**
- **Penalty:** Base penalty of 5 points per recent similar project. If 5 or more projects exist, a flat 20 point penalty is added. Oversaturated tentpole genres (like 'superhero') multiply this penalty heavily.
- **Calendar Gap Bonus:** If 0 similar projects have been released recently, a 15 point bonus is awarded because the market is starved for this genre.

### 2. Finance (Budget vs Cash)
The studio's current cash reserves are compared against the project's budget.

**Impact:**
- `cash < project.budget`: -40 points.
- `project.budget <= cash < project.budget * 2`: -15 points.
- `cash > project.budget * 5`: +10 points.

### 3. Talent Package
The quality of the attached talent is assessed. If no talent is attached, a 20 point penalty is incurred. Otherwise, the average draw and total prestige are calculated.

**Impact:**
- `avgDraw > 75`: +30 points.
- `avgDraw > 50`: +15 points.
- `avgDraw <= 50`: -5 points.
- `totalPrestige > 150`: +10 points (for awards narrative potential).

### 4. Project Buzz
The project's pre-release buzz is considered.

**Impact:**
- `buzz > 80`: +20 points.
- `buzz > 60`: +10 points.
- `buzz < 30`: -15 points.

## Recommendations

Based on the final score, one of the following recommendations is assigned:
- `>= 80`: 'Easy Greenlight'
- `>= 60`: 'Viable with Conditions'
- `>= 40`: 'Speculative Bet' (or 'Dangerous Vanity Play' for high/blockbuster budget tiers)
- `< 40`: 'Do Not Greenlight Yet' (or 'Dangerous Vanity Play' for high/blockbuster budget tiers)

## Future Implementation & Design Deviations

The current implementation covers the fundamental Market, Finance, Talent, and Buzz mechanics, but it deviates slightly from the specifications laid out in the Master Design Bible:

- **Role Completeness Score (Section 35.13):** The Design Bible specifies that the system should evaluate whether all mandatory creative leadership and performance slots are filled. This is currently missing.
- **Schedule Certainty:** The Design Bible specifies that the system should evaluate "schedule certainty", predicting potential friction or delays. This is currently missing.
