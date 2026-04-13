export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT!, 10) || 3000,
  defaultPassword: process.env.DEFAULT_PASSWORD,

  jwt: {
    secret: process.env.JWT_ADMIN_SECRET_KEY || 'dev_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    expiresIn: process.env.JWT_ADMIN_TOKEN_EXPIRES_IN || '1d',
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    username: process.env.REDIS_USERNAME,
  },
  tenant: {
    cacheSize: process.env.TENANT_CACHE_SIZE || 100,
    db: { host: 'localhost', port: 5432 },
  },
  db: {
    host: 'localhost',
    port: 5432,
    mongodb: {
      uri: process.env.MONGODB_URI,
      host: process.env.MONGODB_HOST,
      user: process.env.MONGODB_USER,
      password: process.env.MONGODB_PASSWORD,
    },
    postgres: {
      host: process.env.PGHOST,
      port: process.env.PGPORT,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      db: process.env.PGDATABASE,
      url: process.env.DATABASE_URL || '',
    },
  },
  openai:{
    key:process.env.OPENAI_API_KEY
  }
});
