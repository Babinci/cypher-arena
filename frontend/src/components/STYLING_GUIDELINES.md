# Cypher Arena Styling Guidelines

This document outlines the styling approach for the Cypher Arena project.

## Overview

Cypher Arena uses styled-components for component styling, paired with a centralized theme system. This approach:

- Keeps styles co-located with components
- Enables dynamic styles based on props
- Provides type safety when used with TypeScript
- Follows a consistent theming approach

## Theme System

The theme is defined in `src/config/theme.js` and provides:

- Color palette
- Typography
- Spacing
- Border radius
- Shadows
- Animations
- Breakpoints
- Component-specific measurements

## Usage Guidelines

### 1. Basic Component Styling

```jsx
// Import styled and theme
import styled from 'styled-components';
import theme from '../config/theme';

// Create styled components
const Container = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.bgDeep};
  border-radius: ${theme.borderRadius.md};
`;

// Use in your component
const MyComponent = () => (
  <Container>
    <h1>My Component</h1>
  </Container>
);
```

### 2. Dynamic Styling with Props

```jsx
const Button = styled.button`
  background: ${props => props.primary ? 
    theme.gradients.accent : 
    theme.gradients.button};
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
`;

// Usage
<Button primary>Primary Button</Button>
<Button>Secondary Button</Button>
```

### 3. Extending Components

```jsx
const BaseButton = styled.button`
  // Base styles
`;

const PrimaryButton = styled(BaseButton)`
  // Additional styles
`;
```

### 4. Global Styles

Use the existing CSS variables from `cypher-theme.css` for global styling:

```jsx
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: ${theme.fonts.body};
    background: ${theme.gradients.main};
  }
`;
```

### 5. Responsive Design

```jsx
const ResponsiveContainer = styled.div`
  width: 100%;
  
  @media (min-width: ${theme.breakpoints.md}) {
    width: 50%;
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    width: 33%;
  }
`;
```

## Styling Patterns

### Component Structure

Organize styled components in this order:

1. Imports
2. Styled component definitions
3. Custom styles (if needed)
4. React component
5. Exports

### Naming Conventions

- Styled components: PascalCase (e.g., `ButtonContainer`)
- Props: camelCase (e.g., `isActive`, `hasError`)
- Theme values: camelCase (e.g., `theme.colors.accentPrimary`)

### Code Organization

For complex components:

1. Place styled components in a separate file:
   - `MyComponent.js` - React component
   - `MyComponent.styles.js` - Styled components

2. For simpler components, keep styled components in the same file.

## Example Components

Reference implementation examples:

- `SharedControls/StyledTimerControls.js` - Complex component with styled-components

## Migration Guidelines

When migrating from inline styles:

1. Create styled components for each visual element
2. Move inline styles to these components
3. Extract repeated values to the theme
4. Convert dynamic styles to props-based styling
5. Test visual appearance matches original

## Best Practices

- Avoid using inline styles except for highly dynamic values
- Keep styled components small and focused
- Use theme values for consistency
- Prefer component composition over complex styling logic
- Add comments for complex styling decisions