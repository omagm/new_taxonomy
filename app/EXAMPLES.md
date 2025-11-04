# Data Structure Examples

This document provides concrete examples of how data is structured in the UMEX Taxonomy system.

## Category Example

```json
{
  "uid": "550e8400-e29b-41d4-a716-446655440000",
  "name": "perfect-binders",
  "label": {
    "en": "Perfect Binders",
    "de": "Klebebinder",
    "es": "Encuadernación Perfecta"
  },
  "internal_description": "Machines that bind books using adhesive",
  "parent_category_uid": null,
  "created_at": "2025-01-15T10:00:00.000Z",
  "updated_at": "2025-01-15T10:00:00.000Z"
}
```

## Specification Group Example

```json
{
  "uid": "660e8400-e29b-41d4-a716-446655440001",
  "name": "technical-data",
  "category_uid": "550e8400-e29b-41d4-a716-446655440000",
  "label": {
    "en": "Technical Data",
    "de": "Technische Daten",
    "es": "Datos Técnicos"
  },
  "internal_description": "Core technical specifications",
  "type": "Technical Details",
  "position_rank": 100,
  "created_at": "2025-01-15T10:05:00.000Z",
  "updated_at": "2025-01-15T10:05:00.000Z"
}
```

## Specification Examples

### Text Type
```json
{
  "uid": "770e8400-e29b-41d4-a716-446655440002",
  "name": "special-features",
  "specification_group_uid": "660e8400-e29b-41d4-a716-446655440001",
  "label": {
    "en": "Special Features",
    "de": "Besondere Merkmale"
  },
  "internal_description": "Any special or custom features",
  "required": false,
  "highlighted": false,
  "type": "Text",
  "type_options": {
    "max_length": 500
  },
  "position_rank": 10,
  "created_at": "2025-01-15T10:10:00.000Z",
  "updated_at": "2025-01-15T10:10:00.000Z"
}
```

### Boolean Plus Type
```json
{
  "uid": "880e8400-e29b-41d4-a716-446655440003",
  "name": "automatic-feeder",
  "specification_group_uid": "660e8400-e29b-41d4-a716-446655440001",
  "label": {
    "en": "Automatic Feeder",
    "de": "Automatischer Anleger"
  },
  "required": true,
  "highlighted": true,
  "type": "Boolean Plus",
  "type_options": {},
  "position_rank": 90,
  "created_at": "2025-01-15T10:12:00.000Z",
  "updated_at": "2025-01-15T10:12:00.000Z"
}
```

### Enum Plus Type
```json
{
  "uid": "990e8400-e29b-41d4-a716-446655440004",
  "name": "color-control-system",
  "specification_group_uid": "660e8400-e29b-41d4-a716-446655440001",
  "label": {
    "en": "Color Control System",
    "de": "Farbkontrollsystem"
  },
  "required": false,
  "highlighted": true,
  "type": "Enum Plus",
  "type_options": {
    "allow_multiple": false,
    "hide_name": false
  },
  "position_rank": 80,
  "created_at": "2025-01-15T10:15:00.000Z",
  "updated_at": "2025-01-15T10:15:00.000Z"
}
```

### Numerical Type
```json
{
  "uid": "aa0e8400-e29b-41d4-a716-446655440005",
  "name": "max-speed",
  "specification_group_uid": "660e8400-e29b-41d4-a716-446655440001",
  "label": {
    "en": "Maximum Speed",
    "de": "Maximale Geschwindigkeit"
  },
  "required": true,
  "highlighted": true,
  "type": "Numerical",
  "type_options": {
    "unit": "cycles/h",
    "min": 1000,
    "max": 20000,
    "num_type": "int"
  },
  "position_rank": 95,
  "created_at": "2025-01-15T10:18:00.000Z",
  "updated_at": "2025-01-15T10:18:00.000Z"
}
```

### Numerical Range Type (from/to)
```json
{
  "uid": "bb0e8400-e29b-41d4-a716-446655440006",
  "name": "thickness-range",
  "specification_group_uid": "660e8400-e29b-41d4-a716-446655440001",
  "label": {
    "en": "Thickness Range",
    "de": "Dickenbereich"
  },
  "required": true,
  "highlighted": false,
  "type": "Numerical Range",
  "type_options": {
    "unit": "mm",
    "min": 0.1,
    "max": 100,
    "num_type": "float",
    "range_type": "from_to"
  },
  "position_rank": 85,
  "created_at": "2025-01-15T10:20:00.000Z",
  "updated_at": "2025-01-15T10:20:00.000Z"
}
```

### Numerical Range Type (two_dimensional)
```json
{
  "uid": "cc0e8400-e29b-41d4-a716-446655440007",
  "name": "max-format",
  "specification_group_uid": "660e8400-e29b-41d4-a716-446655440001",
  "label": {
    "en": "Maximum Format",
    "de": "Maximalformat"
  },
  "required": true,
  "highlighted": true,
  "type": "Numerical Range",
  "type_options": {
    "unit": "cm",
    "num_type": "int",
    "range_type": "two_dimensional"
  },
  "position_rank": 98,
  "created_at": "2025-01-15T10:22:00.000Z",
  "updated_at": "2025-01-15T10:22:00.000Z"
}
```

