import { useState } from 'react';
import type { ReactElement } from 'react';
import { cn } from '../ui/cn';

type Tipo = 'pizza' | 'hamburguesa' | 'gaseosa' | 'agua' | 'cerveza' | 'generico';

/** Detecta qué ilustración corresponde según el nombre y la categoría del producto. */
export function detectarTipo(nombre: string, categoria?: string): Tipo {
  const t = `${nombre} ${categoria ?? ''}`.toLowerCase();
  if (/(pizza|muzza|muzzarella|napolitana|fugazzeta|calabresa)/.test(t)) return 'pizza';
  if (/(hamburguesa|burger|cheddar|cheeseburger)/.test(t)) return 'hamburguesa';
  if (/(cerveza|birra|ipa|lager)/.test(t)) return 'cerveza';
  if (/(agua|mineral|soda)/.test(t)) return 'agua';
  if (/(gaseosa|cola|bebida|refresco|jugo)/.test(t)) return 'gaseosa';
  return 'generico';
}

const FONDOS: Record<Tipo, string> = {
  pizza: 'from-amber-100 to-orange-200',
  hamburguesa: 'from-yellow-100 to-amber-200',
  gaseosa: 'from-red-100 to-rose-200',
  agua: 'from-sky-100 to-cyan-200',
  cerveza: 'from-amber-100 to-yellow-300',
  generico: 'from-orange-50 to-orange-100',
};

function Pizza() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Pizza">
      <circle cx="60" cy="60" r="46" fill="#e8a24a" />
      <circle cx="60" cy="60" r="40" fill="#f6c453" />
      <circle cx="60" cy="60" r="36" fill="#fadf7a" />
      <g fill="#d9482b">
        <circle cx="45" cy="45" r="7" />
        <circle cx="72" cy="42" r="7" />
        <circle cx="80" cy="66" r="7" />
        <circle cx="58" cy="76" r="7" />
        <circle cx="38" cy="68" r="7" />
        <circle cx="60" cy="58" r="6" />
      </g>
      <g fill="#c23a20" opacity=".5">
        <circle cx="43" cy="43" r="2" />
        <circle cx="70" cy="40" r="2" />
        <circle cx="78" cy="64" r="2" />
        <circle cx="56" cy="74" r="2" />
        <circle cx="36" cy="66" r="2" />
      </g>
      <g fill="#4f9a3f">
        <ellipse cx="55" cy="38" rx="4" ry="2" transform="rotate(30 55 38)" />
        <ellipse cx="88" cy="52" rx="4" ry="2" transform="rotate(-40 88 52)" />
        <ellipse cx="48" cy="86" rx="4" ry="2" transform="rotate(20 48 86)" />
        <ellipse cx="70" cy="86" rx="4" ry="2" transform="rotate(-20 70 86)" />
      </g>
      <path d="M60 60 L60 14 M60 60 L100 82 M60 60 L20 82" stroke="#e8a24a" strokeWidth="1.5" opacity=".6" />
    </svg>
  );
}

function Hamburguesa() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Hamburguesa">
      <path d="M22 54 Q22 22 60 22 Q98 22 98 54 Z" fill="#d98b3a" />
      <g fill="#fbe9b5">
        <ellipse cx="42" cy="34" rx="3" ry="1.6" transform="rotate(-20 42 34)" />
        <ellipse cx="60" cy="29" rx="3" ry="1.6" />
        <ellipse cx="78" cy="34" rx="3" ry="1.6" transform="rotate(20 78 34)" />
        <ellipse cx="52" cy="42" rx="3" ry="1.6" transform="rotate(10 52 42)" />
        <ellipse cx="70" cy="42" rx="3" ry="1.6" transform="rotate(-10 70 42)" />
      </g>
      <path d="M20 58 Q30 52 40 58 T60 58 T80 58 T100 58 L100 64 L20 64 Z" fill="#5fae45" />
      <path d="M24 64 H96 L90 76 L84 68 L70 78 L60 68 L48 78 L36 68 L30 76 Z" fill="#f2b632" />
      <rect x="22" y="72" width="76" height="12" rx="6" fill="#6b3a24" />
      <ellipse cx="60" cy="90" rx="38" ry="3" fill="#d94a3a" opacity=".85" />
      <path d="M22 92 H98 Q98 104 60 104 Q22 104 22 92 Z" fill="#d98b3a" />
    </svg>
  );
}

