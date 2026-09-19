# THE LOOP Pass — sous-domaine

## URLs

- Guide (consommateurs) : `https://www.theloop-app.com/`
- Commerces (Pass) : `https://pass.theloop-app.com/`
- Ancienne URL `/pass` → redirection 301 vers le sous-domaine

## DNS (à faire chez le registrar / DNS)

Ajouter un enregistrement pour le sous-domaine, pointé vers Vercel :

| Type | Nom  | Valeur              |
|------|------|---------------------|
| CNAME | `pass` | `cname.vercel-dns.com` |

(ou l’enregistrement A/CNAME indiqué dans le dashboard Vercel pour ce domaine.)

## Vercel

1. Projet → **Settings → Domains**
2. Ajouter `pass.theloop-app.com`
3. Valider le DNS, attendre le certificat HTTPS

Le `vercel.json` + `middleware.js` du repo :

- sur l’hôte `pass.theloop-app.com`, la racine `/` affiche la landing Pass
- redirige `theloop-app.com/pass` et `www…/pass` vers `https://pass.theloop-app.com/`
- aucune UI ni lien croisé entre les deux vitrines

> Note : un simple `rewrite` dans `vercel.json` ne suffit pas, car Vercel sert d’abord `index.html` à la racine. Le middleware Edge force le bon contenu pour le sous-domaine.
