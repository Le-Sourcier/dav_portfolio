export const envConfig = {
  apiUrl:
    process.env.NEXT_PUBLIC_API_URL ?? "https://server.lesourcier.space/api",
  apiTimeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 30000),
} as const;
