# hashicat-aws
Hashicat: A terraform built application for use in Hashicorp workshops

Includes "Meow World" website.

[![CircleCI](https://circleci.com/gh/hashicorp/hashicat-aws.svg?style=svg)](https://circleci.com/gh/hashicorp/hashicat-aws)

## Cricket Field Planner (interactive)
This repository now includes a standalone browser tool for planning custom cricket field settings.

### Run locally
```bash
cd cricket-field-tool
python3 -m http.server 4173
```

Then open `http://localhost:4173` in your browser.

### Features
- Click **preset buttons** for common setups (powerplay, defensive, attacking).
- **Double-click** on the field to place a fielder at the clicked location.
- **Drag markers** to adjust fielder positions.
- **Export/import JSON** to save and share field plans.

Amit
