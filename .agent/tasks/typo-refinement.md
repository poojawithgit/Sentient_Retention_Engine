# Task: Typographic Refinement - Cyber-SOC Aesthetic

## Objective

Elevate the visual design of the Sentient-Retention Engine dashboard by implementing a high-contrast, professional typographic system.

## Design Commitment: TYPOGRAPHIC BRUTALISM

- **Geometry**: Sharp, industrial, and hyper-legible.
- **Typography**: 
  - **Body**: Inter (Hyper-legible for data)
  - **Headers**: Bebas Neue (Industrial, authoritative)
  - **Logs/Technical**: JetBrains Mono (Technical, monospaced)
- **Risk Factor**: Large, all-caps industrial headers that command attention.
- **Cliché Liquidation**: Removed the "Friendly SaaS" Plus Jakarta Sans and Space Grotesk.

## Phase 1: Infrastructure

- [ ] Update `index.html` with Google Fonts (Inter, Bebas Neue, JetBrains Mono).
- [ ] Update `tailwind.config.js` with new `fontFamily` tokens.
- [ ] Refactor `index.css` base layer and utility classes.

## Phase 2: Implementation
- [ ] Update `Dashboard.jsx` to use new typography classes.
- [ ] Update `DashboardComponents.jsx` (KPICard, EscalationCard, etc.).
- [ ] Audit all text elements for hierarchy consistency.

## Phase 3: Verification

- [ ] Run `ux_audit.py`.
- [ ] Verify accessibility (ARIA) and readability.
