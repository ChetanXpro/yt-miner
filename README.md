# YT-Miner

A powerful and efficient tool to mine video data from YouTube search results. This library allows you to easily extract valuable video information from YouTube search results for any given query.

## Features

- Mine video titles and URLs from YouTube search results
- Configurable maximum number of videos to mine
- Option to save results to a JSON file
- Headless mode support
- Verbose logging option

## Installation

```bash
npm install yt-miner
```

## Usage

```typescript
import { mineYouTube, MiningOptions } from 'yt-miner';

const options: MiningOptions = {
    searchQuery: 'travel documentaries',
    maxVideos: 100,
    outputFile: 'travel_documentaries.json',
    headless: false,
    verbose: true
};

mineYouTube(options).then(results => {
    console.log(`Mining completed. Total videos found: ${results.length}`);
}).catch(error => {
    console.error('An error occurred:', error);
});
```

## License
