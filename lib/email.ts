import 'server-only'

import { Resend } from 'resend'

import { SITE_NAME, siteUrl } from '@/lib/site'

const FROM = process.env.RESEND_FROM ?? 'Chaud Devant <bonjour@chauddevant.fr>'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

/**
 * Mail de confirmation (double opt-in). Le carnet n'est envoye qu'apres le clic,
 * jamais avant : c'est ce clic qui vaut consentement.
 *
 * Renvoie false si Resend n'est pas configure ou si l'envoi echoue. L'inscrit
 * reste enregistre en base dans tous les cas — on ne perd jamais une adresse.
 */
export async function sendConfirmationEmail(params: {
  email: string
  confirmToken: string
  unsubscribeToken: string
}): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] RESEND_API_KEY absent : mail de confirmation non envoye.')
    return false
  }

  const base = siteUrl()
  const confirmUrl = `${base}/confirmation?token=${params.confirmToken}`
  const unsubscribeUrl = `${base}/desinscription?token=${params.unsubscribeToken}`

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.email,
      subject: 'Confirme ton inscription, et le carnet arrive',
      headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` },
      text: [
        'Salut,',
        '',
        "Un dernier clic et c’est bon. On veut juste être sûrs que cette adresse est bien la tienne :",
        confirmUrl,
        '',
        `Ensuite tu reçois le carnet de ${SITE_NAME} : dix recettes de cocotte, tout de suite.`,
        '',
        "Si tu n’as rien demandé, ignore ce message, il ne se passera rien.",
        '',
        `Se désinscrire : ${unsubscribeUrl}`,
      ].join('\n'),
      html: confirmationHtml({ confirmUrl, unsubscribeUrl }),
    })

    if (error) {
      console.error('[email] Resend a refuse l\'envoi', error)
      return false
    }
    return true
  } catch (error) {
    console.error('[email] envoi du mail de confirmation impossible', error)
    return false
  }
}

function confirmationHtml(params: { confirmUrl: string; unsubscribeUrl: string }): string {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:32px 16px;background:#f4ede1;font-family:Georgia,serif;color:#16110e">
    <table role="presentation" style="max-width:520px;margin:0 auto">
      <tr><td>
        <p style="font-size:28px;font-weight:700;margin:0 0 24px">${SITE_NAME}</p>
        <p style="font-size:17px;line-height:1.6;margin:0 0 20px">Salut,</p>
        <p style="font-size:17px;line-height:1.6;margin:0 0 28px">
          Un dernier clic et c’est bon. On veut juste être sûrs que cette adresse est bien la tienne.
        </p>
        <p style="margin:0 0 28px">
          <a href="${params.confirmUrl}"
             style="display:inline-block;background:#9a3320;color:#f4ede1;text-decoration:none;padding:14px 26px;font-size:17px;font-weight:700;border-radius:2px">
            Je confirme
          </a>
        </p>
        <p style="font-size:17px;line-height:1.6;margin:0 0 28px">
          Ensuite tu reçois le carnet : dix recettes de cocotte, tout de suite.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#6b5a4a;margin:0 0 8px">
          Si tu n’as rien demandé, ignore ce message, il ne se passera rien.
        </p>
        <p style="font-size:14px;line-height:1.6;color:#6b5a4a;margin:0">
          <a href="${params.unsubscribeUrl}" style="color:#6b5a4a">Se désinscrire</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`
}
