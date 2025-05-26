# npm-search MCP Server

An MCP server for searching and retrieving information about npm packages.

## Features

This MCP server provides tools for:

- Searching for npm packages
- Getting detailed information about specific packages
- Viewing package dependencies
- Listing available versions of packages
- Getting TypeScript type definitions from packages
- Listing all files in a package
- Reading specific files from packages

## Tools

### npm_search

Search for npm packages using the npm registry.

**Parameters:**
- `query`: Search query for npm packages
- `limit`: Maximum number of results to return (default: 20)

**Example:**
```json
{
  "query": "react state management",
  "limit": 10
}
```

### npm_info

Get detailed information about a specific npm package.

**Parameters:**
- `package`: Package name to get information about
- `version`: Specific version to get information about (optional, defaults to latest)

**Example:**
```json
{
  "package": "react",
  "version": "18.2.0"
}
```

### npm_dependencies

Get dependencies for a specific npm package.

**Parameters:**
- `package`: Package name to get dependencies for
- `version`: Specific version to get dependencies for (optional, defaults to latest)

**Example:**
```json
{
  "package": "express"
}
```

### npm_versions

Get available versions for a specific npm package.

**Parameters:**
- `package`: Package name to get versions for

**Example:**
```json
{
  "package": "typescript"
}
```

### npm_summary

Get package summary with TypeScript type definitions.

**Parameters:**
- `package`: Package name to get type definitions for
- `version`: Specific version to get type definitions for (optional, defaults to latest)
- `includePatterns`: Optional patterns to include specific files (optional)

**Example:**
```json
{
  "package": "zod",
  "version": "3.22.4",
  "includePatterns": ["README.md", "*.json"]
}
```

### npm_list_files

List all files in a package.

**Parameters:**
- `package`: Package name to list files for
- `version`: Specific version to list files for (optional, defaults to latest)

**Example:**
```json
{
  "package": "express",
  "version": "4.18.2"
}
```

### npm_read_file

Read a specific file from a package.

**Parameters:**
- `package`: Package name to read file from
- `version`: Specific version to read file from (optional, defaults to latest)
- `filePath`: Path to the file within the package

**Example:**
```json
{
  "package": "react",
  "version": "18.2.0",
  "filePath": "README.md"
}
```

## Installation

1. Build the server:
   ```
   npm run build
   ```

2. Add the server to your MCP configuration file.

## Usage

Once installed and configured, you can use the npm-search tools through the MCP interface.
