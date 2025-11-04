
# 1. Intro

## Executive Summary

**This document defines a complete taxonomy and relational data model for classifying and managing machines in umex. It introduces a structured, standardized, and hierarchical system for categories, models, specifications, and actual machines. The system replaces a our legacy model by enabling clear data consistency, flexible modeling of multi-machine setups, and efficient data entry through preset inheritance and and new data types.**

### Core Concept

Within each category, Specification Groups organize related Specifications, which define measurable or selectable machine attributes. Specifications can be of multiple data types (text, boolean, enum, numerical) and support multilingual values.

Specification Presets define allowed or default values either at the Category or Model level. This ensures accurate defaults for each machine type and enforces value consistency across all machines of the same class. Presets define either exact values or allowed options.

A machine always has one Primary Model and may include multiple secondary Model Instances (like trimmers). This supports complex production lines composed of multiple models. Each instance holds its own Specification Values, which helps grouping specs by sub machines.

The database design combines relational integrity (for categories, models, and relations) with JSONB flexibility (for multilingual and variable spec values). 


## Motivation
The new system to define the specs of our machines is introduced to fix the problems of the old system. 

|        Old System            |     New System      |
|------------------------------|---------------------|
| Everyone can edit spec tree  |  Only Admins will have access |
| No prefilling based on model, only copy from old machines | Prefilling based on model presets |
| No validation on fields | Most fields can only have a preselected set of values |
| No distinction between required and optional fields | Clear distinction between required and optional fields |
| No support for multi-machine setups | Support for multi-machine setups via multiple model instances |
| Only Boolean and Free Text spec types | New spec types: Boolean Plus, Enum Plus, Numerical, Numerical Range |
| No distinction between Boolean "No" and unset | Boolean Plus type distinguishes "yes", "no", and unset |



# 2. Terminology



**CATEGORY:** 

A category is a certain type of machines which do the same thing, even if they are from differnet manufacturers and different generations. The categories should all be mutually exclusive and collectively exhaustive. 

```Example: Guillotine Cutting Machines```

----
**SPECIFICATION GROUP:** 

A set of specifications with a title and some meta data about the spec group, e.g. specificaiton group type (equipment, technical data)

```Examples: Cutting Specifications, Automation Features ```

----
**SPECIFICATION:** 

An attribute which can take certain values, depending on category, model and first and foremost the actual machine. There are different specificaiton types outlined further below. A specification also has meta data that describes the behavior of the specifcation e.g. the role of that specification, e.g. whether it's something to be highlighted, whether one should be able to filter by that specification etc, whether it's a required spec or an optional one etc.

```Example: Knife Length```

----
**ENUM OPTIONS:** 

Are the possible values for enum-based specifications. Each enum option belongs to exactly one specification.

```Example: For specification "Color Control System", enum options could be "InpressControl", "SpectroControl", "None" ```

----
**SPECIFICATION PRESET:** 

Defines the allowed values and constraints for a specification value at either the category level (applies to all models in that category) or at the model level (applies to one specific model). Model-level presets override category-level presets when both exist for the same specification.

```Example: For specification "Max Speed", category preset for "Perfect Binders" might allow range 5000-20000 cycles/h, while model preset for "Kolbus KM 600" sets exact value 7000 cycles/h```

----
**MACHINE MODEL:** 

Each Machine Model belongs to a certain Category and has a set of specification presets that define default values and constraints for the specifications. 

```Example: "Kolbus KM 600" is a Machine Model in the "Perfect Binders" category```

----
**MACHINE:** 

A machine describes an actual machine with year of construction, serial number, location, owner etc. Its technical description is based on the model it belongs to. Some properties are directly inherited from the model (standard equipment) while optional properties have to be explicitly chosen when creating the record for that machine. The category defines the scope of possible specifications and the model the scope of possible values it can take. Some machines consist of lines with one primary machine and some periphery or auxiliary machines. These "secondary" machines are also connected to a respective model.

```Example: A specific "Kolbus KM 600" machine with serial number "KM600-12345" built in 2018 owned by "PrintCo" located in "Berlin"```

----
**MACHINE MODEL INSTANCE:** 

