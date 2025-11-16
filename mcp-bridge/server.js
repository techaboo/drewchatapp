import express from 'express';
import cors from 'cors';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const app = express();
app.use(cors());
app.use(express.json());

let mcpClient = null;

// Initialize MCP client connection to Docker container
async function initializeMCP() {
  try {
    console.log('🐳 Starting DuckDuckGo MCP Docker container...');
    
    // Create MCP client with stdio transport
    // The transport will spawn the Docker container itself
    const transport = new StdioClientTransport({
      command: 'docker',
      args: ['run', '-i', '--rm', 'mcp/duckduckgo']
    });

    mcpClient = new Client(
      {
        name: 'mcp-bridge-client',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    await mcpClient.connect(transport);
    console.log('✅ Connected to DuckDuckGo MCP server');

    // List available tools
    const tools = await mcpClient.listTools();
    console.log('🔧 Available tools:', tools.tools.map(t => t.name).join(', '));

  } catch (error) {
    console.error('❌ Failed to initialize MCP:', error);
    throw error;
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mcp_connected: mcpClient !== null,
    timestamp: new Date().toISOString()
  });
});

// Search endpoint
app.post('/search', async (req, res) => {
  try {
    const { query, max_results = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    if (!mcpClient) {
      return res.status(503).json({ error: 'MCP server not connected' });
    }

    console.log(`🔍 Searching DuckDuckGo for: "${query}"`);

    const result = await mcpClient.callTool({
      name: 'search',
      arguments: {
        query,
        max_results
      }
    });

    // Parse the MCP response
    const searchResults = result.content[0]?.text || '';
    
    res.json({ 
      query,
      results: searchResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      message: error.message 
    });
  }
});

// Fetch content endpoint
app.post('/fetch-content', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    if (!mcpClient) {
      return res.status(503).json({ error: 'MCP server not connected' });
    }

    console.log(`📄 Fetching content from: ${url}`);

    const result = await mcpClient.callTool({
      name: 'fetch_content',
      arguments: { url }
    });

    const content = result.content[0]?.text || '';
    
    res.json({ 
      url,
      content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Fetch error:', error);
    res.status(500).json({ 
      error: 'Fetch failed', 
      message: error.message 
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  
  if (mcpClient) {
    await mcpClient.close();
  }
  
  process.exit(0);
});

// Start server
const PORT = 3001;

initializeMCP()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 MCP Bridge Server running on http://localhost:${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/health`);
      console.log(`   Search: POST http://localhost:${PORT}/search`);
      console.log(`   Fetch: POST http://localhost:${PORT}/fetch-content`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });
