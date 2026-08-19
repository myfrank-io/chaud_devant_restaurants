/**
 * Logotype Chaud Devant.
 *
 * Art Deco pour la construction — geometrie tracee a la regle, capitales
 * etirees, filets francs, formes en gradins — mais sans les tics du logo
 * generique : pas de cadre en badge, pas de soleil rayonnant parfaitement
 * symetrique, pas de millesime coince entre deux filets. Ce sont ces
 * trois-la, empiles, qui font qu'un embleme sent le gabarit.
 *
 * L'idee propre a la marque : le couvercle est souleve de biais et la vapeur
 * s'echappe par l'ouverture, du cote leve. C'est le geste que raconte le nom,
 * et cette asymetrie voulue est ce qui empeche l'ensemble d'avoir l'air
 * fabrique a la chaine.
 *
 * Les deux lignes du logotype sont justifiees a la meme largeur via
 * `textLength` : c'est ce qui donne le bloc compact du style, que « CHAUD » et
 * « DEVANT » n'auraient jamais eu a chasse naturelle.
 */
export function Logo({ className, title = 'Chaud Devant' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 400 440"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
    >
      <Cocotte />

      {/* Deux filets de largeur decroissante : le partage horizontal du style */}
      <g fill="currentColor" stroke="none">
        <path d="M110 258 H290 V266 H110 Z" />
        <path d="M132 273 H268 V277 H132 Z" opacity="0.6" />
      </g>

      <g
        fill="currentColor"
        stroke="none"
        fontFamily="var(--font-fraunces), Georgia, 'Times New Roman', serif"
        fontWeight="900"
        textAnchor="middle"
      >
        <text x="200" y="320" fontSize="46" textLength="182" lengthAdjust="spacing">
          CHAUD
        </text>
        <text x="200" y="362" fontSize="41" textLength="182" lengthAdjust="spacing">
          DEVANT
        </text>
        <text
          x="200"
          y="408"
          fontSize="13"
          textLength="196"
          lengthAdjust="spacing"
          fontWeight="700"
          opacity="0.72"
        >
          RESTAURANTS SINCE 2026
        </text>
      </g>

      <path d="M116 384 H284" strokeWidth="1.6" opacity="0.45" />
    </svg>
  )
}

/**
 * L'embleme seul, sans le logotype. Sert partout ou la marque doit apparaitre
 * en petit ou en ornement — c'est exactement la meme cocotte que dans le logo,
 * pour qu'il n'en circule jamais deux versions.
 */
export function Embleme({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="86 0 228 236"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
    >
      <Cocotte />
    </svg>
  )
}

/** Le dessin lui-meme, partage par le logotype et l'embleme. */
function Cocotte() {
  return (
    <>
      {/* La vapeur ne s'echappe que par le jour ouvert a gauche. */}
      <g strokeWidth="5" strokeLinecap="round">
        <path d="M132 96C124 82 136 74 128 60C123 51 131 45 128 36" />
        <path d="M158 80C150 66 162 58 155 44C150 35 158 29 155 20" />
        <path d="M182 72C176 60 186 53 181 41" />
      </g>

      {/* Le couvercle pivote sur son bord droit, reste pose sur le rebord :
          le jour s'ouvre donc du cote gauche, et c'est par la que ca fume. */}
      <g transform="rotate(6 282 126)">
        {/* Une seule forme fermee : un dome a base plate, pose sur le rebord */}
        <path d="M124 126C140 88 266 88 282 126 Z" strokeWidth="6" />
        {/* Bouton en gradins, au sommet du dome */}
        <path d="M191 98 H215 V88 H209 V78 H197 V88 H191 Z" strokeWidth="5.5" />
      </g>

      {/* Le bord de la cocotte, puis son corps */}
      <path d="M112 126 H288 V142 H112 Z" strokeWidth="6" />
      <path
        d="M118 142 L282 142 L272 200 C270 214 258 223 242 223 L158 223 C142 223 130 214 128 200 Z"
        strokeWidth="6"
      />
      {/* Bandes horizontales du style */}
      <g strokeWidth="3" opacity="0.55">
        <path d="M140 166 H260" />
        <path d="M145 184 H255" />
      </g>
      {/* Oreilles, en equerre */}
      <g strokeWidth="6" strokeLinecap="round">
        <path d="M112 152 H94 V178 H112" />
        <path d="M288 152 H306 V178 H288" />
      </g>
    </>
  )
}
