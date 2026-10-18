import { redirect } from "next/navigation";

/** Por ahora la home es el ingreso. Redirección del lado del servidor. */
export default function HomePage(): never {
  redirect("/ingresar");
}
