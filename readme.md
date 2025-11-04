# New Specs Repository (experimental)

This repository contains the code and data for the New Specs project, which aims to be a play ground for testing new ideas in machine taxonomy management as well as setting up the initial tree of machine categories, spec groups and specs

## Overview

```/app``` contains the MCP server to manage data. It can be connected to Claude Desktop or others to manage the tree via chat.

```/schemas``` contains the schema definitions for the data models used in the MCP server. 

```/data``` contains JSON data files with machine taxonomies and models.

```/interface``` a small web app to render a collapsible category tree as a HTML page.

## Test it out

Run ``npm install`` to install dependencies.

Run ``npm run start`` to start the MCP server and the web app, both locally.