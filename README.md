# Maintenance Tracker Card

A Home Assistant Lovelace card for tracking recurring maintenance tasks. Perfect for monitoring plant watering schedules, filter replacements, and any other periodic maintenance that needs attention.

This card helps you stay on top of routine tasks by showing how many days have passed since the last action or counting down to the next scheduled maintenance.

![maintenance tracker](https://raw.githubusercontent.com/misterdev/datetime-card/main/images/chinese_money.png "Maintenance Tracker")

## Installation

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

Or you can download [maintenance-tracker-card.js](https://github.com/misterdev/datetime-card/releases/latest) to your `configuration/www` folder and add it as a resource:

1. Copy `maintenance-tracker-card.js` to `/config/www/` directory
2. Go to **Settings → Dashboards → Resources** tab
3. Click **"+ Add Resource"**
4. Set URL: `/local/maintenance-tracker-card.js`
5. Set Resource type: **JavaScript Module**
6. Click **Create**
7. Hard refresh your browser

## Configuration

- Open a dashboard in edit mode
- Click on add a card
- Search maintenance-tracker-card
- Click on the card preview
- Use the visual or the code editor to configure your card, as below

![configuration](https://raw.githubusercontent.com/misterdev/datetime-card/main/images/configuration.png "Configuration")

```yaml
type: custom:maintenance-tracker-card
title: Plant Maintenance
image: /local/plant_chinese_money.png
layout: horizontal
entities:
  - id: input_datetime.plant_watering
    frequency_days: 7
    friendly_name: Water
  - id: input_datetime.plant_fertilizing
    frequency_days: 30
    friendly_name: Fertilize
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | "Maintenance Tracker Card" | Card header text |
| `image` | string | (demo image) | Optional image URL (e.g., `/local/plant.png`) |
| `layout` | `horizontal` \| `vertical` | `horizontal` | Card layout orientation |
| `image_position` | `start` \| `end` | `start` | Position of the image (before or after the list) |
| `filter_overdue` | boolean | `false` | Only show items that are overdue |
| `debug` | boolean | `false` | Show debug information below each row |
| `entities` | array | required | Array of datetime entities to track |

### Entity Configuration

Each entity in the `entities` array has:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | yes | The `input_datetime` entity ID |
| `frequency_days` | number | yes | How often this task should be done (in days) |
| `friendly_name` | string | no | Override entity's friendly name |
| `icon` | string | no | Custom MDI icon (e.g., `mdi:water`) |

## How It Works

The card displays each maintenance task with:
- **Progress bar**: Visual indicator showing time elapsed since last completion
- **Status text**: Shows "X days ago" and when the next maintenance is due
- **Color coding**: Green when on schedule, red when overdue

### Updating Tasks

Click on any task to open a dialog with two options:

1. **Quick "Done" button**: Marks the task as completed today (most common use case)
2. **Advanced mode**: Select a custom completion date if you completed it on a different day

## Setting Up Input DateTime Entities

Before using this card, you need to create `input_datetime` entities in Home Assistant. These entities store the last completion date for each task.

### Option 1: Via Configuration YAML

Add to your `configuration.yaml`:

```yaml
input_datetime:
  plant_watering:
    name: Last Watered
    has_date: true
    has_time: false

  plant_fertilizing:
    name: Last Fertilized
    has_date: true
    has_time: false

  filter_cleaning:
    name: Filter Cleaned
    has_date: true
    has_time: false
```

Then restart Home Assistant.

### Option 2: Via UI

1. Go to **Settings → Devices & Services → Helpers**
2. Click **"+ Create Helper"**
3. Select **"Date and/or time"**
4. Configure:
   - Name: e.g., "Last Watered"
   - Enable **Date** only (disable Time)
5. Click **Create**
6. Repeat for each maintenance task you want to track

## Credits

This card is a fork and enhancement of the original [datetime-card](https://github.com/a-p-z/datetime-card) by [a-p-z](https://github.com/a-p-z). Thank you for the original implementation!
