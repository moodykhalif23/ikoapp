export const printReportElement = (element: HTMLElement | null, title: string) => {
  if (!element || typeof window === "undefined") return

  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1024,height=768")
  if (!printWindow) return

  const { document: printDocument } = printWindow

  printDocument.open()
  printDocument.write("<!doctype html><html><head></head><body></body></html>")
  printDocument.close()

  const base = printDocument.createElement("base")
  base.href = window.location.origin
  printDocument.head.appendChild(base)

  const titleTag = printDocument.createElement("title")
  titleTag.textContent = title
  printDocument.head.appendChild(titleTag)

  const styleOverride = printDocument.createElement("style")
  styleOverride.textContent = `
    body { background: white !important; }
    .print-hidden { display: none !important; }
    .print-only { display: block !important; }
  `
  printDocument.head.appendChild(styleOverride)

  const styles = document.querySelectorAll("style, link[rel='stylesheet']")
  styles.forEach((node) => {
    printDocument.head.appendChild(node.cloneNode(true))
  })

  const wrapper = printDocument.createElement("div")
  wrapper.innerHTML = element.outerHTML
  printDocument.body.appendChild(wrapper)

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

  Promise.all(waitForImages).then(() => {
    setTimeout(() => {
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }, 250)
  })
}
