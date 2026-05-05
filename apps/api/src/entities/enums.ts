/**
 * Shared TypeORM enums used across multiple entity files.
 * Import from this file to avoid circular dependencies.
 */

export enum SkillCategory {
  language = 'language',
  framework = 'framework',
  database = 'database',
  tool = 'tool',
}

export enum VideoSource {
  youtube = 'youtube',
  vimeo = 'vimeo',
  self_hosted = 'self_hosted',
}
