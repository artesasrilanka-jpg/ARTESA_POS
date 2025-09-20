# POS System Design Guidelines

## Design Approach
**Utility-Focused Design System Approach**: Following Material Design principles for a professional, data-dense application prioritizing efficiency and learnability. POS systems require clear information hierarchy, fast interactions, and minimal visual distractions.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Primary: 219 85% 35% (Professional blue for primary actions)
- Surface: 220 13% 18% (Dark charcoal backgrounds)
- Background: 224 15% 12% (Deep navy for main background)

**Semantic Colors:**
- Success: 142 71% 45% (Transaction confirmations)
- Warning: 38 92% 50% (Low stock alerts)
- Error: 0 72% 51% (Error states)
- Info: 199 89% 48% (Information displays)

### Typography
**Font System:** Inter via Google Fonts
- Display: 600 weight for headers and totals
- Body: 400 weight for product names and general text
- Caption: 400 weight, smaller size for secondary information
- Mono: 'JetBrains Mono' for prices and transaction IDs

### Layout System
**Spacing Units:** Tailwind units of 2, 4, and 8 (p-2, h-8, m-4, etc.)
- Tight spacing (2) for compact data tables and form elements
- Medium spacing (4) for card padding and component separation
- Wide spacing (8) for major section breaks and modal padding

### Component Library

**Navigation:**
- Top navigation bar with company logo and essential controls
- Sidebar navigation for different POS modules (Sales, Inventory, Reports)
- Breadcrumb navigation for deep sections

**Data Display:**
- Product grid cards with image, name, price, and stock level
- Transaction tables with sortable columns
- Receipt preview panels with clear line items
- Dashboard widgets for key metrics

**Forms & Inputs:**
- Large touch-friendly buttons for product selection
- Numeric keypad for quantity and price entry
- Search bars with real-time filtering
- Form sections for product management

**Overlays:**
- Modal dialogs for transaction confirmation
- Sliding panels for cart review
- Toast notifications for system feedback
- Confirmation dialogs for critical actions

## Key Design Principles

1. **Touch-First Interface**: All interactive elements sized for finger taps (minimum 44px)
2. **Information Hierarchy**: Clear visual distinction between primary actions (checkout) and secondary functions
3. **Status Clarity**: Immediate visual feedback for all user actions and system states
4. **Efficiency Focus**: Minimize clicks/taps required for common workflows
5. **Consistent Dark Theme**: Maintain dark mode throughout for reduced eye strain during long shifts

## Specific POS Considerations

**Main Interface Layout:**
- Left panel: Product catalog with search and categories
- Center: Shopping cart with line items and totals
- Right panel: Customer information and payment processing
- Bottom bar: Quick access to common functions

**Transaction Flow:**
- Visual progress indicators for multi-step processes
- Large, prominent total displays
- Clear distinction between subtotal, tax, and final amounts
- Obvious "Complete Sale" primary action button

**Inventory Management:**
- Color-coded stock levels (green: good, yellow: low, red: out of stock)
- Quick edit capabilities with inline forms
- Bulk action capabilities for efficiency

## Responsive Behavior
Primary focus on tablet landscape orientation (1024x768) with desktop fallback. Mobile portrait as secondary consideration for basic inventory checks.