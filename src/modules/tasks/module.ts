import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './service';
import { TasksController } from './controller';
import { Task, TaskSchema } from './schema';
import { CustomLoggerService } from '../common/utils/logger';

@Module({
  imports: [MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])],
  controllers: [TasksController],
  providers: [TasksService, CustomLoggerService],
})
export class TasksModule {}
