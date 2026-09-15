import { z } from 'zod';

//- validamos con zod
const envsSchema = z.object({
    PORT: z.coerce.number(),
    DATABASE_URL: z.string(),
});

//- le pasamos a zod las variables de entorno
const result  = envsSchema.safeParse(process.env);

if (!result.success) {
    throw new Error(
        `Config validation error: ${result.error.message}`,
    );
}

export const envs = {
    port: result.data.PORT,
    databaseUrl: result.data.DATABASE_URL,
};