export function getEnvFilePath(): string {
  switch (process.env.NODE_ENV) {
    case 'prod':
      return '.env.prod';
    case 'dev':
      return '.env.dev';
    case 'local':
      return '.env.local';
    default:
      return '.env.local';
  }
}