## Enum Option Example

```json
{
  "uid": "dd0e8400-e29b-41d4-a716-446655440008",
  "name": "inpress-control",
  "specification_uid": "990e8400-e29b-41d4-a716-446655440004",
  "label": {
    "en": "InpressControl",
    "de": "InpressControl"
  },
  "internal_description": "Heidelberg inline color control system",
  "description": {
    "en": "Automated color measurement and adjustment during printing",
    "de": "Automatisierte Farbmessung und -anpassung während des Drucks"
  },
  "manufacturers_using": [],
  "created_at": "2025-01-15T10:25:00.000Z",
  "updated_at": "2025-01-15T10:25:00.000Z"
}
```

## Model Example

```json
{
  "uid": "ee0e8400-e29b-41d4-a716-446655440009",
  "name": "Kolbus KM 600",
  "category_uid": "550e8400-e29b-41d4-a716-446655440000",
  "manufacturer_uid": "ff0e8400-e29b-41d4-a716-446655440010",
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-15T10:30:00.000Z"
}
```

## Specification Preset Examples

### Category-Level Preset (Range)
```json
{
  "uid": "110e8400-e29b-41d4-a716-446655440011",
  "preset_level": "category",
  "preset_target_uid": "550e8400-e29b-41d4-a716-446655440000",
  "specification_uid": "aa0e8400-e29b-41d4-a716-446655440005",
  "allowed_values": {
    "type": "numerical",
    "numerical": {
      "constraint_type": "range",
      "min": 5000,
      "max": 15000
    }
  },
  "created_at": "2025-01-15T10:35:00.000Z",
  "updated_at": "2025-01-15T10:35:00.000Z"
}
```

### Model-Level Preset (Exact Value)
```json
{
  "uid": "220e8400-e29b-41d4-a716-446655440012",
  "preset_level": "model",
  "preset_target_uid": "ee0e8400-e29b-41d4-a716-446655440009",
  "specification_uid": "aa0e8400-e29b-41d4-a716-446655440005",
  "allowed_values": {
    "type": "numerical",
    "numerical": {
      "constraint_type": "exact",
      "exact": 7000
    }
  },
  "created_at": "2025-01-15T10:40:00.000Z",
  "updated_at": "2025-01-15T10:40:00.000Z"
}
```

### Enum Plus Preset (Multiple Options)
```json
{
  "uid": "330e8400-e29b-41d4-a716-446655440013",
  "preset_level": "category",
  "preset_target_uid": "550e8400-e29b-41d4-a716-446655440000",
  "specification_uid": "990e8400-e29b-41d4-a716-446655440004",
  "allowed_values": {
    "type": "enum_options",
    "enum_option_uids": [
      "dd0e8400-e29b-41d4-a716-446655440008",
      "dd0e8400-e29b-41d4-a716-446655440014"
    ]
  },
  "created_at": "2025-01-15T10:42:00.000Z",
  "updated_at": "2025-01-15T10:42:00.000Z"
}
```

### Boolean Plus Preset
```json
{
  "uid": "440e8400-e29b-41d4-a716-446655440015",
  "preset_level": "model",
  "preset_target_uid": "ee0e8400-e29b-41d4-a716-446655440009",
  "specification_uid": "880e8400-e29b-41d4-a716-446655440003",
  "allowed_values": {
    "type": "boolean",
    "boolean_value": "yes"
  },
  "created_at": "2025-01-15T10:45:00.000Z",
  "updated_at": "2025-01-15T10:45:00.000Z"
}
```

## Machine Example

```json
{
  "uid": "550e8400-e29b-41d4-a716-446655440016",
  "name": "Kolbus Perfect Binding Line with Dual Trimmers",
  "year_of_construction": 2018,
  "serial_number": "KM600-12345",
  "primary_model_uid": "ee0e8400-e29b-41d4-a716-446655440009",
  "status": "draft",
  "created_at": "2025-01-15T11:00:00.000Z",
  "updated_at": "2025-01-15T11:00:00.000Z"
}
```

## Machine Model Instances Example

