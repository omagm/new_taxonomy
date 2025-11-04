import { randomUUID } from 'crypto';

export function generateUID(): string {
  return randomUUID();
}
