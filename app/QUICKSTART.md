# Quick Start Guide

This guide will help you get the UMEX Taxonomy MCP Server running with Claude Desktop in 5 minutes.

## Step 1: Build the Server

```bash
cd /Users/omar/repos/new_specs/app
npm install
npm run build
```

## Step 2: Configure Claude Desktop

1. Open your Claude Desktop config file:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add this configuration (update the path to match your system):

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

3. Save the file and **completely quit** Claude Desktop (not just close the window)

4. Restart Claude Desktop

## Step 3: Verify It's Working

In Claude Desktop, type:

> What tools do you have available?

You should see a list of taxonomy management tools like `create_category`, `create_specification`, etc.

## Step 4: Start Building Your Taxonomy

### Example Workflow

**1. Create a category:**
```
Create a category for "Perfect Binders" with German label "Klebebinder"
```

**2. Add a specification group:**
```
Create a specification group "Technical Data" of type "Technical Details" in the Perfect Binders category
```

**3. Add a specification:**
```
Create a numerical specification called "Max Speed" with unit "cycles/h" in the Technical Data group
```

**4. Create a model:**
```
Create a model "Kolbus KM 600" in the Perfect Binders category
```

**5. Add a preset:**
```
Create a model-level preset for Kolbus KM 600 that sets Max Speed to exactly 7000 cycles/h
```

**6. Create a machine:**
```
Create a machine "My Perfect Binder" with Kolbus KM 600 as primary model, year 2020
```

**7. Validate:**
```
Validate if machine "My Perfect Binder" is ready to publish
```

## Common Commands

### Listing Data
- "List all categories"
- "List all models in the Perfect Binders category"
- "Show all specifications in the Technical Data group"

### Searching
- "Search for entities containing 'kolbus'"
- "Find all specifications with 'speed' in the name"

### Getting Details
- "Show me the full category tree for Perfect Binders"
- "Get all relationships for this model UID: [uid]"

## Data Location

All your data is stored in JSON files at:
```
/Users/omar/repos/new_specs/data/
```

You can inspect or edit these files directly if needed.

## Troubleshooting

**Server not appearing in Claude Desktop?**
1. Check the path in `claude_desktop_config.json` is correct
2. Make sure you ran `npm run build`
3. Quit Claude Desktop completely and restart
4. Check logs at `~/Library/Logs/Claude/`

**Getting validation errors?**
- Make sure you're referencing valid UIDs for related entities
- Check that required fields are provided
- Ask Claude to show you the details of an entity before updating it

## Next Steps

Read the full [README.md](README.md) for:
- Complete list of all available tools
- Detailed specification types documentation
- Preset system explained
- Machine instance system details
