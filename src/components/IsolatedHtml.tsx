import { createSignal, onCleanup, onMount } from "solid-js"

export const IsolatedHtml = (props: { content: string }) => {
  const [height, setHeight] = createSignal(0)
  const id = `iframe-${Math.random().toString(36).slice(2, 9)}`

  const onMessage = (event: MessageEvent) => {
    if (
      event.data &&
      event.data.type === "resize" &&
      event.data.id === id &&
      event.data.height
    ) {
      setHeight(event.data.height)
    }
  }

  onMount(() => {
    window.addEventListener("message", onMessage)
  })

  onCleanup(() => {
    window.removeEventListener("message", onMessage)
  })

  const srcDoc = () => {
    const isFullHtml = /<html|<!DOCTYPE/i.test(props.content)
    const script = `
      <script>
        const sendHeight = () => {
          const height = document.documentElement.scrollHeight;
          window.parent.postMessage({
            type: "resize",
            id: "${id}",
            height: height
          }, "*");
        };
        window.addEventListener("load", sendHeight);
        new ResizeObserver(sendHeight).observe(document.body);
        document.querySelectorAll('img').forEach(img => {
          img.addEventListener('load', sendHeight);
        });
      </script>
    `
    const style = `
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        img, video, iframe { max-width: 100%; height: auto; }
      </style>
    `

    if (isFullHtml) {
      // If it's a full HTML, try to inject before </body> or just append
      if (props.content.includes("</body>")) {
        return props.content.replace("</body>", `${script}${style}</body>`)
      }
      return `${props.content}${script}${style}`
    }

    return `
      <!DOCTYPE html>
      <html>
        <head>
          ${style}
        </head>
        <body>
          <div id="content-root">${props.content}</div>
          ${script}
        </body>
      </html>
    `
  }

  return (
    <iframe
      srcdoc={srcDoc()}
      title="Isolated Content"
      style={{
        width: "100%",
        height: `${height() || 100}px`,
        border: "none",
        overflow: "hidden",
      }}
      sandbox="allow-scripts allow-popups allow-forms allow-same-origin"
    />
  )
}
