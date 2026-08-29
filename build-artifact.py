"""Bundle index.html + css + js + portrait into one self-contained page
(used to publish a shareable preview; the deployable site stays split)."""
import base64, re, pathlib

root = pathlib.Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "css" / "style.css").read_text(encoding="utf-8")
js = (root / "js" / "main.js").read_text(encoding="utf-8")
img = base64.b64encode((root / "assets" / "savandi.png").read_bytes()).decode()

# keep only the body content
body = html.split("<body>", 1)[1].split("</body>", 1)[0]
fonts = re.search(r'<link href="https://fonts\.googleapis[^>]+>', html).group(0)

body = body.replace('src="assets/savandi.png"', f'src="data:image/png;base64,{img}"')

# the CV file is not bundled into the preview - point at the profile instead
PROFILE = "https://www.linkedin.com/in/savandi-kodithuwakku/"
body = re.sub(
    r'<div class="cvgroup cvgroup--sm">.*?</div>',
    '<a class="btn btn--sm" href="' + PROFILE + '" '
    'target="_blank" rel="noopener">Resume</a>',
    body, flags=re.S)
body = body.replace('href="assets/Savandi_Kodithuwakku_CV.pdf" download', 'href="' + PROFILE + '" target="_blank" rel="noopener"')
body = body.replace('href="assets/Savandi_Kodithuwakku_CV.pdf"', 'href="' + PROFILE + '"')
body = body.replace('<script src="js/main.js"></script>', "")

# sandboxed frames block top-level navigation; open the mail client in a tab
js = js.replace("window.location.href = url;", "window.open(url, '_blank');")

out = (
    "<title>Savandi Kodithuwakku</title>\n"
    + fonts + "\n"
    + "<style>\n" + css + "\n</style>\n"
    + body
    + "\n<script>\n" + js + "\n</script>\n"
)
(root / "artifact.html").write_text(out, encoding="utf-8")
print("artifact.html:", len(out), "bytes")
