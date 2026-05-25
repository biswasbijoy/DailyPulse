import { TaskTemplate } from '../models/TaskTemplate';
import { Task } from '../models/Task';
import { addDays } from '../utils/dateUtils';

export async function listTemplates(userId: string) {
  return TaskTemplate.find({ userId }).sort({ name: 1 });
}

export async function createTemplate(userId: string, data: any) {
  return TaskTemplate.create({ userId, ...data });
}

export async function updateTemplate(templateId: string, userId: string, data: any) {
  const template = await TaskTemplate.findOne({ _id: templateId, userId });
  if (!template) return null;
  Object.assign(template, data);
  await template.save();
  return template;
}

export async function deleteTemplate(templateId: string, userId: string) {
  const template = await TaskTemplate.findOne({ _id: templateId, userId });
  if (!template) return false;
  await template.deleteOne();
  return true;
}

export async function applyTemplate(templateId: string, userId: string, taskDate: string) {
  const template = await TaskTemplate.findOne({ _id: templateId, userId });
  if (!template) return null;

  const taskData: any = {
    userId: userId as any,
    title: template.title,
    description: template.description,
    priority: template.priority,
    category: template.category,
    tags: template.tags,
    estimatedMinutes: template.estimatedMinutes,
    currentDate: taskDate,
    taskDate,
    templateFromId: template._id,
    recurrence: {
      type: template.recurrenceType,
      interval: template.recurrenceInterval,
    },
  };

  if (template.dueDateOffset !== undefined) {
    taskData.dueDate = addDays(taskDate, template.dueDateOffset);
  }

  return Task.create(taskData);
}
