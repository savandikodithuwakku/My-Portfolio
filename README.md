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
By default the form validates input and opens the visitor's mail app with
the message pre-filled (one click to send).

To receive messages directly in your inbox, create a free endpoint at
formspree.io or web3forms.com and paste the URL into `FORM_ENDPOINT`
near the top of `js/main.js`.

## Deploy
Drop the folder on Vercel, Netlify or GitHub Pages. It is fully static.