function Gaseosa() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Gaseosa">
      <rect x="50" y="10" width="20" height="10" rx="3" fill="#b91c1c" />
      <path d="M52 20 H68 V34 Q82 42 82 60 V104 Q82 112 74 112 H46 Q38 112 38 104 V60 Q38 42 52 34 Z" fill="#7f1d1d" />
      <path d="M38 62 H82 V92 H38 Z" fill="#dc2626" />
      <path d="M38 70 Q50 64 60 70 T82 70 V78 Q70 84 60 78 T38 78 Z" fill="#fff" opacity=".9" />
      <rect x="44" y="40" width="5" height="60" rx="2.5" fill="#fff" opacity=".25" />
      <circle cx="60" cy="52" r="1.6" fill="#fff" opacity=".6" />
      <circle cx="66" cy="46" r="1.2" fill="#fff" opacity=".6" />
    </svg>
  );
}

function Agua() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Agua mineral">
      <rect x="51" y="8" width="18" height="10" rx="3" fill="#0284c7" />
      <path d="M53 18 H67 V30 Q80 38 80 56 V104 Q80 112 72 112 H48 Q40 112 40 104 V56 Q40 38 53 30 Z" fill="#bae6fd" stroke="#38bdf8" strokeWidth="2" />
      <path d="M40 70 H80 V104 Q80 112 72 112 H48 Q40 112 40 104 Z" fill="#7dd3fc" />
      <rect x="40" y="52" width="40" height="16" fill="#0284c7" />
      <path d="M60 56 Q56 62 60 64 Q64 62 60 56 Z" fill="#fff" />
      <rect x="45" y="36" width="4" height="64" rx="2" fill="#fff" opacity=".5" />
    </svg>
  );
}

function Cerveza() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Cerveza">
      <ellipse cx="60" cy="20" rx="26" ry="6" fill="#d4d4d8" />
      <rect x="34" y="20" width="52" height="86" rx="6" fill="#d97706" />
      <ellipse cx="60" cy="106" rx="26" ry="6" fill="#b45309" />
      <rect x="34" y="42" width="52" height="38" fill="#fef3c7" />
      <path d="M60 50 l5 8 h-10 z M60 72 l5 -8 h-10 z" fill="#d97706" />
      <rect x="40" y="26" width="5" height="74" rx="2.5" fill="#fff" opacity=".3" />
      <ellipse cx="60" cy="20" rx="26" ry="6" fill="#e4e4e7" />
      <ellipse cx="60" cy="19" rx="10" ry="2.5" fill="#a1a1aa" />
    </svg>
  );
}

function Generico() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-label="Plato de comida">
      <ellipse cx="60" cy="96" rx="40" ry="6" fill="#000" opacity=".08" />
      <circle cx="60" cy="58" r="38" fill="#fff" stroke="#fdba74" strokeWidth="4" />
      <circle cx="60" cy="58" r="26" fill="#fed7aa" />
      <path d="M30 20 V40 M26 20 V36 M34 20 V36 M30 40 V52" stroke="#9a3412" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M92 20 Q100 32 92 44 V52" stroke="#9a3412" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const ILUSTRACIONES: Record<Tipo, () => ReactElement> = {
  pizza: Pizza,
  hamburguesa: Hamburguesa,
  gaseosa: Gaseosa,
  agua: Agua,
  cerveza: Cerveza,
  generico: Generico,
};

interface ProductoImagenProps {
  nombre: string;
  categoria?: string;
  imagenUrl?: string | null;
  className?: string;
}

/**
 * Muestra la foto del producto (imagen_url) y, si no hay o falla al cargar,
 * una ilustración acorde al tipo de producto (pizza, hamburguesa, bebida…).
 */
export function ProductoImagen({ nombre, categoria, imagenUrl, className }: ProductoImagenProps) {
  const [fallo, setFallo] = useState(false);
  const tipo = detectarTipo(nombre, categoria);
  const Ilustracion = ILUSTRACIONES[tipo];

  if (imagenUrl && !fallo) {
    return (
      <img
        src={imagenUrl}
        alt={nombre}
        loading="lazy"
        onError={() => setFallo(true)}
        className={cn('object-cover', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br p-4',
        FONDOS[tipo],
        className,
      )}
    >
      <div className="h-full max-h-36 w-full max-w-36 drop-shadow-md transition-transform duration-300 group-hover:scale-110">
        <Ilustracion />
      </div>
    </div>
  );
}
