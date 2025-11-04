# Claude Desktop Configuration

## Configuration File Location

Find your Claude Desktop config file at:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

## Add This Configuration

Edit the file and add the UMEX taxonomy server to the `mcpServers` section:

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

### If you already have other MCP servers:

```json
{
  "mcpServers": {
    "existing-server": {
      "command": "...",
      "args": ["..."]
    },
    "umex-taxonomy": {
      "command": "node",
      "args": [
        "/Users/omar/repos/new_specs/app/dist/index.js"
      ]
    }
  }
}
```

## Important Notes

1. **Use absolute path**: The path in `args` must be the **full absolute path** to `index.js`, not a relative path
2. **Update the path**: If your project is in a different location, update `/Users/omar/repos/new_specs/app` to match your actual path
3. **Restart required**: After saving the config, **completely quit** Claude Desktop (not just close the window) and restart it

## Verifying the Connection

After restarting Claude Desktop, open a conversation and type:

```
What taxonomy tools do you have?
```

You should see a list of tools like:
- `create_category`
- `create_specification`
- `create_model`
- `create_machine`
- And many more...

## Troubleshooting

### Server not appearing?

1. **Check the path**: Make sure the path in the config points to the actual location of `dist/index.js`
2. **Check the build**: Run `npm run build` in the app directory
3. **Restart properly**: Completely quit Claude Desktop (Cmd+Q on Mac) and restart
4. **Check logs**: Look for errors in Claude Desktop logs
   - macOS: `~/Library/Logs/Claude/`
   - Windows: `%APPDATA%\Claude\logs\`

### Getting permission errors?

Make sure Node.js has permission to execute the script:
```bash
chmod +x /Users/omar/repos/new_specs/app/dist/index.js
```

### Server crashes on startup?

Check that all dependencies are installed:
```bash
cd /Users/omar/repos/new_specs/app
npm install
```

## Next Steps

Once connected, see:
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide with examples
- [README.md](README.md) - Full documentation
- [EXAMPLES.md](EXAMPLES.md) - Data structure examples
