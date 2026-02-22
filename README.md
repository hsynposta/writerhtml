# WriterHTML

A clean, distraction-free writing tool for book writing and academic purposes.
Runs entirely in the browser — no server or build step required.

## Features

- **Rich text editing** — bold, italic, underline, strikethrough
- **Document structure** — H1 / H2 / H3 headings, paragraphs, bullet & numbered lists, block quotes, horizontal rules
- **Live word & character count**
- **Auto-save** to browser `localStorage` so your draft survives a page refresh
- **Export to HTML** — preview the generated markup, copy it to the clipboard, or download a standalone `.html` file
- **Keyboard shortcuts** — `Ctrl/⌘ + B`, `I`, `U` for formatting; `Ctrl/⌘ + S` to manually save the draft

## Usage

Open `index.html` in any modern web browser — no installation needed.

```
git clone https://github.com/hsynposta/writerhtml.git
cd writerhtml
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows
```

## File structure

```
writerhtml/
├── index.html   — application page
├── style.css    — styles
├── app.js       — editor logic
└── README.md
```

## License

MIT
