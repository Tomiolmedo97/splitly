import { z } from "zod";
import { LIMITS, requiredText } from "./common";

/** Email normalizado: sin espacios y en minúsculas (así se guarda en la base). */
export const EmailSchema = z.string().trim().toLowerCase().email().max(LIMITS.email);

export const PasswordSchema = z.string().min(LIMITS.passwordMin).max(LIMITS.passwordMax);

/** Registro (Server Action `register`). */
export const RegisterBodySchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    name: requiredText(LIMITS.userName),
  })
  .strict();
export type RegisterBody = z.infer<typeof RegisterBodySchema>;

/** Campos que recibe el provider de credenciales de Auth.js. */
export const CredentialsSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1).max(LIMITS.passwordMax),
});
export type Credentials = z.infer<typeof CredentialsSchema>;
