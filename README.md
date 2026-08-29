# Savandi Kodithuwakku Portfolio

Static site. No build step, no dependencies.

    index.html          markup + all content
    css/style.css       design system ("engineering plate" dark theme)
    js/main.js          nav, scroll reveal, active section, contact form
    assets/savandi.png  portrait, background removed
    assets/Savandi_Kodithuwakku_CV.pdf

## Run locally
    python -m http.server 5173
then open http://localhost:5173

## Contact form
Messages are delivered by [Web3Forms](https://web3forms.com) — no backend,
no account. Get a free access key (enter your email on their site, the key
arrives by mail) and paste it into `WEB3FORMS_KEY` near the top of
`js/main.js`:

    var WEB3FORMS_KEY = 'your-key-here';

With a key set, submitting the form emails you directly and the visitor sees
a confirmation. If the key is empty, or the request fails, the form falls
back to opening the visitor's mail app with the message pre-filled.
A hidden `botcheck` honeypot field filters basic spam bots.

## Deploy
Drop the folder on Vercel, Netlify or GitHub Pages. It is fully static.
