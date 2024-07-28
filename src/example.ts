import { mineYouTube, MiningOptions } from './index';

const options: MiningOptions = {
    searchQuery: 'travel documentary',
    maxVideos: 50,
    outputFile: 'travel_documentary.json',
    headless: false,
    verbose: true
};

async function runExample() {
    try {
        console.log('Starting YouTube mining process...');
        const results = await mineYouTube(options);
        console.log(`Mining completed. Found ${results.length} videos.`);
        console.log('First 5 results:');
        results.slice(0, 5).forEach((video, index) => {
            console.log(`${index + 1}. ${video.title}`);
            console.log(`   URL: ${video.url}\n`);
        });
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

runExample();