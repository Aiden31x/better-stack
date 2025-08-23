import { prismaClient } from "store/client";
import { xAddBulk } from "redisstream/client";

async function main() {
    try {
        let websites = await prismaClient.website.findMany({
            select: {
                url: true,
                id: true
            }
        })

        console.log(`📊 Found ${websites.length} websites to monitor`);

        if (websites.length > 0) {
            await xAddBulk(websites.map(w => ({
                url: w.url,
                id: w.id
            })));
            console.log(`✅ Added ${websites.length} websites to monitoring queue`);
        } else {
            console.log(`ℹ️ No websites found to monitor`);
        }
    } catch (error) {
        console.error('❌ Error in pusher:', error);
    }
}

// Run immediately when started
console.log('🚀 Pusher starting...');
main().then(() => {
    console.log('✅ Initial push completed');
});

// Then run every 3 minutes
setInterval(() => {
    main()
}, 3 * 1000 * 60)

console.log('🚀 Pusher started - monitoring websites every 3 minutes');