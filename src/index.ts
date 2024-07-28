import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';

export interface VideoInfo {
    title: string;
    url: string;
}

export interface MiningOptions {
    searchQuery: string;
    maxVideos?: number;
    outputFile?: string;
    headless?: boolean;
    verbose?: boolean;
}

export class YTMiner {
    private options: MiningOptions;
    private videoInfo: Map<string, VideoInfo> = new Map();

    constructor(options: MiningOptions) {
        this.options = {
            maxVideos: 1000,
            outputFile: 'videos.json',
            headless: true,
            verbose: false,
            ...options
        };
    }

    private log(message: string) {
        if (this.options.verbose === true) {
            console.log(message);
        }
    }

    private saveResults() {
        const videos = Array.from(this.videoInfo.values());
        fs.writeFileSync(this.options.outputFile!, JSON.stringify(videos, null, 2));
        this.log(`Saved ${videos.length} videos to ${this.options.outputFile}`);
    }

    async mine(): Promise<VideoInfo[]> {
        let browser: Browser | null = null;
        
        try {
            browser = await puppeteer.launch({
                headless: this.options.headless,
                defaultViewport: null,
                args: ['--start-maximized'],
            });
            const page: Page = await browser.newPage();

            await page.goto(`https://www.youtube.com/results?search_query=${encodeURIComponent(this.options.searchQuery)}`, { waitUntil: 'networkidle2' });

            let previousHeight = 0;
            let sameHeightCount = 0;
            const maxSameHeightCount = 5;

            while (this.videoInfo.size < this.options.maxVideos!) {
                const newVideos = await this.extractVideoInfo(page);

                newVideos.forEach(video => {
                    if (!this.videoInfo.has(video.url)) {
                        this.videoInfo.set(video.url, video);
                    }
                });

                this.log(`Found ${this.videoInfo.size} videos so far...`);

                await this.scrollPage(page);

                const currentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
                if (currentHeight === previousHeight) {
                    sameHeightCount++;
                    if (sameHeightCount >= maxSameHeightCount) {
                        this.log("No more new content loading. Stopping search.");
                        break;
                    }
                } else {
                    sameHeightCount = 0;
                }
                previousHeight = currentHeight;
            }

        } catch (error) {
            if (this.options.verbose === true) {
                console.error('An error occurred:', error);
            }
        } finally {
            if (browser) {
                await browser.close();
            }
            this.saveResults();
        }

        return Array.from(this.videoInfo.values());
    }

    private async extractVideoInfo(page: Page): Promise<VideoInfo[]> {
        return page.evaluate(() => {
            const videos = Array.from(document.querySelectorAll('ytd-video-renderer'));
            return videos.map((video): VideoInfo => {
                const titleElement = video.querySelector('#video-title');
                const linkElement = video.querySelector('a#thumbnail');

                return {
                    title: titleElement ? titleElement.textContent?.trim() || '' : '',
                    url: linkElement ? 'https://www.youtube.com' + linkElement.getAttribute('href') : 'URL not found'
                };
            });
        });
    }

    private async scrollPage(page: Page) {
        await page.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
    }
}

export async function mineYouTube(options: MiningOptions): Promise<VideoInfo[]> {
    const miner = new YTMiner(options);
    const results = await miner.mine();
    if (options.verbose === true) {
        console.log(`Mining completed. Found ${results.length} videos.`);
    }
    return results;
}