```json
[
  {
    "uid": "660e8400-e29b-41d4-a716-446655440017",
    "machine_uid": "550e8400-e29b-41d4-a716-446655440016",
    "model_uid": "ee0e8400-e29b-41d4-a716-446655440009",
    "position": 0,
    "instance_label": null,
    "created_at": "2025-01-15T11:00:00.000Z",
    "updated_at": "2025-01-15T11:00:00.000Z"
  },
  {
    "uid": "770e8400-e29b-41d4-a716-446655440018",
    "machine_uid": "550e8400-e29b-41d4-a716-446655440016",
    "model_uid": "880e8400-e29b-41d4-a716-446655440019",
    "position": 1,
    "instance_label": "Front Trimmer",
    "created_at": "2025-01-15T11:05:00.000Z",
    "updated_at": "2025-01-15T11:05:00.000Z"
  },
  {
    "uid": "880e8400-e29b-41d4-a716-446655440020",
    "machine_uid": "550e8400-e29b-41d4-a716-446655440016",
    "model_uid": "880e8400-e29b-41d4-a716-446655440019",
    "position": 2,
    "instance_label": "Back Trimmer",
    "created_at": "2025-01-15T11:05:00.000Z",
    "updated_at": "2025-01-15T11:05:00.000Z"
  }
]
```

## Machine Specification Value Examples

### Text Value
```json
{
  "machine_model_instance_uid": "660e8400-e29b-41d4-a716-446655440017",
  "specification_uid": "770e8400-e29b-41d4-a716-446655440002",
  "value": {
    "text": {
      "en": "Machine raised by 50cm for ergonomic access",
      "de": "Maschine um 50cm erhöht für ergonomischen Zugang"
    }
  },
  "is_inherited": false,
  "created_at": "2025-01-15T11:10:00.000Z",
  "updated_at": "2025-01-15T11:10:00.000Z"
}
```

### Boolean Plus Value
```json
{
  "machine_model_instance_uid": "660e8400-e29b-41d4-a716-446655440017",
  "specification_uid": "880e8400-e29b-41d4-a716-446655440003",
  "value": {
    "boolean": "yes",
    "text": {
      "en": "Upgraded to high-capacity feeder in 2020"
    }
  },
  "is_inherited": true,
  "created_at": "2025-01-15T11:10:00.000Z",
  "updated_at": "2025-01-15T11:10:00.000Z"
}
```

### Enum Plus Value (Single)
```json
{
  "machine_model_instance_uid": "660e8400-e29b-41d4-a716-446655440017",
  "specification_uid": "990e8400-e29b-41d4-a716-446655440004",
  "value": {
    "boolean": "yes",
    "enum_option_uids": ["dd0e8400-e29b-41d4-a716-446655440008"]
  },
  "is_inherited": false,
  "created_at": "2025-01-15T11:12:00.000Z",
  "updated_at": "2025-01-15T11:12:00.000Z"
}
```

### Enum Plus Value (Multiple)
```json
{
  "machine_model_instance_uid": "770e8400-e29b-41d4-a716-446655440018",
  "specification_uid": "990e8400-e29b-41d4-a716-446655440021",
  "value": {
    "boolean": "yes",
    "enum_option_uids": [
      "aa0e8400-e29b-41d4-a716-446655440022",
      "bb0e8400-e29b-41d4-a716-446655440023"
    ]
  },
  "is_inherited": false,
  "created_at": "2025-01-15T11:15:00.000Z",
  "updated_at": "2025-01-15T11:15:00.000Z"
}
```

### Numerical Value
```json
{
  "machine_model_instance_uid": "660e8400-e29b-41d4-a716-446655440017",
  "specification_uid": "aa0e8400-e29b-41d4-a716-446655440005",
  "value": {
    "numerical": 7000
  },
  "is_inherited": true,
  "created_at": "2025-01-15T11:16:00.000Z",
  "updated_at": "2025-01-15T11:16:00.000Z"
}
```

### Numerical Range Value (from/to)
```json
{
  "machine_model_instance_uid": "660e8400-e29b-41d4-a716-446655440017",
  "specification_uid": "bb0e8400-e29b-41d4-a716-446655440006",
  "value": {
    "numerical_range": {
      "from": 0.5,
      "to": 60
    }
  },
  "is_inherited": false,
  "created_at": "2025-01-15T11:18:00.000Z",
  "updated_at": "2025-01-15T11:18:00.000Z"
}
```

### Numerical Range Value (two_dimensional)
```json
{
  "machine_model_instance_uid": "660e8400-e29b-41d4-a716-446655440017",
  "specification_uid": "cc0e8400-e29b-41d4-a716-446655440007",
  "value": {
    "numerical_range": {
      "a": 32,
      "b": 46
    }
  },
  "is_inherited": false,
  "created_at": "2025-01-15T11:20:00.000Z",
  "updated_at": "2025-01-15T11:20:00.000Z"
}
```

### Numerical Range Value (three_dimensional)
```json
{
  "machine_model_instance_uid": "770e8400-e29b-41d4-a716-446655440018",
  "specification_uid": "dd0e8400-e29b-41d4-a716-446655440024",
  "value": {
    "numerical_range": {
      "a": 10,
      "b": 20,
      "c": 30
    },
    "text": {
      "en": "Custom size configuration"
    }
  },
  "is_inherited": false,
  "created_at": "2025-01-15T11:22:00.000Z",
  "updated_at": "2025-01-15T11:22:00.000Z"
}
```
