"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast, Toaster } from "sonner";
import { Copy, Download, MessageCircle, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { drawCard } from "@/lib/draw-card";
import { readBoard, toBolivares, type DolarBoard, type DolarFuente } from "@/lib/dolar";
import { currencyLabel, formatBolivares, formatMoney, formatPercent, formatRateTime, slugify } from "@/lib/format";
import { text } from "@/lib/i18n";
import { channelLimit, messageFor, whatsappHref, type BolivarNote } from "@/lib/messages";
import { PRESET_BUILDERS } from "@/lib/presets";
import { quoteOffer } from "@/lib/quote";
import { decodeOffer, emptyOffer, encodeOffer, newLineId, sanitizeOffer } from "@/lib/share";
import type { CardStyle, Channel, Currency, Lang, LineItem, Offer } from "@/lib/types";

const STORAGE_KEY = "vitrina-v1";
const PORTFOLIO = "https://porfolio-lime-ten.vercel.app";

function readClientState(): { lang: Lang; offer: Offer; badLink: boolean } {
  const fallbackLang: Lang =
    typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
  if (typeof window === "undefined") {
    return { lang: "es", offer: PRESET_BUILDERS[0].build("es"), badLink: false };
  }

  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    const decoded = decodeOffer(hash, fallbackLang);
    if (decoded) return { lang: fallbackLang, offer: decoded, badLink: false };
    return { lang: fallbackLang, offer: PRESET_BUILDERS[0].build(fallbackLang), badLink: true };
  }

  const storedRaw = window.localStorage.getItem(STORAGE_KEY);
  if (storedRaw) {
    try {
      const stored = JSON.parse(storedRaw) as { lang?: Lang; offer?: unknown };
      const nextLang: Lang = stored.lang === "en" || stored.lang === "es" ? stored.lang : fallbackLang;
      const sanitized = sanitizeOffer(stored.offer, nextLang);
      if (sanitized) return { lang: nextLang, offer: sanitized, badLink: false };
    } catch {
      /* keep the café example */
    }
  }

  return { lang: fallbackLang, offer: PRESET_BUILDERS[0].build(fallbackLang), badLink: false };
}
const CURRENCIES: Currency[] = ["USD", "VES", "COP", "MXN", "ARS", "EUR"];
const CHANNELS: Channel[] = ["whatsapp", "instagram", "threads", "linkedin"];
const TAX_RATES: Record<string, number | null> = {
  none: 0,
  ve: 16,
  mx: 16,
  "mx-border": 8,
  co: 19,
  cl: 19,
  ar: 21,
  pe: 18,
  ec: 15,
  py: 10,
  uy: 22,
  custom: null,
};

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 ${className ?? ""}`}>
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
      {children}
    </label>
  );
}

export function VitrinaApp() {
  const [initial] = useState(readClientState);
  const [lang, setLang] = useState<Lang>(initial.lang);
  const [offer, setOffer] = useState<Offer>(initial.offer);
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [rates, setRates] = useState<DolarBoard | null>(null);
  const [rateStatus, setRateStatus] = useState<"loading" | "ready" | "error">("loading");
  const [fuente, setFuente] = useState<DolarFuente>("paralelo");
  const [rateAttempt, setRateAttempt] = useState(0);
  const t = text(lang);
  const quote = useMemo(() => quoteOffer(offer), [offer]);
  const activeRate = rates?.[fuente] ?? rates?.paralelo ?? rates?.oficial ?? null;
  const bolivar = useMemo<BolivarNote | null>(() => {
    const labels = text(lang);
    if (offer.currency === "USD" && activeRate) {
      const amount = toBolivares(quote.total, activeRate.promedio);
      if (amount === null) return null;
      return {
        amount: formatBolivares(amount),
        rateLabel: activeRate.fuente === "oficial" ? labels.dolarOfficial : labels.dolarParallel,
        rate: formatBolivares(activeRate.promedio),
      };
    }
    if (offer.currency === "EUR" && rates?.euroOficial) {
      const amount = toBolivares(quote.total, rates.euroOficial.promedio);
      if (amount === null) return null;
      return {
        amount: formatBolivares(amount),
        rateLabel: labels.euroOfficial,
        rate: formatBolivares(rates.euroOficial.promedio),
      };
    }
    return null;
  }, [activeRate, lang, offer.currency, quote.total, rates]);
  const message = useMemo(
    () => messageFor(offer, channel, lang, bolivar),
    [offer, channel, lang, bolivar],
  );
  const limit = channelLimit(channel);
  const wa = whatsappHref(offer, lang, bolivar);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dolar", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        return readBoard(await response.json());
      })
      .then((board) => {
        if (!board) throw new Error("empty");
        setRates(board);
        setRateStatus("ready");
        setFuente((current) => (board[current] ? current : board.paralelo ? "paralelo" : "oficial"));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRateStatus("error");
      });
    return () => controller.abort();
  }, [rateAttempt]);

  useEffect(() => {
    if (initial.badLink) toast.error(text(initial.lang).badLink);
  }, [initial.badLink, initial.lang]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang, offer }));
    const hash = `#${encodeOffer(offer)}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
    }
  }, [offer, lang]);

  function patch(partial: Partial<Offer>) {
    setOffer((current) => ({ ...current, ...partial }));
  }

  function patchLine(id: string, partial: Partial<LineItem>) {
    setOffer((current) => ({
      ...current,
      lines: current.lines.map((line) => (line.id === id ? { ...line, ...partial } : line)),
    }));
  }

  async function copy(value: string, success: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(success);
    } catch {
      toast.error(lang === "es" ? "No pude copiar. Selecciona el texto." : "Could not copy. Select the text.");
    }
  }

  return (
    <div className="pb-24 md:pb-10">
      <Toaster position="top-center" />
      <header className="border-b border-border/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 py-6 md:py-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">{t.eyebrow}</p>
            <h1 className="font-display mt-2 text-5xl leading-none font-semibold tracking-tight md:text-6xl">
              {t.title}
            </h1>
            <p className="mt-3 max-w-xl text-base text-muted-foreground md:text-lg">{t.lede}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setLang((current) => (current === "es" ? "en" : "es"))}
            >
              {t.lang}
            </Button>
            <Button nativeButton={false} variant="outline" render={<a href={PORTFOLIO} />}>
              {t.portfolio}
            </Button>
          </div>
        </div>
      </header>

      <RateStrip
        lang={lang}
        currency={offer.currency}
        rates={rates}
        status={rateStatus}
        fuente={activeRate?.fuente ?? fuente}
        bolivar={bolivar?.amount ?? null}
        onFuente={setFuente}
        onRetry={() => {
          setRateStatus("loading");
          setRateAttempt((current) => current + 1);
        }}
      />

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t.examples}
            </span>
            {PRESET_BUILDERS.map((preset) => (
              <Button
                key={preset.id}
                size="sm"
                variant="secondary"
                onClick={() => setOffer(preset.build(lang))}
              >
                {t[preset.id]}
              </Button>
            ))}
            <Button size="sm" variant="ghost" onClick={() => setOffer(emptyOffer(lang))}>
              {t.clear}
            </Button>
          </div>

          <h2 className="font-display mt-6 text-2xl font-semibold">{t.business}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label={t.business}>
              <Input
                value={offer.business}
                placeholder={t.businessPh}
                onChange={(event) => patch({ business: event.target.value })}
              />
            </Field>
            <Field label={t.city}>
              <Input
                value={offer.city}
                placeholder={t.cityPh}
                onChange={(event) => patch({ city: event.target.value })}
              />
            </Field>
            <Field label={t.whatsapp}>
              <Input
                inputMode="tel"
                value={offer.whatsapp}
                placeholder={t.whatsappPh}
                onChange={(event) => patch({ whatsapp: event.target.value })}
              />
            </Field>
          </div>

          <h2 className="font-display mt-8 text-2xl font-semibold">{t.offer}</h2>
          <div className="mt-3 grid gap-3">
            <Field label={t.offerTitle}>
              <Input
                value={offer.title}
                placeholder={t.offerTitlePh}
                onChange={(event) => patch({ title: event.target.value })}
              />
            </Field>
            <Field label={t.note}>
              <Textarea
                value={offer.note}
                placeholder={t.notePh}
                rows={3}
                onChange={(event) => patch({ note: event.target.value })}
              />
            </Field>
            <Field label={t.days} className="max-w-40">
              <Input
                type="number"
                min={1}
                max={365}
                value={offer.validDays}
                onChange={(event) => patch({ validDays: Number(event.target.value) })}
              />
            </Field>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold">{t.lines}</h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                patch({
                  lines: [
                    ...offer.lines,
                    { id: newLineId(), name: "", qty: 1, unitCost: 0, unitPrice: 0 },
                  ],
                })
              }
              disabled={offer.lines.length >= 12}
            >
              <Plus />
              {t.add}
            </Button>
          </div>

          <div className="mt-3 grid gap-3">
            {offer.lines.map((line, index) => {
              const row = quote.lines[index];
              return (
                <div
                  key={line.id}
                  className={`grid gap-2 rounded-2xl border p-3 sm:grid-cols-[minmax(0,1.4fr)_72px_96px_96px_auto] ${
                    row?.belowCost ? "border-destructive/50 bg-destructive/5" : "border-border"
                  }`}
                >
                  <Field label={t.item}>
                    <Input
                      value={line.name}
                      onChange={(event) => patchLine(line.id, { name: event.target.value })}
                    />
                  </Field>
                  <Field label={t.qty}>
                    <Input
                      type="number"
                      min={0}
                      step="1"
                      value={line.qty}
                      onChange={(event) => patchLine(line.id, { qty: Number(event.target.value) })}
                    />
                  </Field>
                  <Field label={t.cost}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitCost}
                      onChange={(event) => patchLine(line.id, { unitCost: Number(event.target.value) })}
                    />
                  </Field>
                  <Field label={t.price}>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(event) => patchLine(line.id, { unitPrice: Number(event.target.value) })}
                    />
                  </Field>
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={t.remove}
                      disabled={offer.lines.length === 1}
                      onClick={() =>
                        patch({ lines: offer.lines.filter((item) => item.id !== line.id) })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <h2 className="font-display mt-8 text-2xl font-semibold">{t.tax}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label={t.tax}>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={offer.taxPreset}
                onChange={(event) => {
                  const value = event.target.value;
                  const rate = TAX_RATES[value];
                  patch({
                    taxPreset: value,
                    taxPercent: rate === null || rate === undefined ? offer.taxPercent : rate,
                  });
                }}
              >
                {Object.keys(TAX_RATES).map((id) => (
                  <option key={id} value={id}>
                    {t.taxes[id as keyof typeof t.taxes]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t.currency}>
              <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={offer.currency}
                onChange={(event) => patch({ currency: event.target.value as Currency })}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currencyLabel(currency)}
                  </option>
                ))}
              </select>
            </Field>
            {offer.taxPreset === "custom" ? (
              <Field label={t.customTax}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={offer.taxPercent}
                  onChange={(event) => patch({ taxPercent: Number(event.target.value) })}
                />
              </Field>
            ) : null}
            <Field label={t.discount}>
              <Input
                type="number"
                min={0}
                max={100}
                value={offer.discountPercent}
                onChange={(event) => patch({ discountPercent: Number(event.target.value) })}
              />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Switch
              checked={offer.taxIncluded}
              onCheckedChange={(checked) => patch({ taxIncluded: checked })}
              id="tax-included"
            />
            <Label htmlFor="tax-included">{t.taxIncluded}</Label>
          </div>

          <h2 className="font-display mt-8 text-2xl font-semibold">{t.cardLook}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["paper", t.paper],
                ["ink", t.ink],
                ["clinic", t.clinicStyle],
              ] as const
            ).map(([style, label]) => (
              <Button
                key={style}
                size="sm"
                variant={offer.cardStyle === style ? "default" : "outline"}
                onClick={() => patch({ cardStyle: style as CardStyle })}
              >
                {label}
              </Button>
            ))}
          </div>
        </section>

        <PublishPanel
          lang={lang}
          offer={offer}
          channel={channel}
          onChannel={setChannel}
          message={message}
          limit={limit}
          quote={quote}
          wa={wa}
          bolivar={bolivar?.amount ?? null}
          cardLine={bolivar ? `${bolivar.amount} · ${bolivar.rateLabel}` : null}
          onCopy={() => copy(message, t.copied)}
          onShare={() =>
            copy(`${window.location.origin}${window.location.pathname}#${encodeOffer(offer)}`, t.shared)
          }
        />
      </main>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">{t.researchKicker}</p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl font-semibold tracking-tight">
            {t.researchTitle}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">{t.researchBody}</p>
          <p className="mt-3 max-w-3xl text-base leading-relaxed">{t.researchGap}</p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{t.taxNote}</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a
              className="underline decoration-border underline-offset-4"
              href="https://conectamidia.net/2026/04/30/pequenos-negocios-ampliam-vendas-on-line-com-o-whatsapp/"
            >
              {t.sourceSebrae}
            </a>
            <a
              className="underline decoration-border underline-offset-4"
              href="https://iccwbo.org/news-publications/policies-reports/msmes-digital-exports-in-latin-america/"
            >
              {t.sourceIcc}
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {t.made} · <a className="underline underline-offset-4" href={PORTFOLIO}>{t.portfolio}</a>
          </p>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{t.total}</p>
            <p className="font-display text-2xl font-semibold">{formatMoney(quote.total, offer.currency, lang)}</p>
            {bolivar ? <p className="text-xs text-muted-foreground">{bolivar.amount}</p> : null}
          </div>
          <Button
            onClick={() => document.getElementById("publicar")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t.publish}
          </Button>
        </div>
      </div>
    </div>
  );
}

