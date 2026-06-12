# PRD – Points, Map Points & Frame Groups (Frames Inside a Frame)

## 1. Overview

UiGraph currently enables teams to:

- Create Maps to describe features, modules, services.
- Add Frames (screens/diagrams) inside a map.
- Add Focal Points on a frame to connect UI spots to implementation details (APIs, services, DB, tests, etc.).

**Customer ask (paraphrased):**

> When we upload a Figma frame that already contains nested screens or panels, we don’t want to create a whole new map with more frames. We want to define frames inside a frame. When we click the main frame, the right panel should show all context across those subframes, and we should be able to drill down to see context for an individual subframe.

Also support:

- Map-to-map navigation (drill-down)
- Figma-like flows from parts of a screen to other maps
- Clear handling of screen variants (LSM / Coverholder / TPA, etc.)

To achieve this, UiGraph will introduce:

- A generic **Point/Pin** concept
- **Map Points** – link UI regions to other maps
- **Frame Group Points** – define regions inside a frame holding multiple subframes/variants and aggregated context

There is no separate frame-level map link. Navigation and grouping are expressed via points.

---

## 2. Problem & Why It Matters

### 2.1 Figma frames with nested screens feel “flat” in UiGraph

Teams upload Figma frames that include:

- Main layout with panels
- Embedded modals or sheets
- Multiple nested screens or sections

Today:

- The export becomes a single Frame
- Modeling nested screens requires new maps and frames, or manual screenshot manipulation

This doesn’t reflect how designers structure work in Figma.

### 2.2 No fine-grained map-to-map linking

Example UI:

- “Question Sets” → Questionnaire
- “Contracts” → Contracts
- “Add User” → Invite User
- “Filters” → Search/Filters

There’s no native way to say: “this UI element links to that map”. Flow knowledge is stored outside UiGraph.

### 2.3 Context is fragmented across variants

Complex areas have multiple variants:

- Tabs: LSM / Coverholder / TPA / Unlisted
- States: empty, loading, error, success
- Devices: desktop vs mobile

If each variant is a separate frame:

- Maps clutter with similar frames
- Context fragments, no aggregated view

Customer ask:

> Clicking the main frame/group shows all focal points of subframes, and then allow focusing on a specific subframe.

---

## 3. Goals

- Support “frames inside a frame” without forcing new maps
- Provide precise UI-level map-to-map linking
- Allow aggregated and per-subframe context views
- Use one generic Point/Pin model
- Keep UX intuitive and Figma-like

---

## 4. Core Concepts

### 4.1 Maps

A Map is a collection of frames explaining a feature or domain. No change in base behavior.

### 4.2 Frames

A Frame is a screenshot/diagram inside a map, where Points are placed.

### 4.3 Points / Pins (generic concept)

A **Point/Pin** is an interactive marker on a frame.

Types:

- **Implementation Point**
  - Current Focal Point
  - Connects UI spot to architecture

- **Map Point**
  - Connects UI spot to another map
  - Used for flows

- **Frame Group Point**
  - Defines a rectangular region holding subframes/variants
  - Represents “frame inside a frame”

All points share placement, selection, and panel UI.

### 4.4 Map Points

Map Points express navigation from a specific UI element.

Behaviors:

- Created via “Add Map Point” → click location
- Right panel shows label, linked map, notes
- Clicking a Map Point opens the linked map with breadcrumbs
- Multiple Map Points allowed per frame

Mirrors Figma flows, integrated with backend context.

### 4.5 Frame Group Points

Frame Group Points define regions that act as nested screens.

#### 4.5.1 Creating a Frame Group Region

Flow:

- Upload Figma frame → one UiGraph frame
- Detect nested screens
- “Add Frame Group” → draw rectangle on region
- UiGraph creates a Frame Group Point (region + groupId)
- Single base state until subframes added

#### 4.5.2 Adding subframes/variants

Within a Frame Group:

- Add subframes for states/tabs/variants

Example subframes:

- LSM
- Coverholder
- TPA
- Unlisted

Options:

- Duplicate current view
- Upload new screenshot region

Each subframe:

- Shares groupId
- Has its own Implementation Points and Map Points

#### 4.5.3 Viewing Frame Groups

On main frame:

- Regions visible as overlays
- Clicking region:
  - Selects it
  - Shows subframe thumbnails
  - Switch variants inline
- Main screenshot stays visible; region becomes a mini viewer

---

## 6. Context View: Aggregated vs Specific

When selecting a Frame Group:

- Right-hand panel dedicated to the group

### 6.1 Scope selector

Options:

- All subframes
- Specific subframe

#### 6.1.1 All subframes

Shows aggregated context:

- All Implementation Points across:
  - All subframes
  - Points pinned to the group
- All Map Points across the same scope
- Tag each entry with its source state

Answers:

- “What architecture is used across all variants?”

#### 6.1.2 Specific subframe

Select a single subframe:

- Region renders that subframe
- Panel shows only its Implementation Points and Map Points

Answers:

- “What context exists for this exact state?”

---

## 7. Map-to-Map Navigation

Navigation uses only Map Points:

- No frame-level map links
- Click UI element → follow Map Point → open target map
- Breadcrumbs for navigation

Ensures:

- Navigation reflects real UI interactions
- Matches Figma prototypes
- Avoids overloaded frame behaviors

---

## 8. Non-Goals & Constraints

- No frame-level map link in v1
- No infinite nesting:
  - Groups contain subframes, no groups inside groups
- Points have a single type
- Frame Group lives in one frame
- Map Points link to exactly one map

---

## 9. Expected Impact

### For designers/product teams

- Upload a single Figma frame with nested screens
- Define Frame Group regions via rectangles
- Create subframes inside regions (variants)
- Create UI-level flows to maps
- See context aggregated or per-state

### For engineers

- Understand behavior across multiple states
- See APIs/services used across the area or per variant
- Follow real user journeys via UI spots

### Customer ask outcome

- Upload nested Figma frame
- Define Frame Group regions
- Add subframes (variants)
- Click region → see combined focal points and switch to specific context
- Map linking done via Map Points at region/subframe level
  `markdown`
