# UMEX Taxonomy MCP Server

A Model Context Protocol (MCP) server for managing machine taxonomy data including categories, specifications, models, and machines. This server allows you to interact with the taxonomy system through Claude Desktop using natural language.

## Overview

This MCP server provides tools to:
- Manage **Categories** (machine types like "Perfect Binders", "Guillotine Cutters")
- Define **Specification Groups** and **Specifications** (technical attributes and equipment)
- Create **Enum Options** for enum-based specifications
- Manage **Machine Models** and **Specification Presets**
- Create and manage **Machines** with multiple model instances
- Query and validate the taxonomy data

All data is stored in JSON files in the `data/` directory, making it easy to version control and inspect.

## Installation

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Build the Project

```bash
npm run build
```

This compiles the TypeScript code to the `dist/` directory.

## Setup with Claude Desktop

### 1. Locate Claude Desktop Config

Find your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Linux**: `~/.config/Claude/claude_desktop_config.json`

### 2. Add MCP Server Configuration

Open the config file and add the UMEX taxonomy server to the `mcpServers` section:

```json
{
  "mcpServers": {
    "umex-taxonomy": {
      "command": "node",
      "args": [
        "/Users/omar/repos/new_specs/app/dist/index.js"
      ]
    }
  }
}
```

**Important**: Replace `/Users/omar/repos/new_specs/app` with the **absolute path** to your app directory.

### 3. Restart Claude Desktop

Completely quit and restart Claude Desktop for the changes to take effect.

### 4. Verify Connection

In Claude Desktop, you should now see the UMEX taxonomy tools available. You can verify by asking:

> "What taxonomy tools do you have available?"

Claude should list all the available tools for managing categories, specifications, models, and machines.

## Usage Examples

### Creating a Category

```
Create a new category called "Perfect Binders" with German label "Klebebinder" and Spanish label "Encuadernación Perfecta"
```

### Creating a Specification Group

```
Add a specification group called "Technical Data" in the Perfect Binders category
```

### Creating a Specification

```
Create a numerical specification called "Max Speed" in the Technical Data group with unit "cycles/h" and range 1000-20000
```

### Creating an Enum Option

```
For the "Color Control System" specification, add an enum option called "InpressControl"
```

### Creating a Model

```
Create a model called "Kolbus KM 600" in the Perfect Binders category
```

### Creating a Preset

```
Create a model-level preset for "Kolbus KM 600" that sets the Max Speed to exactly 7000 cycles/h
```

### Creating a Machine

```
Create a new machine called "Binding Line ABC" with the Kolbus KM 600 as primary model, year 2018, serial number "KM600-12345"
```

### Adding Secondary Models

```
Add a secondary model "Kolbus HD 153" to machine "Binding Line ABC" at position 1 with label "Front Trimmer"
```

### Querying Data

```
Show me the full category tree for Perfect Binders
```

```
Search for all entities containing "kolbus"
```

```
Validate if machine "Binding Line ABC" is ready to publish
```

## Available Tools

### Category Management
- `create_category` - Create a new category
- `update_category` - Update an existing category
- `delete_category` - Delete a category (checks dependencies)
- `list_categories` - List all categories
- `get_category` - Get a single category by UID

### Specification Group Management
- `create_specification_group` - Create a specification group
- `update_specification_group` - Update a specification group
- `delete_specification_group` - Delete a specification group
- `list_specification_groups` - List specification groups
- `get_specification_group` - Get a single specification group

### Specification Management
- `create_specification` - Create a specification (Text, Boolean Plus, Enum Plus, Numerical, Numerical Range)
- `update_specification` - Update a specification
- `delete_specification` - Delete a specification
- `list_specifications` - List specifications
- `get_specification` - Get a single specification

### Enum Option Management
- `create_enum_option` - Create an enum option for Enum Plus specs
- `update_enum_option` - Update an enum option
- `delete_enum_option` - Delete an enum option
- `list_enum_options` - List enum options
- `get_enum_option` - Get a single enum option

### Model Management
- `create_model` - Create a machine model
- `update_model` - Update a model
- `delete_model` - Delete a model
- `list_models` - List models
- `get_model` - Get a single model

### Specification Preset Management
- `create_specification_preset` - Create a preset (category or model level)
- `update_specification_preset` - Update a preset
- `delete_specification_preset` - Delete a preset
- `list_specification_presets` - List presets
- `get_specification_preset` - Get a single preset

### Machine Management
- `create_machine` - Create a machine with primary model
- `update_machine` - Update a machine
- `delete_machine` - Delete a machine (cascades to instances and values)
- `list_machines` - List machines
- `get_machine` - Get a machine with all instances
- `add_model_instance` - Add a secondary model to a machine
- `remove_model_instance` - Remove a model instance
- `set_specification_value` - Set a specification value for an instance

### Query & Validation Tools
- `get_category_tree` - Get full category hierarchy with specs
- `validate_machine` - Check if machine is ready to publish
- `search_entities` - Search across all entity types
- `get_relationships` - Get all related entities for a UID

## Data Storage

All data is stored as JSON files in the `data/` directory at the project root:

```
data/
├── categories.json
├── specification-groups.json
├── specifications.json
├── enum-options.json
├── models.json
├── specification-presets.json
├── machines.json
├── machine-model-instances.json
└── machine-specification-values.json
```

You can inspect or manually edit these files if needed. The server validates all data against Zod schemas before writing.

## Development

### Watch Mode

For development, you can run TypeScript in watch mode:

```bash
npm run watch
```

### Manual Testing

You can also run the server manually to test:

```bash
npm run dev
```

## Specification Types

The system supports five specification types:

### 1. Text
- Multilingual text fields
- Optional max length constraint

### 2. Boolean Plus
- Values: "yes", "no", or undefined
- Optional descriptive text

### 3. Enum Plus
- Boolean state ("yes"/"no") + optional enum selections
- Supports single or multiple enum options
- Can hide the name to show only enum values

### 4. Numerical
- Single numerical value (int or float)
- Optional unit (e.g., "cm", "mm", "cycles/h")
- Optional min/max constraints

### 5. Numerical Range
- Range types: from/to, two-dimensional (a×b), three-dimensional (a×b×c)
- Examples: "10-50cm", "14×40cm", "10×20×30cm"
- Supports same constraints as Numerical

## Preset System

Presets define allowed values/constraints for specifications:

- **Category-level presets**: Apply to all models in a category
- **Model-level presets**: Apply to one specific model (override category presets)
- **Preset types**:
  - Exact values (auto-populated when creating machines)
  - Ranges (user must select within range)
  - Sets (user must select from predefined options)

## Machine Instance System

Machines can consist of multiple model instances:
- One **primary model** (defines the category)
- Zero or more **secondary models** (e.g., trimmers, feeders)
- Each instance can have different specification values
- Same model can appear multiple times with different labels

## Troubleshooting

### Server Not Showing in Claude Desktop

1. Check that the path in `claude_desktop_config.json` is absolute and correct
2. Make sure you ran `npm run build` successfully
3. Completely quit and restart Claude Desktop
4. Check Claude Desktop logs for errors

### Finding Logs

**macOS**: `~/Library/Logs/Claude/`

**Windows**: `%APPDATA%\Claude\logs\`

### Validation Errors

The server validates all inputs against Zod schemas. If you get validation errors:
1. Check the error message for specific field issues
2. Refer to the tool's `inputSchema` for required/optional fields
3. Ensure UIDs reference existing entities

## License

MIT
