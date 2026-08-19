import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Propositions', robots: { index: false } }

const TYPO = {
  fill: 'currentColor',
  stroke: 'none',
  fontFamily: "var(--font-fraunces), Georgia, serif",
  fontWeight: 900,
} as const

/** 1 — LE TAMPON. Le coup de tampon d'un carnet de commandes de cuisine. */
function Tampon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 300" className={className} fill="none" stroke="currentColor" role="img" aria-label="Chaud Devant">
      <g transform="rotate(-1.6 210 150)">
        <path d="M20 20 H400 V280 H20 Z" strokeWidth="9" />
        <path d="M34 34 H386 V266 H34 Z" strokeWidth="2" opacity="0.45" />
        <g strokeWidth="2.5" opacity="0.6">
          <path d="M92 80 H328" />
          <path d="M92 226 H328" />
        </g>
        <g {...TYPO} textAnchor="middle">
          <text x="210" y="150" fontSize="60" textLength="248" lengthAdjust="spacing">CHAUD</text>
          <text x="210" y="208" fontSize="53" textLength="248" lengthAdjust="spacing">DEVANT</text>
          <text x="210" y="254" fontSize="15" fontWeight={700} textLength="128" lengthAdjust="spacing" opacity="0.75">
            SINCE 2026
          </text>
        </g>
      </g>
    </svg>
  )
}

/** 2 — LA SILHOUETTE. Formes pleines : une decoupe, pas une icone au trait. */
function Silhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 450" className={className} fill="currentColor" role="img" aria-label="Chaud Devant">
      <g stroke="currentColor" fill="none" strokeWidth="10" strokeLinecap="round">
        <path d="M152 88C144 72 156 62 148 46C143 36 151 30 148 22" />
        <path d="M188 78C180 62 192 52 185 36C180 26 188 20 185 12" />
        <path d="M222 86C216 72 226 63 221 49" />
      </g>
      {/* Dome plus haut : en aplat, une calotte trop plate fait une forme molle */}
      <g transform="rotate(6 282 140)">
        <path d="M124 140C142 98 264 98 282 140 Z" />
        <path d="M191 110 H215 V100 H209 V90 H197 V100 H191 Z" />
      </g>
      <path d="M104 162 H296 V180 H104 Z" />
      <path d="M88 184 H108 V218 H88 Z" />
      <path d="M292 184 H312 V218 H292 Z" />
      <path d="M118 184 L282 184 L272 242 C270 258 256 268 240 268 L160 268 C144 268 130 258 128 242 Z" />
      <path d="M110 298 H290 V308 H110 Z" />
      <g {...TYPO} textAnchor="middle">
        <text x="200" y="362" fontSize="46" textLength="182" lengthAdjust="spacing">CHAUD</text>
        <text x="200" y="404" fontSize="41" textLength="182" lengthAdjust="spacing">DEVANT</text>
        <text x="200" y="434" fontSize="13" fontWeight={700} textLength="112" lengthAdjust="spacing" opacity="0.7">
          SINCE 2026
        </text>
      </g>
    </svg>
  )
}

/** 3 — LE TYPOGRAPHIQUE. Aucune cocotte : la vapeur monte du plat qu'on porte. */
function Typographique({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 300" className={className} fill="none" stroke="currentColor" role="img" aria-label="Chaud Devant">
      <g strokeWidth="6" strokeLinecap="round">
        <path d="M158 70C150 56 162 48 154 34C149 25 157 19 154 10" />
        <path d="M200 62C192 48 204 40 197 26C192 17 200 11 197 2" />
        <path d="M242 72C236 60 246 53 241 41" />
      </g>
      <path d="M64 86 H336 V98 H64 Z" fill="currentColor" stroke="none" />
      <g {...TYPO} textAnchor="middle">
        <text x="200" y="166" fontSize="62" textLength="264" lengthAdjust="spacing">CHAUD</text>
        <text x="200" y="228" fontSize="55" textLength="264" lengthAdjust="spacing">DEVANT</text>
        <text x="200" y="278" fontSize="15" fontWeight={700} textLength="130" lengthAdjust="spacing" opacity="0.7">
          SINCE 2026
        </text>
      </g>
      <path d="M120 250 H280" strokeWidth="1.8" opacity="0.45" />
    </svg>
  )
}

/** 4 — L'HORIZONTAL. Lockup en bandeau, pour les en-tetes et les petits formats. */
function Horizontal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 200" className={className} fill="currentColor" role="img" aria-label="Chaud Devant">
      <g stroke="currentColor" fill="none" strokeWidth="7" strokeLinecap="round">
        <path d="M70 66C63 54 73 46 66 34" />
        <path d="M92 52C85 40 95 32 89 20" />
      </g>
      <g transform="rotate(6 168 88)">
        <path d="M52 88C64 58 156 58 168 88 Z" />
        <path d="M101 66 H119 V58 H115 V50 H105 V58 H101 Z" />
      </g>
      <path d="M40 104 H180 V118 H40 Z" />
      <path d="M26 122 H44 V152 H26 Z" />
      <path d="M176 122 H194 V152 H176 Z" />
      <path d="M50 122 L170 122 L163 160 C161 172 151 179 139 179 L81 179 C69 179 59 172 57 160 Z" />
      <path d="M232 44 V160" stroke="currentColor" strokeWidth="2" opacity="0.4" />
      <g {...TYPO} textAnchor="start">
        <text x="266" y="96" fontSize="48" textLength="256" lengthAdjust="spacing">CHAUD</text>
        <text x="266" y="142" fontSize="43" textLength="256" lengthAdjust="spacing">DEVANT</text>
        <text x="266" y="172" fontSize="13" fontWeight={700} textLength="150" lengthAdjust="spacing" opacity="0.7">
          SINCE 2026
        </text>
      </g>
    </svg>
  )
}

const PISTES = [
  { id: 1, nom: 'Le tampon', idee: "Le coup de tampon d'un carnet de commandes. Aucune icône : c'est le cadre qui porte la marque, et le léger dévers empêche l'effet gabarit.", C: Tampon, large: false },
  { id: 2, nom: 'La silhouette', idee: 'Formes pleines au lieu du trait fin. Une découpe se lit comme un choix de dessin ; un contour uniforme se lit comme une banque d’icônes.', C: Silhouette, large: false },
  { id: 3, nom: 'Le typographique', idee: 'Pas de cocotte du tout. La vapeur monte du plat qu’on porte — c’est le sens littéral de « chaud devant ».', C: Typographique, large: false },
  { id: 4, nom: 'L’horizontal', idee: 'Lockup en bandeau, aligné sur une verticale. Le plus utile en en-tête de site et en petit format.', C: Horizontal, large: true },
]

export default function Propositions() {
  return (
    <main className="papier min-h-svh px-6 py-16 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-4xl font-black uppercase text-fonte">Quatre pistes</h1>
        <div className="mt-12 grid gap-12 sm:grid-cols-2">
          {PISTES.map(({ id, nom, idee, C, large }) => (
            <section key={id} className={large ? 'sm:col-span-2' : ''}>
              <div className="flex min-h-[380px] items-center justify-center border-2 border-fonte/15 bg-papier p-10">
                <C className={large ? 'w-full max-w-xl text-rouge' : 'w-full max-w-[300px] text-rouge'} />
              </div>
              <p className="mt-4 font-display text-xl font-black uppercase text-fonte">
                {id}. {nom}
              </p>
              <p className="mt-1 text-base leading-relaxed text-fonte/70">{idee}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
