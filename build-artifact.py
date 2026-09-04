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

# inline any achievement photos that exist; drop the tag for ones not added yet
for f in sorted((root / "assets" / "achievements").glob("*")):
    if f.suffix.lower() in (".jpg", ".jpeg", ".png", ".webp"):
        mime = "jpeg" if f.suffix.lower() in (".jpg", ".jpeg") else f.suffix.lstrip(".").lower()
        data = base64.b64encode(f.read_bytes()).decode()
        body = body.replace(f'src="assets/achievements/{f.name}"',
                            f'src="data:image/{mime};base64,{data}"')

# the CV file is not bundled into the preview - point at the profile instead
PROFILE = "https://www.linkedin.com/in/savandi-kodithuwakku/"
body = re.sub(
    r'<div class="cvgroup cvgroup--sm">.*?</div>',
    '<a class="btn btn--sm" href="' + PROFILE + '" '
    'target="_blank" rel="noopener">Resume</a>',
    body, flags=re.S)
body = body.replace('href="assets/Savandi_Kodithuwakku_CV.pdf" download', 'href="' + PROFILE + '" target="_blank" rel="noopener"')
body = body.replace('href="assets/Savandi_Kodithuwakku_CV.pdf"', 'href="' + PROFILE + '"')
body = re.sub(r'<script src="js/main\.js[^"]*"></script>', "", body)

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
