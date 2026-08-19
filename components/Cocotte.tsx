/**
 * La cocotte, dessinee a l'encre. C'est le totem de la marque (QG 2) et, tant
 * qu'il n'y a pas de photo, c'est elle qui doit donner faim a la place.
 *
 * Un dessin ne promet rien : il montre l'objet, pas le lieu. Il reste donc du
 * bon cote de la regle 3.6.
 */
export function Cocotte({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 190"
      role="img"
      aria-label="Une cocotte en fonte, couvercle posé, vapeur qui monte"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* La vapeur : trois volutes, jamais symetriques */}
      <g opacity="0.75" strokeWidth="3.5">
        <path d="M84 74C78 62 92 56 86 44C81 34 91 28 88 20" />
        <path d="M110 70C104 56 120 50 114 36C109 24 119 18 116 8" />
        <path d="M136 74C130 62 144 56 138 44C133 34 143 28 140 20" />
      </g>

      {/* Le bouton du couvercle */}
      <path d="M110 84V92" />
      <circle cx="110" cy="80" r="7" />

      {/* Le couvercle : un dome bas, puis le rebord */}
      <path d="M56 100C58 76 162 76 164 100" />
      <rect x="44" y="100" width="132" height="13" rx="6.5" />

      {/* Le corps, legerement evase vers le bas */}
      <path d="M58 117L58 143C58 160 72 170 90 170H130C148 170 162 160 162 143L162 117" />

      {/* Les deux oreilles */}
      <path d="M58 124C46 124 44 138 56 141" />
      <path d="M162 124C174 124 176 138 164 141" />
    </svg>
  )
}
