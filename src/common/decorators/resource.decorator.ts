import { SetMetadata } from '@nestjs/common';

export const RESOURCE_KEY = 'resource';
export const Resource = (resource: 'post' | 'comment') =>
  SetMetadata(RESOURCE_KEY, resource);
