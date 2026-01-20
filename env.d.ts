
// Augment the NodeJS namespace to provide types for process.env.
// This avoids "Cannot redeclare block-scoped variable 'process'" errors in environments where 'process' is already defined.
declare namespace NodeJS {
  interface Process {
    cwd(): string;
  }
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
