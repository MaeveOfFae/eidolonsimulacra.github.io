/**
 * Desktop-companion pairing card for the device-link settings screen.
 *
 * Extracted from `DeviceLinkSettings` (5.0 workspace-release work stream: decompose the
 * giant screens into focused, individually testable sections). Two props and no behavior:
 * the pairing link text and the rendered QR data URL, with a placeholder when the code
 * could not be generated. Behavior is pinned by `DeviceLinkSettings.test.tsx`.
 */

interface DeviceLinkPairingCardProps {
  pairingText: string;
  pairingQrDataUrl: string | null;
}

export default function DeviceLinkPairingCard({ pairingText, pairingQrDataUrl }: DeviceLinkPairingCardProps) {
  return (
    <div className="rounded-md border border-border bg-background/40 p-4 text-sm text-muted-foreground">
      <div className="grid gap-4 xl:grid-cols-[14rem_minmax(0,1fr)] xl:items-start">
        <div className="rounded-md border border-border/60 bg-background/70 p-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">In-App Scanner QR</div>
          <div className="mt-3 flex justify-center">
            {pairingQrDataUrl ? (
              <img
                src={pairingQrDataUrl}
                alt="Desktop companion pairing QR code"
                className="h-56 w-56 rounded-lg border border-border/60 bg-[#171717] p-2"
              />
            ) : (
              <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-border/60 bg-background text-xs text-muted-foreground">
                QR unavailable
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Pairing Link</div>
          <div className="mt-2 break-all rounded-md border border-border/60 bg-background/70 p-3 font-mono text-xs text-foreground">
            {pairingText}
          </div>
          <p className="mt-2 text-xs">
            Scan this QR code from mobile Settings with Scan QR. System camera apps may show the raw pairing data
            instead of opening the app.
          </p>
          <p className="mt-2 text-xs">
            Use Copy Pairing Link with mobile Paste Pair Link to prefill the desktop companion URL and pair code without
            typing.
          </p>
        </div>
      </div>
    </div>
  );
}
