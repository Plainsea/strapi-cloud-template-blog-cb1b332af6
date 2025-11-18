module.exports = {
    keepAlive: {
        task: async () => {
            try {
                await fetch('https://better-laughter-bd20a7fa5b.strapiapp.com/_health');
                console.log('✅ Strapi keep-alive cron executed');
            } catch (err) {
                console.error('❌ Keep-alive cron failed:', err);
            }
        },
        options: {
            rule: '*/5 * * * *', // every 5 minutes
        },
    },
};
