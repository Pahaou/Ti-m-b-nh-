const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'JWT_SECRET'
];

function validateEnv() {
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing.join(', '));
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        } else {
            console.warn('⚠️ App is running without some variables, which might cause issues.');
        }
    } else {
        console.log('✅ Environment variables validated.');
    }
}

module.exports = validateEnv;
