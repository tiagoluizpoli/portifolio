# Portfolio

Tiago's personal portfolio: a bilingual landing page that presents his work to recruiters.

## Language

**Showcase project**:
A piece of work featured on the landing page (e.g. Church), with its own description and images.
_Avoid_: Project (that means a Dokploy project), solution

**Showcase status**:
How a Showcase project stands today: _In production · Actively developed_ (running, used and still evolving), _In production_ (running and stable), or _Coming soon_ (not launched yet). "In production" never implies anyone can sign up.
_Avoid_: Live, done, in development

**Hero**:
The first Section: who Tiago is, how to reach him, and his headline GitHub numbers.
_Avoid_: Home

**Section**:
One block of the single landing page (e.g. hero, experience, Showcase projects).
_Avoid_: Page

**v1**:
The current portfolio stack (SPA + Directus + its Postgres + github-stats), kept as reference until sign-off.
_Avoid_: Legacy, old site, corpse

**Development**:
The environment on the homelab, where Tiago tries out code and content first. Reachable only inside his private network.
_Avoid_: Staging, dev site

**Production**:
The public environment visitors see.
_Avoid_: Live, prod site

**Release**:
A version of the site (e.g. v2.0.0) shipped to Production, exactly as it was seen in Development.
_Avoid_: Deploy (any environment gets deploys; only Production gets Releases)

**Content sync**:
Copying all content from one environment to the other, in the direction Tiago chooses (send to Production, or bring from Production); the target's content is overwritten, and assets are only ever added.
_Avoid_: Promotion, merge, backup

**Management screen**:
The page in Development where Tiago pastes Section content, uploads assets and runs a Content sync.
_Avoid_: Admin, CMS, dashboard