A specific occurrence of a machine model as part of a complete machine (or machine line). A machine has at least one machine model instance (primary model) and in some cases additional instances (secondaries). The same model can appear multiple times on one machine (e.g., two identical trimmers), and each instance can have different specification values. 

```Example: A machine line with primary model "Kolbus KM 600" and two secondary instances of model "Kolbus HD 153" (front and back trimmers)```

----
**MACHINE SPECIFICATION VALUE:**

The actual specification value for a machine and its specific machine model instance. These values are constrained by the specification presets defined at the category or model level. When a machine model instance is created, ALL applicable specification values are automatically populated from presets (if there is exactly 1 default value). Users can then override any inherited value.
```Example: For the primary model instance "Kolbus KM 600", the "Max Book Thickness" spec value might be 5cm (inherited from model preset). For a secondary trimmer instance "Kolbus HD 153", the "Automatic Cutting System" spec value might be Enum "AutoCut II"```

# 3. Relations

## Core Structure Relations:
- Each **Category** has 1 or more **Specification Groups**
- Each **Specification** belongs to one **Specification Group**
- Each **EnumOption** belongs to exactly one **Specification** (for Enum Plus type specs)
- Each **Machine Model** belongs to one **Category**

## Specification Preset Relations:
- **Specification Presets** can be defined at two levels:
  - **Category Level**: One preset per specification per category (applies to all models in that category)
  - **Model Level**: One preset per specification per model (applies to one specific model only)
- When both category and model presets exist for the same specification, the **model preset takes precedence**

## Machine & Instance Relations:
- Each **Machine** has one **Primary Model** (stored directly on the Machine record for fast access to category/manufacturer)
- A **Machine-Model pivot table** tracks all model instances (primary + secondaries):
  - This allows multiple instances of the same model (e.g., two identical trimmers)
  - Each instance has a unique instance ID and position
  - The primary model instance is identified by matching model_uid with machines.primary_model_uid
- **Machine Specification Values** are stored per machine-model instance (not per machine):
  - This allows duplicate models to have different spec values
  - Each value references a specific instance via machine_model_id
  - Values are constrained by specification presets (category or model level)
  - **Hybrid storage approach**: When a machine model instance is created, specification values are only materialized if the preset defines exactly one default value (e.g., exact numerical value, single enum option). If the preset allows choices or ranges, no row is created until the user explicitly sets a value.



## Example:
```
CATEGORY: "Perfect Binders"
├── MODEL: Kolbus KM 600
│   ├── id: 1
│   └── category_id: 1
│
└── SPECIFICATION_GROUPS:
    ├── "Technical Data"
    │   ├── Max book thickness: 60mm
    │   ├── Min book size: 105 x 148mm
    │   ├── Max book size: 320 x 460mm
    │   └── Production speed: up to 450 cycles/h
    │
    └── "Equipment"
        ├── Hot melt adhesive system
        └── Spine preparation unit

─────────────────────────────────────────

CATEGORY: "Three-Knife Trimmers"
├── MODEL: Kolbus HD 153
│   ├── id: 2
│   └── category_id: 2
│
└── SPECIFICATION_GROUPS:
    ├── "Technical Data"
    │   ├── Max trimming height: 60mm
    │   ├── Cutting width: 530mm
    │   └── Trimming accuracy: ±0.1mm
    │
    └── "Features"
        ├── Three-sided trimming
        └── Hydraulic clamp

═════════════════════════════════════════

MACHINE: "Kolbus Perfect Binding Line with Dual Trimmers"
│
├── MACHINE (record):
│   ├── uid: "machine-123"
│   ├── name: "Kolbus Perfect Binding Line with Dual Trimmers"
│   └── primary_model_uid: 1 (Kolbus KM 600)  ← Stored for fast access to category/manufacturer
│
├── MACHINE_MODELS (pivot table - tracks all instances):
│   ├─► instance_id: "inst-1" → model_uid: 1 (KM 600),  position: 0
│   ├─► instance_id: "inst-2" → model_uid: 2 (HD 153),  position: 1, label: "Front Trimmer"
│   └─► instance_id: "inst-3" → model_uid: 2 (HD 153),  position: 2, label: "Back Trimmer"
│
│       ↑ Note: Same model (HD 153) appears twice with different instances
│
└── MACHINE_SPECIFICATION_VALUES:
    ├── Perfect Binder (inst-1) specs:
    │   ├── Max Speed: 450 cycles/h
    │   └── Format: 320x460mm
    │
    ├── Front Trimmer (inst-2) specs:
    │   ├── Max Speed: 450 cycles/h  ← Different from back trimmer
    │   └── Cutting Width: 530mm
    │
    └── Back Trimmer (inst-3) specs:
        ├── Max Speed: 380 cycles/h  ← Different from front trimmer
        └── Cutting Width: 530mm
```
 


