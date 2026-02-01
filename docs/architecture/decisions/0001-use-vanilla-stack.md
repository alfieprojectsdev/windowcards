# 0001. Use Vanilla Stack (No Build Tools)

Date: 2026-02-01

## Status

Accepted

## Context

The Math Window Cards generator is designed for a specific context:
1.  **Target Environment**: Classrooms with limited connectivity or device capabilities (San Vicente Elementary School).
2.  **Maintainer Profile**: The project is a "learning project" by a developer transitioning to full-stack development.
3.  **Deployment**: Needs to be easily hosted (e.g., GitHub Pages) without complex CI/CD pipelines.

The application requirements are relatively simple:
-   Client-side logic only.
-   DOM manipulation for grid generation.
-   Basic persistent state (localStorage).
-   High print fidelity (CSS print media).

## Decision

We will use a **Vanilla Stack** consisting of:
-   **HTML5** for structure.
-   **CSS3** (with CSS Variables) for styling and print layout.
-   **Vanilla JavaScript (ES6+)** for logic.

We will **explicitly avoid**:
-   Frontend frameworks (React, Vue, etc.).
-   Build tools (Webpack, Vite, Parcel).
-   CSS preprocessors (Sass, Less) requiring compilation.
-   TypeScript (to avoid compilation steps, though JSDoc may be used).

## Consequences

### Positive
-   **Zero Dependency**: The project runs directly in any modern browser by opening `index.html`.
-   **Easy Deployment**: Can be drag-and-dropped onto any static host or run locally without `npm install`.
-   **Low Barrier to Entry**: Other teachers or novice developers can edit the code with a simple text editor.
-   **Performance**: Extremely lightweight initial load; no large bundles.

### Negative
-   **Scale Limits**: As the application grows (e.g., adding complex state management for "Practice Mode"), vanilla JS can become verbose and harder to structure compared to component-based frameworks.
-   **Type Safety**: Lack of TypeScript increases the risk of runtime errors (e.g., string vs number issues in calculation logic).
-   **Code Reusability**: Component reuse relies on copy-paste or template literals, which is less ergonomic than JSX/Components.

## Compliance
-   GoatCounter is used for privacy-friendly analytics, included as a simple script tag.
