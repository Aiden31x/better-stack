import axios from "axios";
import { prismaClient } from "store/client";

const REGION_ID = process.env.REGION_ID!;
const WORKER_ID = process.env.WORKER_ID!;

if (!REGION_ID) {
    throw new Error("Region not provided");
}

if (!WORKER_ID) {
    throw new Error("Region not provided");
}

// Ensure region exists in database
async function ensureRegion() {
    try {
        const region = await prismaClient.region.findUnique({
            where: { id: REGION_ID }
        });

        if (!region) {
            console.log(`📝 Creating region ${REGION_ID}...`);
            await prismaClient.region.create({
                data: {
                    id: REGION_ID,
                    name: REGION_ID
                }
            });
            console.log(`✅ Region ${REGION_ID} created`);
        } else {
            console.log(`✅ Region ${REGION_ID} exists`);
        }
    } catch (error) {
        console.error(`❌ Error ensuring region:`, error);
        throw error;
    }
}

async function main() {
    try {
        console.log(`🔍 Checking for websites to monitor...`);

        // Get all websites from database instead of Redis stream
        const websites = await prismaClient.website.findMany({
            select: {
                id: true,
                url: true
            }
        });

        if (!websites || websites.length === 0) {
            console.log(`⏳ No websites to monitor right now`);
            return;
        }

        console.log(`🔍 Found ${websites.length} website(s) to monitor`);

        // Monitor all websites
        for (const website of websites) {
            try {
                await fetchWebsite(website.url, website.id);
                console.log(`✅ Website ${website.url} monitored successfully`);
            } catch (error) {
                console.error(`❌ Error monitoring ${website.url}:`, error);
            }
        }

        console.log(`✅ Completed monitoring ${websites.length} website(s)`);
    } catch (error) {
        console.error(`❌ Error in main loop:`, error);
    }
}

// Main loop with error handling
async function runWorker() {
    console.log(`🚀 Worker started - Region: ${REGION_ID}, Worker ID: ${WORKER_ID}`);

    // Ensure region exists at startup
    try {
        await ensureRegion();
    } catch (error) {
        console.error(`❌ Failed to ensure region at startup:`, error);
        process.exit(1);
    }

    while (true) {
        try {
            await main();
            console.log(`⏳ Waiting 20 seconds before next check...`);
            await new Promise(resolve => setTimeout(resolve, 20 * 1000)); // 20 seconds
        } catch (error) {
            console.error('❌ Error in main loop:', error);
            await new Promise(resolve => setTimeout(resolve, 10 * 1000)); // Wait 10 seconds on error
        }
    }
}

runWorker();

async function fetchWebsite(url: string, websiteId: string) {
    return new Promise<void>((resolve, reject) => {
        const startTime = Date.now();

        axios.get(url, {
            timeout: 10000, // 10 second timeout
            validateStatus: (status) => status < 500 // Consider 4xx as "up" but with issues
        })
            .then(async (response) => {
                const endTime = Date.now();
                await prismaClient.website_tick.create({
                    data: {
                        response_time_ms: endTime - startTime,
                        status: "Up", // Use database enum value
                        region_id: REGION_ID,
                        website_id: websiteId
                    }
                })
                console.log(`✅ Website ${url} is UP - Response time: ${endTime - startTime}ms`);
                resolve()
            })
            .catch(async (error) => {
                const endTime = Date.now();
                await prismaClient.website_tick.create({
                    data: {
                        response_time_ms: endTime - startTime,
                        status: "Down", // Use database enum value
                        region_id: REGION_ID,
                        website_id: websiteId
                    }
                })
                console.log(`❌ Website ${url} is DOWN - Error: ${error.message}`);
                resolve()
            })
    })
}