# 4. Category

## Data Model
- **UID** auto-generated unique id
- **Name:** The internal name of the Category
- **Label:** Multlingual naming object, e.g.  ```{en: "Perfect Binder", de: "Klebebinder", es:"Encuadernación Perfecta"}```
- **Internal Description:** Not public description of the meaning of that category
- **Parent Category:** UID of parent category
- **Alternative Parent Category:** UID of other parent category where the category can also be found like a link (optional)
- **Position Rank:** INT, The larger the value the higher the Spec Group will be positioned (defaults to zero)
- **Is Meta Category:** Boolean, whether this category is just a meta category to group sub-categories (is not rendered in the menu)

## Relations:
- has Many Specification Groups
- has Many Models

# 5. Specification Group

## Data Model
- **UID** auto-generated unique id
- **Name:** The internal name of the Category
- **Category UID:** The UID of the Category this Spec Group belongs to
- **Label:** Multlingual naming object, e.g.  ```{en: "Feeder", de: "Anleger", es:"Marcador"}```
- **Internal Description:** Not public description of the meaning of that category
- **Type:** ENUM["Equipment", "Technical Details"]
- **Position Rank:** INT, The larger the value the higher the Spec Group will be positioned

## Relations:
- has One Category
- has Many Specifications

# 6. Specification

