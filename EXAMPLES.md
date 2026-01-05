# Maintenance Tracker Card - Examples

This document contains ready-to-use examples for the Maintenance Tracker Card.

## Table of Contents

- [Installation](#installation)
- [Entity Configuration](#entity-configuration)
- [Card Examples](#card-examples)
  - [Plant Care](#1-plant-care)
  - [Appliance Maintenance](#2-appliance-maintenance)
  - [Car Maintenance](#3-car-maintenance)
  - [Pet Care](#4-pet-care)
  - [Health & Wellness](#5-health--wellness)
  - [Home Safety](#6-home-safety)
  - [Overdue Dashboard](#7-overdue-dashboard)
- [Configuration Options](#configuration-options)

---

## Installation

1. Copy `datetime-card.js` to your `www` folder in Home Assistant
2. Add the resource in your dashboard:
   ```yaml
   url: /local/datetime-card.js
   type: module
   ```

---

## Entity Configuration

Add these entities to your `configuration.yaml` file:

```yaml
input_datetime:
  # ============================================
  # PLANTS - Monstera
  # ============================================
  plant_monstera_water:
    name: Monstera - Water
    has_date: true
    has_time: false
  plant_monstera_fertilize:
    name: Monstera - Fertilize
    has_date: true
    has_time: false
  plant_monstera_prune:
    name: Monstera - Prune
    has_date: true
    has_time: false
  plant_monstera_repot:
    name: Monstera - Repot
    has_date: true
    has_time: false

  # ============================================
  # PLANTS - Other
  # ============================================
  plant_succulents_water:
    name: Succulents - Water
    has_date: true
    has_time: false
  plant_herbs_water:
    name: Herbs - Water
    has_date: true
    has_time: false
  plant_herbs_harvest:
    name: Herbs - Harvest
    has_date: true
    has_time: false

  # ============================================
  # HOME APPLIANCES
  # ============================================
  washer_filter_cleaning:
    name: Washer - Filter cleaning
    has_date: true
    has_time: false
  dishwasher_filter_cleaning:
    name: Dishwasher - Filter cleaning
    has_date: true
    has_time: false
  fridge_coil_cleaning:
    name: Fridge - Coil cleaning
    has_date: true
    has_time: false
  vacuum_filter_replacement:
    name: Vacuum - Filter replacement
    has_date: true
    has_time: false

  # ============================================
  # HVAC & AIR QUALITY
  # ============================================
  hvac_filter_change:
    name: HVAC - Filter change
    has_date: true
    has_time: false
  air_purifier_filter:
    name: Air Purifier - Filter replacement
    has_date: true
    has_time: false

  # ============================================
  # CAR MAINTENANCE
  # ============================================
  car_oil_change:
    name: Car - Oil change
    has_date: true
    has_time: false
  car_tire_rotation:
    name: Car - Tire rotation
    has_date: true
    has_time: false
  car_wash:
    name: Car - Wash
    has_date: true
    has_time: false

  # ============================================
  # PET CARE
  # ============================================
  pet_dog_vet_checkup:
    name: Dog - Vet checkup
    has_date: true
    has_time: false
  pet_dog_flea_treatment:
    name: Dog - Flea treatment
    has_date: true
    has_time: false
  pet_cat_litter_change:
    name: Cat - Litter change
    has_date: true
    has_time: false

  # ============================================
  # HEALTH & PERSONAL
  # ============================================
  health_medication_refill:
    name: Medication refill
    has_date: true
    has_time: false
  health_dentist_checkup:
    name: Dentist checkup
    has_date: true
    has_time: false
  health_eye_exam:
    name: Eye exam
    has_date: true
    has_time: false

  # ============================================
  # HOUSEHOLD SAFETY & MAINTENANCE
  # ============================================
  home_smoke_detector_test:
    name: Smoke detector test
    has_date: true
    has_time: false
  home_fire_extinguisher_check:
    name: Fire extinguisher check
    has_date: true
    has_time: false
  home_water_softener_salt:
    name: Water softener - Add salt
    has_date: true
    has_time: false
  home_trash_recycling:
    name: Trash & Recycling day
    has_date: true
    has_time: false
  home_clean_gutters:
    name: Clean gutters
    has_date: true
    has_time: false
```

After adding entities, restart Home Assistant.

---

## Card Examples

### 1. Plant Care

Track watering, fertilizing, pruning, and repotting schedules for your plants.

```yaml
type: custom:maintenance-tracker-card
title: Plant Care
entities:
  - id: input_datetime.plant_monstera_water
    frequency_days: 7
    icon: mdi:watering-can
  - id: input_datetime.plant_monstera_fertilize
    frequency_days: 30
    icon: mdi:sprout
  - id: input_datetime.plant_monstera_prune
    frequency_days: 90
    icon: mdi:scissors-cutting
  - id: input_datetime.plant_monstera_repot
    frequency_days: 730
    icon: mdi:flower
    friendly_name: "Monstera - Repot (every 2 years)"
  - id: input_datetime.plant_succulents_water
    frequency_days: 14
    icon: mdi:leaf
  - id: input_datetime.plant_herbs_water
    frequency_days: 3
    icon: mdi:sprout
  - id: input_datetime.plant_herbs_harvest
    frequency_days: 14
    icon: mdi:scissors-cutting
layout: horizontal
show_next_date: true
```

**Suggested Frequencies:**
- Water (most plants): 7 days
- Water (succulents): 14 days
- Water (herbs): 3 days
- Fertilize: 30 days
- Prune: 90 days
- Repot: 730 days (2 years)

---

### 2. Appliance Maintenance

Keep your home appliances running efficiently with regular filter cleanings and maintenance.

```yaml
type: custom:maintenance-tracker-card
title: Appliance Maintenance
entities:
  - id: input_datetime.washer_filter_cleaning
    frequency_days: 90
    icon: mdi:washing-machine
  - id: input_datetime.dishwasher_filter_cleaning
    frequency_days: 90
    icon: mdi:dishwasher
  - id: input_datetime.fridge_coil_cleaning
    frequency_days: 180
    icon: mdi:fridge
  - id: input_datetime.vacuum_filter_replacement
    frequency_days: 180
    icon: mdi:vacuum
  - id: input_datetime.hvac_filter_change
    frequency_days: 90
    icon: mdi:air-filter
  - id: input_datetime.air_purifier_filter
    frequency_days: 180
    icon: mdi:fan
layout: vertical
filter_overdue: true
show_next_date: true
```

**Suggested Frequencies:**
- Washer filter: 90 days (3 months)
- Dishwasher filter: 90 days (3 months)
- Fridge coils: 180 days (6 months)
- Vacuum filter: 180 days (6 months)
- HVAC filter: 90 days (3 months)
- Air purifier: 180 days (6 months)

---

### 3. Car Maintenance

Never miss an oil change or tire rotation again.

```yaml
type: custom:maintenance-tracker-card
title: Car Maintenance
entities:
  - id: input_datetime.car_oil_change
    frequency_days: 90
    icon: mdi:oil
    friendly_name: "Oil Change (every 3 months)"
  - id: input_datetime.car_tire_rotation
    frequency_days: 180
    icon: mdi:car
    friendly_name: "Tire Rotation (every 6 months)"
  - id: input_datetime.car_wash
    frequency_days: 14
    icon: mdi:car-wash
layout: horizontal
show_next_date: true
```

**Suggested Frequencies:**
- Oil change: 90 days (3 months) or based on mileage
- Tire rotation: 180 days (6 months)
- Car wash: 14 days (2 weeks)

---

### 4. Pet Care

Keep your furry friends healthy and happy.

```yaml
type: custom:maintenance-tracker-card
title: Pet Care
entities:
  - id: input_datetime.pet_dog_vet_checkup
    frequency_days: 365
    icon: mdi:dog
    friendly_name: "Dog - Annual Vet Checkup"
  - id: input_datetime.pet_dog_flea_treatment
    frequency_days: 30
    icon: mdi:paw
  - id: input_datetime.pet_cat_litter_change
    frequency_days: 7
    icon: mdi:cat
layout: horizontal
show_next_date: true
```

**Suggested Frequencies:**
- Vet checkup: 365 days (yearly)
- Flea treatment: 30 days (monthly)
- Litter change: 7 days (weekly)

---

### 5. Health & Wellness

Track personal health appointments and medication refills.

```yaml
type: custom:maintenance-tracker-card
title: Health & Wellness
entities:
  - id: input_datetime.health_medication_refill
    frequency_days: 30
    icon: mdi:pill
  - id: input_datetime.health_dentist_checkup
    frequency_days: 180
    icon: mdi:medical-bag
    friendly_name: "Dentist (every 6 months)"
  - id: input_datetime.health_eye_exam
    frequency_days: 730
    icon: mdi:medical-bag
    friendly_name: "Eye Exam (every 2 years)"
layout: horizontal
show_next_date: true
```

**Suggested Frequencies:**
- Medication refill: 30 days (monthly)
- Dentist: 180 days (6 months)
- Eye exam: 730 days (2 years)

---

### 6. Home Safety

Stay on top of important safety checks and maintenance tasks.

```yaml
type: custom:maintenance-tracker-card
title: Home Safety
entities:
  - id: input_datetime.home_smoke_detector_test
    frequency_days: 30
    icon: mdi:fire-extinguisher
  - id: input_datetime.home_fire_extinguisher_check
    frequency_days: 365
    icon: mdi:fire-extinguisher
    friendly_name: "Fire Extinguisher - Annual Check"
  - id: input_datetime.home_water_softener_salt
    frequency_days: 60
    icon: mdi:water
  - id: input_datetime.home_trash_recycling
    frequency_days: 7
    icon: mdi:recycle
  - id: input_datetime.home_clean_gutters
    frequency_days: 180
    icon: mdi:home
layout: horizontal
filter_overdue: true
show_next_date: true
```

**Suggested Frequencies:**
- Smoke detector test: 30 days (monthly)
- Fire extinguisher check: 365 days (yearly)
- Water softener salt: 60 days (2 months)
- Trash/recycling: 7 days (weekly)
- Clean gutters: 180 days (6 months, spring & fall)

---

### 7. Overdue Dashboard

Create a master dashboard that shows only overdue items from all categories.

```yaml
type: custom:maintenance-tracker-card
title: ⚠️ Overdue Maintenance
entities:
  # Plants
  - id: input_datetime.plant_monstera_water
    frequency_days: 7
    icon: mdi:watering-can
  - id: input_datetime.plant_monstera_fertilize
    frequency_days: 30
    icon: mdi:sprout

  # Appliances
  - id: input_datetime.washer_filter_cleaning
    frequency_days: 90
    icon: mdi:washing-machine
  - id: input_datetime.hvac_filter_change
    frequency_days: 90
    icon: mdi:air-filter

  # Car
  - id: input_datetime.car_oil_change
    frequency_days: 90
    icon: mdi:oil

  # Pet Care
  - id: input_datetime.pet_dog_flea_treatment
    frequency_days: 30
    icon: mdi:paw

  # Health
  - id: input_datetime.health_medication_refill
    frequency_days: 30
    icon: mdi:pill

  # Safety
  - id: input_datetime.home_smoke_detector_test
    frequency_days: 30
    icon: mdi:fire-extinguisher
layout: vertical
filter_overdue: true
show_next_date: false
```

This card will only show tasks that are overdue, making it perfect for your main dashboard!

---

## Configuration Options

### Global Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | - | Card header text |
| `layout` | `"horizontal"` \| `"vertical"` | `"horizontal"` | Card layout direction |
| `image_position` | `"start"` \| `"end"` | `"start"` | Image position (Left/Right or Top/Bottom) |
| `image` | string | - | URL or base64 image |
| `show_next_date` | boolean | `true` | Show/hide the actual date in status |
| `filter_overdue` | boolean | `false` | Only show overdue items |
| `debug` | boolean | `false` | Show debug information |

### Per-Entity Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | ✅ | The `input_datetime` entity ID |
| `frequency_days` | number | ✅ | How often the task repeats (in days) |
| `icon` | string | - | Custom MDI icon (e.g., `mdi:sprout`) |
| `friendly_name` | string | - | Override entity name |
| `show_next_date` | boolean | - | Per-entity override for showing dates |

### Available Icons

The icon autocomplete includes 35+ common icons:

**Plants:** `sprout`, `watering-can`, `flower`, `leaf`, `tree`, `scissors-cutting`

**Vehicles:** `car`, `car-wash`, `oil`

**Tools:** `wrench`, `tools`

**Home:** `home`, `home-circle`, `calendar`, `calendar-check`

**Health:** `pill`, `medical-bag`

**Utilities:** `water`, `filter`, `air-filter`, `vacuum`, `broom`, `washing-machine`, `lightbulb`, `battery`

**Waste:** `trash-can`, `recycle`

**Pets:** `dog`, `cat`, `paw`

**Safety:** `fire-extinguisher`, `hvac`, `fan`

**Appliances:** `fridge`, `dishwasher`, `stove`

---

## Tips & Tricks

### Click to Edit
Click on any row to open a dialog where you can:
- Mark as done today (quick button)
- Select a custom completion date (advanced option)

### Image Upload
In the card editor, you can:
- Enter an image URL, OR
- Upload an image file directly (converts to base64)
- Preview and remove images easily

### Frequency Suggestions

**Daily:** 1 day
**Twice weekly:** 3-4 days
**Weekly:** 7 days
**Bi-weekly:** 14 days
**Monthly:** 30 days
**Quarterly:** 90 days
**Semi-annually:** 180 days
**Yearly:** 365 days
**Every 2 years:** 730 days

### Color Coding
- **Green:** On schedule
- **Red:** Overdue

The progress bar fills as you approach the next due date.

---

## Need More Examples?

Feel free to mix and match entities to create custom cards for your specific needs:

- **Kitchen Maintenance:** Stove cleaning, coffee maker descaling, etc.
- **Outdoor Tasks:** Lawn mowing, pool cleaning, deck staining
- **Tech Maintenance:** Computer backups, router restarts, battery replacements
- **Seasonal Tasks:** A/C servicing, heater checkup, winterization

Happy tracking! 🎉
