export const printReportElement = (element: HTMLElement | null, title: string) => {
  if (!element || typeof window === "undefined") return

  const printWindow = window.open("", "_blank", "width=1024,height=768")
  if (!printWindow) return

  const { document: printDocument } = printWindow
  const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
    .map((node) => node.outerHTML)
    .join("")
  const htmlClass = document.documentElement.className
  const content = element.outerHTML

  printDocument.open()
  printDocument.write(`<!doctype html>
    <html class="${htmlClass}">
      <head>
        <base href="${window.location.origin}">
        <title>${title}</title>
        ${styles}
        <style>
    body { background: white !important; }
    .print-hidden { display: none !important; }
    .print-only { display: block !important; }
        </style>
      </head>
      <body>${content}</body>
    </html>`)
  printDocument.close()

  const images = Array.from(printDocument.images)
  const waitForImages = images.map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) {
          resolve()
          return
        }
        img.onload = () => resolve()
        img.onerror = () => resolve()
      }),
  )

  const fontsReady =
    "fonts" in printDocument ? (printDocument as Document & { fonts: FontFaceSet }).fonts.ready : Promise.resolve()

  printWindow.onafterprint = () => {
    printWindow.close()
  }

  const runPrint = () => {
    Promise.all([Promise.all(waitForImages), fontsReady]).then(() => {
      requestAnimationFrame(() => {
        setTimeout(() => {
          printWindow.focus()
          printWindow.print()
        }, 300)
      })
    })
  }

  if (printDocument.readyState === "complete") {
    runPrint()
  } else {
    printWindow.addEventListener("load", runPrint, { once: true })
  }
}
