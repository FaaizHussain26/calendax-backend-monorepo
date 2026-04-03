import { Module, Global } from '@nestjs/common';
import { MongoAdminService } from './mongo-admin.service';

@Global() // This makes it available everywhere without re-importing
@Module({
  providers: [MongoAdminService],
  exports: [MongoAdminService],
})
export class MongoAdminModule {}