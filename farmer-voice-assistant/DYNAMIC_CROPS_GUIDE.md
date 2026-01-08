# Dynamic My Crops Feature - Guide

## Overview

The "My Crops" section is now fully dynamic and uses real-time data from the backend API. It supports **any crop** (not just Wheat and Rice) and automatically fetches crop-specific information including growth stages, calendar, and recommendations.

## Features

### ✅ Dynamic Crop Support
- Works with **any crop name** (wheat, rice, maize, cotton, sugarcane, etc.)
- Automatically fetches crop information from backend API
- Falls back to generic stages for unknown crops

### ✅ Real-Time Updates
- **Pull-to-refresh**: Swipe down to refresh crop stages
- **Auto-refresh**: Updates when screen comes into focus
- **Manual refresh**: Tap refresh button in header
- Stages are recalculated based on current date and sowing date

### ✅ Smart Stage Calculation
- Automatically calculates current growth stage based on:
  - Sowing date
  - Current date
  - Crop-specific growth stages from API
- Shows next action and due date
- Handles edge cases (not sown yet, past harvest date)

### ✅ Comprehensive Crop Calendar
- Full crop calendar with all growth stages
- Stage-specific recommendations:
  - Actions to take
  - Fertilizers to apply
  - Irrigation schedule
  - Pest management tips
- Day-by-day timeline

## How It Works

### Backend API

**Endpoint**: `GET /crop-info/{crop_name}`

**Example**:
```bash
GET http://10.107.16.95:8000/crop-info/wheat
GET http://10.107.16.95:8000/crop-info/maize
GET http://10.107.16.95:8000/crop-info/tomato
```

**Response**:
```json
{
  "crop_name": "Wheat",
  "description": "Wheat is a staple food crop...",
  "stages": [
    {
      "name": "Sowing",
      "duration": 7,
      "actions": ["Prepare seed bed", "Basal fertilizer"],
      "fertilizers": ["DAP 50kg/acre", "Urea 25kg/acre"],
      "irrigation": "Light irrigation after sowing",
      "pest": ["Seed treatment"],
      "description": "Sow seeds at proper depth"
    },
    ...
  ],
  "total_duration": 102,
  "common_varieties": ["HD-2967", "HD-3086"]
}
```

### Supported Crops

The backend currently has detailed information for:
- **Wheat** - 6 stages, 102 days total
- **Rice** - 6 stages, 145 days total
- **Maize** - 6 stages, 125 days total
- **Cotton** - 6 stages, 167 days total
- **Sugarcane** - 5 stages, 280 days total

**Any other crop** will get generic 4-stage information automatically.

### Frontend Implementation

1. **Adding a Crop**:
   - User enters crop name (any name works!)
   - Frontend calls `/crop-info/{crop_name}` API
   - Fetches crop stages and calendar
   - Calculates current stage based on sowing date
   - Saves to local storage

2. **Viewing Crop Details**:
   - Tap on any crop card
   - Shows full crop calendar with all stages
   - Each stage shows:
     - Duration (days)
     - Day range (Day 1-7, Day 8-17, etc.)
     - Actions, fertilizers, irrigation, pest management
     - Target completion date

3. **Real-Time Updates**:
   - Stages are recalculated every time you view the screen
   - Pull down to manually refresh
   - Current stage updates based on days since sowing

## Usage

### Adding a New Crop

1. Tap the **+** button in header
2. Enter crop name (e.g., "Tomato", "Potato", "Onion")
3. Enter variety (optional)
4. Enter sowing date (YYYY-MM-DD format)
5. Enter land size and unit
6. Enter location (optional)
7. Tap **Save**

The app will:
- Fetch crop information from backend
- Calculate current stage
- Show next action and due date

### Refreshing Crop Data

**Method 1**: Pull to refresh
- Swipe down on the crop list
- Stages will be recalculated

**Method 2**: Refresh button
- Tap the refresh icon in header
- All crops will be updated

**Method 3**: Auto-refresh
- Stages update automatically when you open the screen

### Viewing Crop Calendar

1. Tap on any crop card
2. View complete crop calendar with:
   - All growth stages
   - Stage durations
   - Day-by-day timeline
   - Recommendations for each stage

## Adding New Crops to Backend

To add a new crop to the backend database, edit `backend/routers_crop_info.py`:

```python
"tomato": {
    "description": "Tomato is a popular vegetable crop",
    "common_varieties": ["Arka Vikas", "Pusa Ruby"],
    "stages": [
        {
            "name": "Nursery",
            "duration": 25,
            "actions": ["Prepare nursery", "Sow seeds"],
            "fertilizers": ["Compost"],
            "irrigation": "Keep moist",
            "pest": ["Watch for damping off"],
            "description": "Nursery stage"
        },
        # Add more stages...
    ]
}
```

Or create a JSON file at `backend/data/crop_database.json` with all crop data.

## API Endpoints

### Get Crop Information
```
GET /crop-info/{crop_name}
```

### List Available Crops
```
GET /crop-info/
```

Returns list of all crops in database with descriptions.

## Technical Details

### Caching
- Crop information is cached after first fetch
- Reduces API calls for same crop
- Cache persists during app session

### Error Handling
- If API fails, uses fallback generic stages
- Existing crop data is preserved
- User-friendly error messages

### Performance
- Parallel API calls for multiple crops
- Efficient caching mechanism
- Optimized stage calculations

## Future Enhancements

Possible improvements:
- [ ] Add more crops to database
- [ ] Weather-based stage adjustments
- [ ] Crop-specific disease alerts
- [ ] Integration with Smart Crop Advisor
- [ ] Export crop calendar as PDF
- [ ] Share crop information

## Troubleshooting

### Crop shows "Unknown" stage
- Check if crop name is spelled correctly
- Verify backend is running
- Check network connection
- Try refreshing manually

### Stages not updating
- Pull down to refresh
- Check if sowing date is correct
- Verify backend API is accessible

### Generic stages shown
- Crop not in database yet
- Backend will provide generic 4-stage calendar
- You can still track the crop

---

**Note**: The system works with any crop name. Even if detailed information isn't available, it will provide generic stages so you can still track your crop's progress!

