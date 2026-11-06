-- Link do cliente estável (06/11/2026): guarda o token cifrado para "Copiar link" e reenvios
-- reutilizarem o mesmo link. Ordens antigas ficam com null e ganham um link novo uma única vez.
ALTER TABLE "ordens" ADD COLUMN IF NOT EXISTS "token_cifrado" text;
