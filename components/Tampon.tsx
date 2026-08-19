/**
 * Marque secondaire : le tampon.
 *
 * Le coup de tampon d'un carnet de commandes de cuisine. Sert la ou le
 * logotype principal ne va pas — un coin de page, un sticker, un sceau sur une
 * photo, le dos d'une carte. Ce n'est pas un logo de remplacement : les deux
 * ne s'emploient jamais ensemble sur un meme support.
 *
 * Le leger devers est voulu et fait partie du dessin : un tampon parfaitement
 * d'aplomb n'existe pas, et c'est cette regularite-la qui trahit une machine.
 */
export function Tampon({ className, title = 'Chaud Devant' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 420 300"
      role="img"
      aria-label={title}
      className={className}
      fill="none"
      stroke="currentColor"
    >
      <g transform="rotate(-1.6 210 150)">
        <path d="M20 20 H400 V280 H20 Z" strokeWidth="9" />
        <path d="M34 34 H386 V266 H34 Z" strokeWidth="2" opacity="0.45" />
        <g strokeWidth="2.5" opacity="0.6">
          <path d="M92 80 H328" />
          <path d="M92 226 H328" />
        </g>
        <g
          fill="currentColor"
          stroke="none"
          fontFamily="var(--font-fraunces), Georgia, 'Times New Roman', serif"
          fontWeight="900"
          textAnchor="middle"
        >
          <text x="210" y="150" fontSize="60" textLength="248" lengthAdjust="spacing">
            CHAUD
          </text>
          <text x="210" y="208" fontSize="53" textLength="248" lengthAdjust="spacing">
            DEVANT
          </text>
          <text
            x="210"
            y="254"
            fontSize="15"
            fontWeight="700"
            textLength="128"
            lengthAdjust="spacing"
            opacity="0.75"
          >
            SINCE 2026
          </text>
        </g>
      </g>
    </svg>
  )
}
