import { TasksService } from './tasks.service';
import { Test } from '@nestjs/testing';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter-dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockUser = { id: 12, username: 'Test user' };
const mockTask = {
  title: 'test task',
  description: 'test desc',
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();
    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('get all tasks from the repository', async () => {
      const resolvedValue = 'someValue';
      taskRepository.getTasks.mockResolvedValue(resolvedValue);

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search',
      };
      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual(resolvedValue);
    });
  });

  describe('getTaskById', () => {
    it('calls findOne and retrieve the task', async () => {
      const id = 1;

      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(id, mockUser);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: {
          id,
          userId: mockUser.id,
        },
      });
    });
    it('throws an error, when task not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      await expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls create and returns the result', async () => {
      taskRepository.createTask.mockResolvedValue('task');
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const result = await tasksService.createTask(mockTask, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalled();
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        mockTask,
        mockUser,
      );
      expect(result).toEqual('task');
    });
  });

  describe('deleteTask', () => {
    it('calls delete to delete the task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalled();
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('throws an error, when task not found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
