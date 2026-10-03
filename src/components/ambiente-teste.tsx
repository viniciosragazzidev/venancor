export function FaixaAmbienteTeste() {
  if (process.env.NEXT_PUBLIC_MODO_TESTE !== "true") return null;
  return (
    <div className="border-b border-amber-300/60 bg-amber-50 px-3 py-1 text-center text-xs font-medium text-amber-900">
      Ambiente de teste
    </div>
  );
}
