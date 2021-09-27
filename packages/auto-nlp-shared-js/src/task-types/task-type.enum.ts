enum TaskType {
  Token_Classification = 'Token_Classification',
}

export const TaskTypeLabel = new Map<string, string>([
  [TaskType.Token_Classification, 'Token Classification'],
]);

export const TaskTypeShort = new Map<string, string>([
  [TaskType.Token_Classification, 'tc'],
]);

export { TaskType };
