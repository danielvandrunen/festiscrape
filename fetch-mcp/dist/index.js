"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const turndown_1 = __importDefault(require("turndown"));
class FetchMCPServer {
    constructor() {
        this.turndownService = new turndown_1.default();
    }
    async fetchHtml(request) {
        try {
            const response = await fetch(request.url, { headers: request.headers });
            const html = await response.text();
            return { content: html };
        }
        catch (error) {
            return { content: '', error: error?.message || 'Unknown error' };
        }
    }
    async fetchJson(request) {
        try {
            const response = await fetch(request.url, { headers: request.headers });
            const json = await response.json();
            return { content: JSON.stringify(json) };
        }
        catch (error) {
            return { content: '', error: error?.message || 'Unknown error' };
        }
    }
    async fetchTxt(request) {
        try {
            const html = await this.fetchHtml(request);
            if (html.error)
                return html;
            const dom = new jsdom_1.JSDOM(html.content);
            const text = dom.window.document.body.textContent || '';
            return { content: text.trim() };
        }
        catch (error) {
            return { content: '', error: error?.message || 'Unknown error' };
        }
    }
    async fetchMarkdown(request) {
        try {
            const html = await this.fetchHtml(request);
            if (html.error)
                return html;
            const dom = new jsdom_1.JSDOM(html.content);
            const markdown = this.turndownService.turndown(dom.window.document.body);
            return { content: markdown };
        }
        catch (error) {
            return { content: '', error: error?.message || 'Unknown error' };
        }
    }
    async handleRequest(request) {
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
    }
    catch (error) {
        process.stdout.write(JSON.stringify({ error: error?.message || 'Unknown error' }) + '\n');
    }
});
