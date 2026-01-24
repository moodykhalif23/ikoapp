"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export default function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as { standalone?: boolean }).standalone === true

    setIsIos(ios)
    setIsStandalone(standalone)

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setShowIosHelp(false)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    let intervalId: number | null = null
    let updateFoundHandler: (() => void) | null = null
    let controllerChangeHandler: (() => void) | null = null
    let swRegistration: ServiceWorkerRegistration | null = null
    let updateToastShown = false

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          swRegistration = registration

          // Check for updates periodically in the background.
          intervalId = window.setInterval(() => {
            registration.update().catch(() => null)
          }, 60 * 60 * 1000)

          updateFoundHandler = () => {
            const installingWorker = registration.installing
            if (!installingWorker) return

            installingWorker.addEventListener("statechange", () => {
              if (
                installingWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                if (!updateToastShown) {
                  updateToastShown = true
                  toast("Update available", {
                    description: "Tap to refresh and load the latest version.",
                    action: {
                      label: "Refresh",
                      onClick: () => {
                        installingWorker.postMessage({ type: "SKIP_WAITING" })
                      }
                    }
                  })
                }
              }
            })
          }

          registration.addEventListener("updatefound", updateFoundHandler)

          controllerChangeHandler = () => {
            // No auto-reload. User triggers refresh from the toast action.
          }

          navigator.serviceWorker.addEventListener("controllerchange", controllerChangeHandler)
        })
        .catch(() => {
          // Silent fail to avoid breaking app if SW registration fails.
        })
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
      if (intervalId) window.clearInterval(intervalId)
      if (swRegistration && updateFoundHandler) {
        swRegistration.removeEventListener("updatefound", updateFoundHandler)
      }
      if (controllerChangeHandler) {
        navigator.serviceWorker.removeEventListener("controllerchange", controllerChangeHandler)
      }
    }
  }, [])

  const shouldShow = useMemo(() => {
    if (isInstalled || isStandalone) return false
    if (deferredPrompt) return true
    return isIos
  }, [deferredPrompt, isInstalled, isStandalone, isIos])

  if (!shouldShow) return null

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      await deferredPrompt.userChoice
      setDeferredPrompt(null)
      return
    }

    if (isIos) {
      setShowIosHelp((prev) => !prev)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {showIosHelp && isIos && (
        <div className="max-w-xs rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg">
          To install on iPhone/iPad, tap the Share button, then choose "Add to Home Screen."
        </div>
      )}
      <button
        type="button"
        onClick={handleInstall}
        className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
        aria-label="Install IKO BRIQ app"
      >
        Install App
      </button>
    </div>
  )
}
