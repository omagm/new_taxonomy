This repo is about a machines taxonomy management system spanning categories, specification groups, specifications and presets.

In taxonomy_description.md the new system to manage machine taxonomies is described.


```/app``` contains the MCP server to manage data. It can be connected to Claude Desktop or others to manage the tree via chat.

```/schemas``` contains the schema definitions for the data models used in the MCP server. 

```/data``` contains JSON data files with machine taxonomies and models.

```/interface``` a small web app to render a collapsible category tree as a HTML page.

**Important Note:** Whenever changing the schema definitions in ```/schemas```, the following has to be done right after it:
1) Schema Package has to be rebuilt so that the Typescript types are updated as well.
2) The MCP server has to adjust its tool functions to support the changes. It also has to be restarted to load the new schema definitions.
3) The JSON data files in ```/data``` have to be checked for compliance with the new schema definitions. If necessary, they have to be updated to conform to the new schema.
4) The web app in ```/interface``` may need to be updated to reflect any changes in the data models or schemas.
5) In ```taxonomy_description.md```, the changes made to the schema definitions have to be documented in the "Changes" section at the end of the file.

Therefore it is important to know what each change is expected to reflect in the interface and in the mcp server.