function RateStrip({
  lang,
  currency,
  rates,
  status,
  fuente,
  bolivar,
  onFuente,
  onRetry,
}: {
  lang: Lang;
  currency: Currency;
  rates: DolarBoard | null;
  status: "loading" | "ready" | "error";
  fuente: DolarFuente;
  bolivar: string | null;
  onFuente: (fuente: DolarFuente) => void;
  onRetry: () => void;
}) {
  const t = text(lang);
  const rows = (
    [
      ["paralelo", t.dolarParallel],
      ["oficial", t.dolarOfficial],
    ] as const
  ).flatMap(([id, label]) => {
    const quote = rates?.[id];
    return quote ? [{ id, label, quote }] : [];
  });

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold">{t.dolarTitle}</h2>
          <a
            className="text-xs text-muted-foreground underline decoration-border underline-offset-4"
            href="https://dolarapi.com/docs/venezuela/"
          >
            DolarApi
          </a>
        </div>

        {status === "loading" && !rates ? (
          <p className="mt-3 text-sm text-muted-foreground">{t.dolarLoading}</p>
        ) : null}

        {status === "error" && !rates ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">{t.dolarError}</p>
            <Button size="sm" variant="outline" onClick={onRetry}>
              {t.dolarRetry}
            </Button>
          </div>
        ) : null}

        {rows.length > 0 || rates?.euroOficial ? (
          <>
            {rows.length > 0 ? <p className="mt-3 text-sm text-muted-foreground">{t.dolarUse}</p> : null}
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row) => {
                const selected = currency === "USD" && row.id === fuente;
                const updated = formatRateTime(row.quote.fechaActualizacion, lang);
                return (
                  <button
                    key={row.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onFuente(row.id)}
                    className={`rounded-2xl border p-3 text-left ${
                      selected ? "border-primary bg-primary/5" : "border-border"
                    }`}
                  >
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      {row.label}
                    </p>
                    <p className="font-display mt-1 text-3xl font-semibold tracking-tight">
                      {formatBolivares(row.quote.promedio)}
                    </p>
                    {updated ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.dolarUpdated} {updated}
                      </p>
                    ) : null}
                  </button>
                );
              })}
              {rates?.euroOficial ? (
                <div
                  className={`rounded-2xl border p-3 ${
                    currency === "EUR" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {t.euroOfficial}
                  </p>
                  <p className="font-display mt-1 text-3xl font-semibold tracking-tight">
                    {formatBolivares(rates.euroOficial.promedio)}
                  </p>
                  {formatRateTime(rates.euroOficial.fechaActualizacion, lang) ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.dolarUpdated} {formatRateTime(rates.euroOficial.fechaActualizacion, lang)}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">{t.euroHint}</p>
                </div>
              ) : null}
            </div>
            {(currency === "USD" || currency === "EUR") && bolivar ? (
              <p className="mt-4 text-sm">
                <span className="text-muted-foreground">{t.dolarBs}</span>
                <span className="font-display ml-2 text-2xl font-semibold">{bolivar}</span>
              </p>
            ) : null}
            {currency === "VES" ? <p className="mt-4 text-sm text-muted-foreground">{t.dolarAlready}</p> : null}
            {currency !== "USD" && currency !== "EUR" && currency !== "VES" ? (
              <p className="mt-4 text-sm text-muted-foreground">{t.dolarOnly}</p>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">{t.dolarNote}</p>
            {status === "error" ? (
              <Button size="sm" variant="ghost" className="mt-2" onClick={onRetry}>
                {t.dolarRetry}
              </Button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}

function PublishPanel({
  lang,
  offer,
  channel,
  onChannel,
  message,
  limit,
  quote,
  wa,
  bolivar,
  cardLine,
  onCopy,
  onShare,
}: {
  lang: Lang;
  offer: Offer;
  channel: Channel;
  onChannel: (channel: Channel) => void;
  message: string;
  limit: number;
  quote: ReturnType<typeof quoteOffer>;
  wa: string | null;
  bolivar: string | null;
  cardLine: string | null;
  onCopy: () => void;
  onShare: () => void;
}) {
  const t = text(lang);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const over = message.length > limit;
  const marginUp = quote.margin >= 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const style = getComputedStyle(canvas);
    const display = style.getPropertyValue("--font-fraunces").trim() || "Georgia, serif";
    const sans = style.getPropertyValue("--font-dm").trim() || "sans-serif";
    document.fonts.ready.then(() => {
      drawCard(canvas, offer, lang, { display, sans }, cardLine);
    });
  }, [offer, lang, cardLine]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vitrina-${slugify(offer.title || offer.business)}.png`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success(t.downloaded);
    });
  }

  return (
    <aside id="publicar" className="lg:sticky lg:top-4 lg:self-start">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">{t.total}</p>
            <p className="font-display text-4xl font-semibold tracking-tight">
              {formatMoney(quote.total, offer.currency, lang)}
            </p>
            {bolivar ? (
              <p className="mt-1 text-sm text-primary">
                {text(lang).dolarBs}: {bolivar}
              </p>
            ) : null}
          </div>
          <Badge variant="secondary">{currencyLabel(offer.currency)}</Badge>
        </div>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <div>
            <dt className="text-muted-foreground">{t.base}</dt>
            <dd>{formatMoney(quote.base, offer.currency, lang)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t.taxRow}</dt>
            <dd>{formatMoney(quote.tax, offer.currency, lang)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">{t.discountRow}</dt>
            <dd>{formatMoney(quote.discount, offer.currency, lang)}</dd>
          </div>
        </dl>

        <div className={`mt-4 rounded-2xl p-3 ${marginUp ? "bg-[#e7efe6]" : "bg-destructive/10"}`}>
          <p className="text-xs tracking-wide text-muted-foreground uppercase">{t.margin}</p>
          <p className="font-display text-2xl font-semibold">
            {formatMoney(quote.margin, offer.currency, lang)}
            {quote.marginPct !== null ? (
              <span className="ml-2 text-base font-medium text-muted-foreground">
                {" "}
                {formatPercent(quote.marginPct, lang)}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t.marginHint}</p>
          {quote.belowCost ? <p className="mt-1 text-sm text-destructive">{t.under}</p> : null}
        </div>

        {quote.total <= 0 ? <p className="mt-3 text-sm text-muted-foreground">{t.emptyTotal}</p> : null}

        <canvas ref={canvasRef} className="mt-4 w-full rounded-2xl border border-border" aria-label={t.cardLook} />
        <Button variant="outline" className="mt-3 w-full" onClick={download}>
          <Download />
          {t.download}
        </Button>

        <Tabs value={channel} onValueChange={(value) => onChannel(value as Channel)} className="mt-5">
          <TabsList className="w-full">
            {CHANNELS.map((item) => (
              <TabsTrigger key={item} value={item} className="px-1 text-xs sm:text-sm">
                {t.channels[item]}
              </TabsTrigger>
            ))}
          </TabsList>
          {CHANNELS.map((item) => (
            <TabsContent key={item} value={item}>
              <pre className="mt-3 max-h-64 overflow-auto rounded-2xl bg-muted p-3 font-sans text-sm whitespace-pre-wrap">
                {message}
              </pre>
            </TabsContent>
          ))}
        </Tabs>
        <p className={`mt-2 text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}>
          {message.length}/{limit} {t.chars}
          {over ? ` · ${t.over}` : ""}
        </p>

        <div className="mt-3 grid gap-2">
          <Button onClick={onCopy}>
            <Copy />
            {t.copy}
          </Button>
          {wa ? (
            <Button
              nativeButton={false}
              variant="outline"
              render={<a href={wa} target="_blank" rel="noreferrer" />}
            >
              <MessageCircle />
              {t.openWa}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">{t.needPhone}</p>
          )}
          <Button variant="ghost" onClick={onShare}>
            {t.share}
          </Button>
        </div>
      </div>
    </aside>
  );
}