## Data Model
- **UID** auto-generated unique id
- **Name:** The internal name of the Category
- **Label:** Multlingual naming object, e.g.  ```{en: "Feeder", de: "Anleger", es:"Marcador"}```
- **Internal Description:** Not public description of the meaning of that category
- **Required:** Boolean, whether this spec must be filled out prior to publishing the machine or not (in draft it's ignored)
- **Highlighted:** Boolean, whether this spec is to be highlighted in preview of machine
- **RegExp Pattern:** A pattern used to auto-detect the value when trying to crawl the information of a machine 
- **Type**: The types for the values the spec can take.
- **Type Options:** Object containing options depending on the type of the spec (see table below)
- **Position Rank:** INT, The larger the value the higher the Spec Group will be positioned

## Relations:
- has One Specification Group

## The different Specification Types
| Type | Options | Description | Example |
|------|------|-------|------|
| Text | MaxLength | Multilingual text | ```Details of Machine Elevation: {en: "Machine raised by 50cm", de: "Maschine um 50cm erhöht", es: "Máquina elevada por 50cm"}``` |
| Boolean Plus | | Take value "yes" or "no". If no not shown but system knows that spec has a value (important for check of mandatory fields) | ```Blanking: ["Yes"]``` |
| Enum | AllowMultiple (default false), hideName (shows Enum Value only) | Holds one or more enum value. | ```Inline Color Control: ["Yes"] or "Inline Color Control: ["Yes", "InpressControl"] or "Thickness Control: ["Yes", "Mechanical Thickness Control", "Ultrasonic Thickness Control"] or Automatic Washing: ["No"] or Auaomatic Washing: ["Undefined"]``` |
| Enum Plus | AllowMultiple (default false), hideName (shows Enum Value only) | Can either take the value "yes", or "yes"+enum(s) or "no" and in addition it usually holds one or more enum value. Rule | ```Inline Color Control: ["Yes"] or "Inline Color Control: ["Yes", "InpressControl"] or "Thickness Control: ["Yes", "Mechanical Thickness Control", "Ultrasonic Thickness Control"] or Automatic Washing: ["No"] or Auaomatic Washing: ["Undefined"]``` |
| Numerical | Unit (Enum: cm, mm, sheets / hour, nameAsUnit), min, max, numType (float/int) | Can take a Float value | ```Max Thickness (mm): 0.2``` or if nameAsUnit and the Name is e.g. "Print Units" than the value 3 would render as ```3x Print Units``` |
| Numerical Range | like Numerical + RangeType (from/to or two-dimensional, three-dimensional) | Like Numerical but takes 2 or 3 values to indicate a numerical range or n-dimensional dimension | ```Format Range (cm): {min: 10, max: 50} renders as "10-50cm" or Book Dimension Max (cm): {a: 14, b: 40} renders as "14x40cm"``` |

## Note
we might want to add a flag disabled, so that when we delete a spec the old machines still have the value and can render them but in the forms of creating new machiens the spec does not show.

# 7. EnumOptions

## Data Model 
- **Name:** The internal name of the EnumOption which also serves as unique id
- **Label:** Multlingual naming object
- **Internal Description:** Not public description of the meaning of that EnumOption
- **Description:** Multilingual description object
- **Manufacturers Using This EnumOption:** List of manufacturer UIDs using this EnumOption (if empty, it means all manufacturers can use it)
- **Specification UID:** The UID of the Specification this EnumOption belongs to

# 8. Machine Model
## Data Model
- **UID** auto-generated unique id
- **Name:** The internal name of the Machine Model
- **Category UID:** The UID of the Category this Model belongs to

## Relations:
- has One Category
- has Many SpecificationPresets 

## Note
When rendering the Spec Groups for a certain machine model it should not only load the spec groups from the category it belongs to but also inherit the categories from the parent category recursively.

# 9. Specification Preset
## Data Model
- **UID:** auto-generated unique id
- **Preset Level:** ENUM["category", "model"] - Specifies whether this preset applies at category or model level
- **Preset Target UID:** UUID - The UID of either the Category or the Machine Model (depending on preset_level)
- **Specification UID:** The UID of the Specification this preset belongs to
- **Allowed Values:** JSONB object that describes the allowed values for this spec, depending on the type of the spec
- **Created At:** Timestamp
- **Updated At:** Timestamp

## Allowed Values Structure:
```
{
  uid: string,
  preset_level: "category" | "model",
  preset_target_uid: string,    // UID of category or model
  specification_uid: string,

  allowed_values: {
    type: "enum_options" | "boolean" | "numerical" | "numerical_range",
    
    // For Enum(Plus) specs
    enum_option_uids?: string[],  // if length=1 → default, if >1 → choices
    
    // For BooleanPlus specs  
    boolean_value?: "yes" | "no" | "any",
    
    // For Numerical specs
    numerical?: {
      constraint_type: "exact" | "range" | "set",
      exact?: number,
      min?: number,
      max?: number,
      set?: number[]
    },
    
    // For NumericalRange specs
    numerical_range?: {
      range_type: "from_to" | "two_dimensional" | "three_dimensional",
      constraint_type: "exact" | "range" | "set",
      
      // For from_to ranges (e.g., "10-50cm")
      exact?: { from: number, to: number },
      min?: { from: number, to: number },
      max?: { from: number, to: number },
      set?: Array<{ from: number, to: number }>,
      
      // For dimensional ranges (e.g., "14x40cm" or "10x20x30cm")
      exact_2d?: { a: number, b: number },
      min_2d?: { a: number, b: number },
      max_2d?: { a: number, b: number },
      set_2d?: Array<{ a: number, b: number }>,
      
      exact_3d?: { a: number, b: number, c: number },
      min_3d?: { a: number, b: number, c: number },
      max_3d?: { a: number, b: number, c: number },
      set_3d?: Array<{ a: number, b: number, c: number }>
    }
  }
}
```

## Relations:
- belongs to One Category OR One Machine Model (determined by preset_level and preset_target_uid)
- belongs to One Specification (via specification_uid)

## Constraints:
- UNIQUE(preset_level, preset_target_uid, specification_uid) - One preset per specification per category/model
- preset_level must be either 'category' or 'model'
- preset_target_uid must reference a valid category or model (depending on preset_level)

## Preset Levels:

### Category-Level Preset
```
preset_level: "category"
preset_target_uid: "perfect-binders-uid"
specification_uid: "max-speed-uid"
allowed_values: {
  numerical: {
    constraint_type: "range",
    min: 5000,
    max: 20000
  }
}
```
Applies to ALL models in the "Perfect Binders" category.

### Model-Level Preset
```
preset_level: "model"
preset_target_uid: "kolbus-km600-uid"
specification_uid: "max-speed-uid"
allowed_values: {
  numerical: {
    constraint_type: "exact",
    exact: 7000
  }
}
```
Applies only to the "Kolbus KM 600" model.

## Precedence Rules:

When creating a machine or validating specification values, presets are applied in this order:

1. **Gather all applicable presets:**
   - Get category-level presets for the model's category
   - Get model-level presets for the specific model

2. **Apply precedence:**
   - If both category and model presets exist for the same specification: **Model preset takes precedence** (category preset is ignored)
   - If only category preset exists: Use category preset
   - If only model preset exists: Use model preset

3. **Combine constraints:**
   - All presets (after precedence) are applied
   - A machine must satisfy ALL applicable preset constraints
  


# 10. Machine
## Data Model
- **UID** auto-generated unique id
- **Name:** The internal name of the Machine
- **Year of Construction:** INT
- **Serial Number:** STRING
- .. some other attributes that are not relevant at this point e.g. Owner, Location etc 
- **Primary Model UID:** UID of primary Machine Model this machine consists of (stored for fast access to category and manufacturer information)
- **Status:** ENUM["draft", "published"] - Machines can be saved as drafts with incomplete specs, but all required specs must be filled before publishing

## Relations:
- has One Primary Machine Model (via primary_model_uid)
- has Many Model Instances (via machine_models pivot table) - includes primary and all secondary models
- has Many Specification Values (via machine_specification_values) - one value per model instance per specification

## Notes:
- The primary_model_uid is stored directly on the Machine record for performance (quick access to category/manufacturer without joins)
- All model instances (including the primary) are also tracked in the machine_models pivot table
- This dual approach allows fast queries by category while supporting multiple instances of the same secondary model


# 11. Machine Models Instances 
## Data Model
- **ID (Instance ID):** auto-generated unique id - represents a specific instance of a model on a machine
- **Machine UID:** UID of the Machine this model instance belongs to
- **Model UID:** UID of the Machine Model
- **Position:** INT - Defines the display order/position (0, 1, 2, 3...) - purely for ordering, no semantic meaning
- **Instance Label:** VARCHAR (optional) - User-defined label for this instance (e.g., "Front Trimmer", "Back Trimmer")
- **Created At:** Timestamp
- **Updated At:** Timestamp

## Relations:
- belongs to One Machine
- belongs to One Machine Model
- has Many Specification Values (via machine_specification_values)

## Constraints:
- UNIQUE(machine_uid, position) - Each position must be unique per machine

## Identifying Primary vs Secondary:
- The primary model instance is identified by matching `model_uid` with `machines.primary_model_uid`
- All other instances are secondary models
- Position is purely for display order and has no relation to primary/secondary status

## Purpose:
This pivot table enables:
1. Multiple instances of the same model on one machine (e.g., two identical trimmers)
2. Each instance can have different specification values
3. Maintains order/position of models in the machine line


## Example:
```
Machine "Binding Line ABC" (machines.primary_model_uid = KM600) has:
- Instance 1: model_uid: KM 600, position: 0  ← Primary (matches machines.primary_model_uid)
- Instance 2: model_uid: HD 153, position: 1, label: "Front Trimmer"  ← Secondary
- Instance 3: model_uid: HD 153, position: 2, label: "Back Trimmer"  ← Secondary

Note: Instances 2 and 3 use the same model (HD 153) but are separate instances
with different specification values (e.g., different max speeds).
```

 
# 12. Machine Specification Values
## Data Model
- **Machine Model ID:** UID of the machine_models record (the specific instance) - this is the foreign key to the pivot table, not to the model itself
- **Specification UID:** UID of the Specification
- **Value:** JSONB - The actual specification value, structure depends on the specification type (Text, Boolean Plus, Enum, Enum Plus, Numerical, Numerical Range). All Specs can take in addition to their values a text in multiple languages to further describe the value, however, that text is inside the Value object.

## Relations:
- belongs to One Machine Model Instance (via machine_model_id)
- belongs to One Specification (via specification_uid)

## Primary Key:
- Composite: (machine_model_id, specification_uid)
- This ensures one value per specification per model instance

## Value Structure Examples:

### Text Type:
```json
{
  "text": {
    "en": "Machine raised by 50cm",
    "de": "Maschine um 50cm erhöht",
    "es": "Máquina elevada por 50cm"
  }
}
```

### Boolean Plus Type:
```json
{
  "boolean": "yes",
  "text": {
    "en": "Added as retrofit",
    "de": "Als Retrofit hinzugefügt"
  }
}
```

### Enum Type (single):
```json
{
  "enum_option_uids": ["inpress-control-uid"]
}
```

### Enum Plus Type (single):
```json
{
  "boolean": "yes",
  "enum_option_uids": ["inpress-control-uid"]
}
```

### Enum Type (single):
```json
{
  "enum_option_uids": ["mechanical-thickness-uid", "ultrasonic-thickness-uid"]
}
```

### Enum Plus Type (multiple):
```json
{
  "boolean": "yes",
  "enum_option_uids": ["mechanical-thickness-uid", "ultrasonic-thickness-uid"]
}
```

### Numerical Type:
```json
{
  "numerical": 0.2
}
```

### Numerical Range Type (from/to):
```json
{
  "numerical_range": {
    "from": 10,
    "to": 50
  }
}
```

### Numerical Range Type (2D):
```json
{
  "numerical_range": {
    "a": 14,
    "b": 40
  }
}
```

### Numerical Range Type (3D):
```json
{
  "numerical_range": {
    "a": 10,
    "b": 20,
    "c": 30
  }
}
```

## Notes:
- Specification values are tied to model instances, not models directly
- This allows the same model to appear multiple times on one machine with different values
- **Hybrid storage approach:** Specification values are only materialized (stored as rows) when they have a single default value from presets OR when explicitly set by users
  - When a machine model instance is created, rows are automatically generated ONLY for specifications where the preset defines exactly one value (e.g., `constraint_type: "exact"` for numerical, single enum option, boolean_value: "yes"/"no")
  - Specifications with multiple choices or ranges (e.g., `constraint_type: "range"`, multiple enum options) remain unmaterialized until the user explicitly sets a value
  - This reduces storage while maintaining fast reads for commonly set specifications
- For draft machines, required specs can be missing; for published machines, all required specs must have values (materialized as rows)
- **Preset propagation:** When a specification preset is updated, all machine specification values that were inherited from that preset must be updated accordingly
  - The system tracks whether a value is inherited (came from preset) or user-edited in application logic
  - Only inherited values should be updated when presets change
  - If a preset changes from "exact" (single default) to "range" (multiple choices), the materialized row should be deleted unless the user had explicitly modified it

## Rationale behind using this combination of relational and JSONB storage:
Relational structure tracks model ownership (primary vs secondary), enforces referential integrity via foreign keys, and enables spec-based filtering. JSONB handles complex values (multilingual, multi-select) without schema rigidity. Hybrid storage approach balances efficiency: specifications with single defaults are materialized for fast reads, while specifications with multiple choices remain sparse until explicitly set. Estimated ~1-1.5M rows (50,000 machines × 20-30 materialized specs average). When displaying a machine, the application must JOIN with presets for unmaterialized specs, but this is acceptable since most important specs (standard equipment, key technical data) will be materialized. Trade-off: moderate storage, moderate query complexity, with flexibility to handle both common defaults and user choices efficiently.


# Changes:
- Added **Position Rank** fields to Category data model to specify the display order of categories.
- Added **Alternative Parent Category** and **Alternative Position Rank** fields to Category data model. This allows categories to appear in another part of the category tree as a link, with its own position ranking.
- Added **Is Meta Category** boolean field to Category data model to indicate non-rendered grouping categories. Purpose is grouping sub-categories which have overlap of spec groups. A Model can not be assigned to a meta category.
- Added Specification Type Enum (without Boolean) as some Specs can not have the value Yes/No in addition to an enum value, but only enum values.