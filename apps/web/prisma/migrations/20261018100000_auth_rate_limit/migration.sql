-- Contadores de intentos de ingreso y registro (rate limit en Postgres, sin servicios extra).
-- "key" es un hash SHA-256: no se guardan emails ni IPs en claro.
CREATE TABLE "AuthRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthRateLimit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "AuthRateLimit_windowStart_idx" ON "AuthRateLimit"("windowStart");
