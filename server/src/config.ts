export const config = {
  port: Number(process.env.PORT ?? 3000),
  appUrl: process.env.APP_URL ?? 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL ?? 'postgres://acme:acme@localhost:5432/acme',
  databasePoolSize: Number(process.env.DATABASE_POOL_SIZE ?? 10),
  emailApiUrl: process.env.EMAIL_API_URL ?? 'http://localhost:4010',
  emailApiKey: process.env.EMAIL_API_KEY ?? 'dev',
  paymentsApiUrl: process.env.PAYMENTS_API_URL ?? 'http://localhost:4020',
  paymentsApiKey: process.env.PAYMENTS_API_KEY ?? 'dev',
}
