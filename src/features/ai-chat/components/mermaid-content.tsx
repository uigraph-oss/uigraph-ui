import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Download01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { toPng } from 'html-to-image'
import mermaid from 'mermaid'
import { useEffect, useRef, useState } from 'react'
import { IoImageOutline } from 'react-icons/io5'
import { PiFileSvgLight } from 'react-icons/pi'
import { SiMermaid } from 'react-icons/si'
import { toast } from 'sonner'

const MERMAID_CACHE = new Map<string, string>()

export function MermaidContent({ code }: { code: string }) {
  const [svg, setSvg] = useState<string>('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function render() {
      mermaid.initialize({
        suppressErrorRendering: true,
        startOnLoad: false,
      })

      if (MERMAID_CACHE.has(code)) {
        return setSvg(MERMAID_CACHE.get(code)!)
      }

      const { svg } = await mermaid.render(
        `mermaid-${Math.random().toString(36).slice(2)}`,
        code
      )

      MERMAID_CACHE.set(code, svg)
      setSvg(svg)
    }

    void render().catch(() => {})
  }, [code])

  function download(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadSvg() {
    download(svg, 'diagram.svg', 'image/svg+xml')
  }

  async function handleDownloadPng() {
    const container = containerRef.current!
    if (!container) return toast.error('Diagram not ready')

    const svgElement = container.querySelector<HTMLElement>('svg')
    if (!svgElement) return toast.error('SVG element not found')

    try {
      const png = await toPng(svgElement, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FFFFFF',
        style: { padding: '20px' },
      })

      const a = document.createElement('a')
      a.download = 'image.png'
      a.href = png
      a.click()
    } catch (err) {
      console.log(err, svg)
      toast.error('Failed to download PNG')
    }
  }

  function handleDownloadMermaid() {
    download(code, 'diagram.mmd', 'text/plain')
  }

  return (
    <div className="group border-border bg-card relative my-2 overflow-hidden rounded-lg border p-4">
      <div
        ref={containerRef}
        className="flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            preset="outline"
            className="absolute top-2 right-2 size-8! rounded-md p-0! opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
          >
            <HugeiconsIcon icon={Download01Icon} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleDownloadSvg}>
            <PiFileSvgLight />
            Download as SVG
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDownloadPng}>
            <IoImageOutline />
            Download as PNG
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleDownloadMermaid}>
            <SiMermaid />
            Download as Mermaid
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
