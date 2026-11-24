export const queryKeys = {
  categorias: {
    all: ['categorias'] as const,
  },
  productos: {
    all: ['productos'] as const,
    lista: (filtros: object) => ['productos', filtros] as const,
  },
  pedidos: {
    all: ['pedidos'] as const,
    lista: (filtros: object) => ['pedidos', filtros] as const,
    resumen: ['pedidos', 'resumen'] as const,
  },
  usuarios: {
    all: ['usuarios'] as const,
  },
} as const;
