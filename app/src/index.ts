#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

import { initializeStorage } from './lib/storage.js';
import { categoryTools } from './tools/category-tools.js';
import { specificationGroupTools } from './tools/specification-group-tools.js';
import { specificationTools } from './tools/specification-tools.js';
import { enumOptionTools } from './tools/enum-option-tools.js';
import { modelTools } from './tools/model-tools.js';
import { specificationPresetTools } from './tools/specification-preset-tools.js';
import { machineTools } from './tools/machine-tools.js';
import { queryTools } from './tools/query-tools.js';

// Combine all tools
const allTools = {
  ...categoryTools,
  ...specificationGroupTools,
  ...specificationTools,
  ...enumOptionTools,
  ...modelTools,
  ...specificationPresetTools,
  ...machineTools,
  ...queryTools,
};

// Create MCP server
const server = new Server(
  {
    name: 'umex-taxonomy-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.entries(allTools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const tool = allTools[toolName as keyof typeof allTools];

  if (!tool) {
    throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${toolName}`);
  }

  try {
    return await tool.handler(request.params.arguments);
  } catch (error: any) {
    // Handle validation errors and other errors
    if (error.name === 'ZodError') {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Validation error: ${JSON.stringify(error.errors, null, 2)}`
      );
    }

    throw new McpError(
      ErrorCode.InternalError,
      `Error executing tool: ${error.message || String(error)}`
    );
  }
});

// Start the server
async function main() {
  // Initialize storage (create data directory and JSON files if needed)
  await initializeStorage();

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('UMEX Taxonomy MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
