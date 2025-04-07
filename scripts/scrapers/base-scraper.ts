import type { Festival } from '../../src/types';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

export abstract class BaseScraper {
  abstract baseUrl: string;

  protected generateId(): string {
    return uuidv4();
  }

  protected async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    console.log(`Fetching page: ${url}`);
    try {
      const response = await axios.get(url, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      });
      console.log(`Successfully fetched page: ${url}`);
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching page ${url}:`, error.message);
      throw error;
    }
  }

  protected abstract parseFestivals($: cheerio.CheerioAPI): Promise<Festival[]>;

  public async scrape(): Promise<Festival[]> {
    try {
      console.log(`Starting scrape for ${this.constructor.name}`);
      const $ = await this.fetchPage(this.baseUrl);
      const festivals = await this.parseFestivals($);
      console.log(`Found ${festivals.length} festivals from ${this.constructor.name}`);
      
      // Add metadata to each festival
      return festivals.map(festival => ({
        ...festival,
        last_updated: new Date(),
        status: 'active',
        is_interested: false
      }));
    } catch (error) {
      console.error(`Error in ${this.constructor.name}:`, error.message);
      return [];
    }
  }
} 