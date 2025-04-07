import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';

interface FetchRequest {
  url: string;
  headers?: Record<string, string>;
}

interface FetchResponse {
  content: string;
  error?: string;
}

class FetchMCPServer {
  private turndownService: TurndownService;

  constructor() {
    this.turndownService = new TurndownService();
  }

  async fetchHtml(request: FetchRequest): Promise<FetchResponse> {
    try {
      const response = await fetch(request.url, { headers: request.headers });
      const html = await response.text();
      return { content: html };
    } catch (error: any) {
      return { content: '', error: error?.message || 'Unknown error' };
    }
  }

  async fetchJson(request: FetchRequest): Promise<FetchResponse> {
    try {
      const response = await fetch(request.url, { headers: request.headers });
      const json = await response.json();
      return { content: JSON.stringify(json) };
    } catch (error: any) {
      return { content: '', error: error?.message || 'Unknown error' };
    }
  }

  async fetchTxt(request: FetchRequest): Promise<FetchResponse> {
    try {
      const html = await this.fetchHtml(request);
      if (html.error) return html;

      const dom = new JSDOM(html.content);
      const text = dom.window.document.body.textContent || '';
      return { content: text.trim() };
    } catch (error: any) {
      return { content: '', error: error?.message || 'Unknown error' };
    }
  }

  async fetchMarkdown(request: FetchRequest): Promise<FetchResponse> {
    try {
      const html = await this.fetchHtml(request);
      if (html.error) return html;

      const dom = new JSDOM(html.content);
      const markdown = this.turndownService.turndown(dom.window.document.body);
      return { content: markdown };
    } catch (error: any) {
      return { content: '', error: error?.message || 'Unknown error' };
    }
  }

  async handleRequest(request: any): Promise<any> {
    const { type, url, headers } = request;

    switch (type) {
      case 'fetch_html':
        return this.fetchHtml({ url, headers });
      case 'fetch_json':
        return this.fetchJson({ url, headers });
      case 'fetch_txt':
        return this.fetchTxt({ url, headers });
      case 'fetch_markdown':
        return this.fetchMarkdown({ url, headers });
      default:
        return { error: 'Unknown request type' };
    }
  }
}

const server = new FetchMCPServer();

process.stdin.on('data', async (data) => {
  try {
    const request = JSON.parse(data.toString());
    const response = await server.handleRequest(request);
    process.stdout.write(JSON.stringify(response) + '\n');
  } catch (error: any) {
    process.stdout.write(JSON.stringify({ error: error?.message || 'Unknown error' }) + '\n');
  }
}); 