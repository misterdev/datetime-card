# Datetime Card

A minimalistic card for [Home Assistant](https://github.com/home-assistant/core) Lovelace UI which shows how many days it has been between any input_datetime and today.

Useful to remind you how many days it has been since you replaced your water filter or you watered your favoirite plants.

![chinese_money](https://raw.githubusercontent.com/a-p-z/datetime-card/main/images/chinese_money.png "Chinese money")

## Installation

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

Or you can download [datetime-card.js](https://github.com/a-p-z/datetime-card/releases/latest) to your `configuration/www` folder and add it as a resource:

1. Copy `datetime-card.js` to `/config/www/` directory
2. Go to **Settings → Dashboards → Resources** tab
3. Click **"+ Add Resource"**
4. Set URL: `/local/datetime-card.js`
5. Set Resource type: **JavaScript Module**
6. Click **Create**
7. Hard refresh your browser

## Configuration

- Open a dashboard in edit mode
- Click on add a card
- Search datetime-card
- Click on the card preview
- Use the visual or the code editor to configure your card, as below

![configuration](https://raw.githubusercontent.com/a-p-z/datetime-card/main/images/configuration.png "Configuration")

```yaml
type: custom:datetime-card
title: Chinese money
image: /local/plant_chinese_money.png
show_labels: false
layout: horizontal
entities:
  - id: input_datetime.plant_chinese_money_w
    threshold: 9
  - id: input_datetime.plant_chinese_money_m
    threshold: 5
  - id: input_datetime.plant_chinese_money_f
    threshold: 17
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | string | "Datetime Card" | Card header text |
| `image` | string | (demo image) | Optional image URL (e.g., `/local/plant.png`) |
| `layout` | `horizontal` \| `vertical` | `horizontal` | Card layout orientation |
| `reverse_order` | boolean | `false` | Reverse the layout direction |
| `mode` | `since` \| `until` | `since` | **since**: count days from last action. **until**: countdown to deadline |
| `show_months` | boolean | `false` | Format as "2 months, 3 days" instead of "63 days" |
| `show_labels` | boolean | `false` | Show entity names overlaid on progress bars |
| `filter_overdue` | boolean | `false` | Only show items that are overdue |
| `entities` | array | required | Array of datetime entities to track |

### Entity Configuration

Each entity in the `entities` array has:

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `id` | string | yes | The `input_datetime` entity ID |
| `threshold` | number | yes | Warning threshold in days |
| `friendly_name` | string | no | Override entity's friendly name |

### Mode Explanation

- **`mode: since`** (default): Track "days since last action"
  - Reset sets date to TODAY
  - Counts UP from 0
  - Bar turns red when days ≥ threshold
  - Example: "Water plants every 7 days" → shows "5 days since last watered"

- **`mode: until`**: Track "days until deadline"
  - Reset sets date to TODAY + threshold days
  - Counts DOWN to 0
  - Bar turns red when days ≥ 0 (overdue)
  - Example: "Filter expires in 90 days" → shows "15 days remaining"

## Actions

- reset date: just press and hold down the mouse button on the bar or on the days label to reset the entity to the current date.

Note: the script needs tailoring for 3 things:

- the token variable: assign a 'long lived token' (can be created via your profile in the UI)
- the dashboardUrl variable: define a working default for your setup (can always be overruled when calling the sevice)
- Change the hard coded notifier to one of yours
