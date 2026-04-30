export default () => ({
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT!, 10) || 3000,
  defaultPassword: process.env.DEFAULT_PASSWORD,
  internal: {
    apiUrl: process.env.INTERNAL_API_URL || 'http://localhost:3001/api',
    apiKey: process.env.INTERNAL_API_KEY || 'dev_secret_internal_key',
  },
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
  openai: {
    key: process.env.OPENAI_API_KEY,
  },
  aws: {
    accountId:process.env.AWS_ACCOUNT_ID||'',
    region: process.env.AWS_REGION || '',
    schedular: {
      accessKeyId: process.env.EVENT_BRIDGE_USER_ACCESSKEY,
      secretAccessKey: process.env.EVENT_BRIDGE_USER_SECRETKEY,
      schedulerServiceArn: process.env.AWS_SCHEDULER_SERVICE_ARN,
      eventbridgeRoleArn: process.env.AWS_EVENTBRIDGE_ROLE_ARN,
      triggerQueueUrl: process.env.SCHEDULER_TRIGGER_QUEUE_URL,
    },
    s3: {
      bucket: process.env.S3_BUCKET_NAME,
      accessKeyId: process.env.S3_USER_ACCESSKEY,
      secretAccessKey: process.env.S3_USER_SECRETKEY,
    },
    sqs: {
      que_prefix: process.env.SQS_QUE_PREFIX,
      accessKeyId: process.env.SQS_USER_ACCESSKEY,
      secretAccessKey: process.env.SQS_USER_SECRETKEY,
    },
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY,
  },
  twilio:{
    sid:process.env.TWILIO_SID,
    authToken:process.env.TWILIO_AUTH_TOKEN,
    phoneNumber:process.env.TWILIO_PHONENUMBER
  }
});
