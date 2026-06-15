import 'dotenv/config';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer, type IncomingMessage } from 'node:http';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001';
const RESUME_SLUG = process.env.RESUME_SLUG ?? 'default';
const PORT = process.env.PORT ? Number(process.env.PORT) : undefined;

interface ResumeData {
  profile: unknown;
  skills: unknown;
  experience: unknown;
  education: unknown;
  patents: unknown;
  certifications: unknown;
  awards: unknown;
}

async function fetchResume(): Promise<ResumeData> {
  const res = await fetch(`${API_BASE}/v1/resume/${encodeURIComponent(RESUME_SLUG)}`);
  if (!res.ok) {
    throw new Error(`Resume API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<ResumeData>;
}

function toText(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function buildMcpServer(): McpServer {
  const server = new McpServer({ name: 'portfolio-resume', version: '0.1.0' });

  server.registerTool(
    'get_resume',
    { description: 'Get the full resume snapshot: profile, skills, experience, education, patents, certifications, and awards.' },
    async () => toText(await fetchResume()),
  );

  server.registerTool(
    'get_profile',
    { description: 'Get personal profile: name, position, location, contact details, LinkedIn/GitHub URLs, career start date, and years of experience.' },
    async () => toText((await fetchResume()).profile),
  );

  server.registerTool(
    'get_skills',
    { description: 'Get all skills grouped by category (language, framework, database, tool).' },
    async () => toText((await fetchResume()).skills),
  );

  server.registerTool(
    'get_experience',
    { description: 'Get work experience: company, role, location, dates, task bullets, and associated skills.' },
    async () => toText((await fetchResume()).experience),
  );

  server.registerTool(
    'get_education',
    { description: 'Get education: degree, university, and duration.' },
    async () => toText((await fetchResume()).education),
  );

  server.registerTool(
    'get_patents',
    { description: 'Get patents: title, patent number, and URL.' },
    async () => toText((await fetchResume()).patents),
  );

  server.registerTool(
    'get_certifications',
    { description: 'Get professional certifications: title, issuer, and credential URL.' },
    async () => toText((await fetchResume()).certifications),
  );

  server.registerTool(
    'get_awards',
    { description: 'Get awards and recognition: title and issuer.' },
    async () => toText((await fetchResume()).awards),
  );

  return server;
}

// Parse a raw Node.js request body as JSON.
function parseBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: string) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : undefined); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

if (PORT !== undefined) {
  // ── HTTP mode (Railway / remote / local with PORT set) ────────────────────
  // SDK requirement: stateless mode (sessionIdGenerator: undefined) needs a
  // fresh transport + server per request to avoid message ID collisions.
  const httpServer = createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? '/', `http://localhost`);

    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (pathname === '/mcp') {
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      const server = buildMcpServer();
      await server.connect(transport);
      const body = req.method === 'POST' ? await parseBody(req) : undefined;
      await transport.handleRequest(req, res, body);
      return;
    }

    res.writeHead(404).end();
  });

  httpServer.listen(PORT, () => {
    console.log(`MCP HTTP server listening on port ${PORT}`);
  });
} else {
  // ── Stdio mode (local / Claude Desktop) ───────────────────────────────────
  const transport = new StdioServerTransport();
  await buildMcpServer().connect(transport);
}
