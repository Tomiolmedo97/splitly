import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/session";

/**
 * La home depende de la sesión: con sesión va a Mis grupos y sin sesión a Ingresar.
 * Lee cookies, así que es dinámica y la CDN no guarda la redirección.
 */
export default async function HomePage(): Promise<never> {
  redirect((await getCurrentUser()) ? "/grupos" : "/ingresar");
}
