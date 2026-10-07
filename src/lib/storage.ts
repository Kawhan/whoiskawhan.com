// Acesso ao localStorage pode lançar SecurityError (storage bloqueado, in-app
// browsers, alguns modos privados). Sem storage, a preferência só não persiste.

export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Ignorado de propósito: ver comentário no topo.
  }
}
