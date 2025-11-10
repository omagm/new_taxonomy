# Type Options Guide

This guide documents the enhanced type options functionality in the taxonomy editor.

## Overview

The editor now supports full editing of specification `type_options` based on the specification type. Type options are additional configuration parameters that control how each specification type behaves.

## Type Options by Specification Type

### 1. Text Type
**Options:**
- `max_length` (number, optional) - Maximum character length for text input

**Example:**
```json
{
  "type": "Text",
  "type_options": {
    "max_length": 500
  }
}
```

### 2. Boolean Plus Type
**Options:**
- None - This type has no additional options

**Example:**
```json
{
  "type": "Boolean Plus",
  "type_options": {}
}
```

### 3. Enum Type
**Options:**
- `allow_multiple` (boolean, default: false) - Whether multiple enum options can be selected
- `hide_name` (boolean, default: false) - Whether to hide the specification name and show only the enum value

**Example:**
```json
{
  "type": "Enum",
  "type_options": {
    "allow_multiple": true,
    "hide_name": false
  }
}
```

### 4. Enum Plus Type
**Options:**
- `allow_multiple` (boolean, default: false) - Whether multiple enum options can be selected
- `hide_name` (boolean, default: false) - Whether to hide the specification name and show only the enum value

**Example:**
```json
{
  "type": "Enum Plus",
  "type_options": {
    "allow_multiple": false,
    "hide_name": true
  }
}
```

### 5. Numerical Type
**Options:**
- `unit` (string, optional) - Display unit (e.g., "cm", "mm", "sheets/hour") or "nameAsUnit" to use spec name as unit
- `min` (number, optional) - Minimum allowed value
- `max` (number, optional) - Maximum allowed value
- `num_type` (enum: "float" | "int", default: "float") - Whether to accept decimals or integers only

**Example:**
```json
{
  "type": "Numerical",
  "type_options": {
    "unit": "mm",
    "min": 0,
    "max": 1000,
    "num_type": "float"
  }
}
```

### 6. Numerical Range Type
**Options:**
- `range_type` (enum: "from_to" | "two_dimensional" | "three_dimensional", required) - Type of range:
  - `from_to`: Single range (e.g., "10-50cm")
  - `two_dimensional`: 2D dimensions (e.g., "14x40cm")
  - `three_dimensional`: 3D dimensions (e.g., "10x20x30cm")
- `unit` (string, optional) - Display unit (e.g., "cm", "mm")
- `min` (number, optional) - Minimum allowed value
- `max` (number, optional) - Maximum allowed value
- `num_type` (enum: "float" | "int", default: "float") - Whether to accept decimals or integers only

**Example:**
```json
{
  "type": "Numerical Range",
  "type_options": {
    "range_type": "two_dimensional",
    "unit": "cm",
    "min": 0,
    "max": 500,
    "num_type": "float"
  }
}
```

## Using the Editor

### Creating/Editing Specifications

1. Navigate to a specification group in the tree
2. Click "Edit" on an existing specification or "+ Specification" to create new
3. Select the specification type from the dropdown
4. The **Type Options** section will automatically display relevant options for that type
5. Configure the type options as needed
6. Click "Save" to persist changes

### Dynamic Form Behavior

- When you change the specification type, the form automatically shows/hides relevant type option fields
- Only options applicable to the selected type are displayed
- All changes are validated before saving

### Viewing Type Options

In the specifications table, a new "Type Options" column displays a summary of configured options:
- Text: `max: 500`
- Enum/Enum Plus: `multiple, hide name`
- Numerical: `unit: mm, min: 0, max: 1000, float`
- Numerical Range: `two_dimensional, unit: cm, min: 0, max: 500, float`

## Implementation Details

### Files Modified

1. **app.js**:
   - Enhanced `generateFormFields()` to include type-specific option fields
   - Added event listener in `showEditModal()` to handle type changes
   - Updated `handleFormSubmit()` to construct `type_options` object
   - Added `renderTypeOptions()` to display options in table

2. **styles.css**:
   - Added `.type-options-section` styling
   - Added `.type-option-group` styling
   - Added `.type-option-note` styling
   - Added `.form-group small` styling for help text

3. **index.html** (no changes needed):
   - Modal structure already supports dynamic form fields

### Data Flow

1. **Loading**: Existing `type_options` are read from JSON and displayed in form
2. **Editing**: User modifies type and/or type options in modal
3. **Validation**: Form validates required fields and types
4. **Saving**: `handleFormSubmit()` constructs proper `type_options` object
5. **Persistence**: Server saves complete specification with `type_options` to JSON

### Schema Compliance

All type options now fully comply with the schema definitions in `/schemas/specification.schema.ts`:
- `TextTypeOptionsSchema`
- `BooleanPlusTypeOptionsSchema`
- `EnumPlusTypeOptionsSchema`
- `NumericalTypeOptionsSchema`
- `NumericalRangeTypeOptionsSchema`

## Testing

To test the implementation:

1. Access the editor at http://localhost:5001
2. Create/edit specifications with different types
3. Verify type options fields appear/disappear when changing type
4. Save specifications and verify `type_options` are persisted in JSON
5. Refresh page and verify options are loaded correctly
6. Check specifications table shows type options summary

## Future Enhancements

Possible improvements:
- Add preset defaults for common configurations
- Add validation messages for min/max ranges
- Add visual preview of how spec will be rendered with current options
- Add batch editing of type options for multiple specs
