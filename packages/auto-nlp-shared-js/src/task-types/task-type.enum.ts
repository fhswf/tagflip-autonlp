enum TaskType {
  Token_Classification = 'Token_Classification',
  Text_Classification = 'Text Classification',
}

export const TaskTypeLabel = new Map<string, string>([
  [TaskType.Token_Classification, 'Token Classification'],
  [TaskType.Text_Classification, 'Text Classification'],
]);

export const TaskTypeShort = new Map<string, string>([
  [TaskType.Token_Classification, 'tc'],
  [TaskType.Text_Classification, 'sc'],
]);

export { TaskType };
