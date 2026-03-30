export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  defaultPassword:'Assd@123',
  database: {
    host: process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase',
  },
   jwt: {
    secret: process.env.JWT_ADMIN_SECRET_KEY||'dev_secret',
    expiresIn: process.env.JWT_ADMIN_TOKEN_EXPIRES_IN||'1d',
  },
  redis:{
    host:process.env.REDIS_HOST,
    port:process.env.REDIS_PORT,
    password:process.env.REDIS_PASSWORD,
    username:process.env.REDIS_USERNAME,
  },
  tenant:{
    cacheSize:process.env.TENANT_CACHE_SIZE||100,
    db:{
      host:"localhost",port:5432
    }
  }

});
