import type { Color } from "../models/interfaces.js";

// ── Attribute interfaces ──────────────────────────────────────────

export interface RectAttrs {
  fill?: Color;
  stroke?: Color;
  strokeWidth?: number;
  opacity?: number;
}

export interface TextAttrs {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  fill?: Color;
  textAnchor?: "start" | "middle" | "end";
}

export interface EllipseAttrs {
  fill?: Color;
  stroke?: Color;
  strokeWidth?: number;
}

export interface LineAttrs {
  stroke?: Color;
  strokeWidth?: number;
  opacity?: number;
}

export interface GradientStop {
  offset: number;
  color: Color;
  opacity?: number;
}

export interface GroupAttrs {
  opacity?: number;
}

// ── SVG element types ─────────────────────────────────────────────

interface RectElement {
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  attrs: RectAttrs;
}

interface TextElement {
  type: "text";
  content: string;
  x: number;
  y: number;
  attrs: TextAttrs;
}

interface EllipseElement {
  type: "ellipse";
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  attrs: EllipseAttrs;
}

interface ImageElement {
  type: "image";
  href: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LineElement {
  type: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  attrs: LineAttrs;
}

interface GroupElement {
  type: "group";
  attrs: GroupAttrs;
  children: SvgElement[];
}

interface DefsElement {
  type: "defs";
  children: SvgElement[];
}

interface RadialGradientElement {
  type: "radialGradient";
  id: string;
  stops: GradientStop[];
}

type SvgElement =
  | RectElement
  | TextElement
  | EllipseElement
  | ImageElement
  | LineElement
  | GroupElement
  | DefsElement
  | RadialGradientElement;

// ── XML helpers ───────────────────────────────────────────────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function colorToSvg(c: Color): string {
  return `rgb(${c.r},${c.g},${c.b})`;
}

function colorOpacity(c: Color): number {
  return c.a / 255;
}

// ── Element serialization ─────────────────────────────────────────

function serializeElement(el: SvgElement): string {
  switch (el.type) {
    case "rect":
      return serializeRect(el);
    case "text":
      return serializeText(el);
    case "ellipse":
      return serializeEllipse(el);
    case "image":
      return serializeImage(el);
    case "line":
      return serializeLine(el);
    case "group":
      return serializeGroup(el);
    case "defs":
      return serializeDefs(el);
    case "radialGradient":
      return serializeRadialGradient(el);
  }
}

function serializeRect(el: RectElement): string {
  const a = el.attrs;
  let s = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"`;

  if (a.fill) {
    s += ` fill="${colorToSvg(a.fill)}"`;
    const op = colorOpacity(a.fill);
    if (op < 1) s += ` fill-opacity="${op}"`;
  } else if (!a.stroke) {
    s += ` fill="none"`;
  } else {
    s += ` fill="none"`;
  }

  if (a.stroke) {
    s += ` stroke="${colorToSvg(a.stroke)}"`;
    const op = colorOpacity(a.stroke);
    if (op < 1) s += ` stroke-opacity="${op}"`;
  }
  if (a.strokeWidth != null) s += ` stroke-width="${a.strokeWidth}"`;
  if (a.opacity != null) s += ` opacity="${a.opacity}"`;

  s += `/>`;
  return s;
}

function serializeText(el: TextElement): string {
  const a = el.attrs;
  let s = `<text x="${el.x}" y="${el.y}"`;

  if (a.fontFamily) s += ` font-family="${escapeXml(a.fontFamily)}"`;
  if (a.fontSize != null) s += ` font-size="${a.fontSize}"`;
  if (a.fontWeight && a.fontWeight !== "normal") s += ` font-weight="${a.fontWeight}"`;
  if (a.fill) {
    s += ` fill="${colorToSvg(a.fill)}"`;
    const op = colorOpacity(a.fill);
    if (op < 1) s += ` fill-opacity="${op}"`;
  }
  if (a.textAnchor && a.textAnchor !== "start") s += ` text-anchor="${a.textAnchor}"`;

  s += `>${escapeXml(el.content)}</text>`;
  return s;
}

function serializeEllipse(el: EllipseElement): string {
  const a = el.attrs;
  let s = `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}"`;

  if (a.fill) {
    s += ` fill="${colorToSvg(a.fill)}"`;
    const op = colorOpacity(a.fill);
    if (op < 1) s += ` fill-opacity="${op}"`;
  } else {
    s += ` fill="none"`;
  }

  if (a.stroke) {
    s += ` stroke="${colorToSvg(a.stroke)}"`;
    const op = colorOpacity(a.stroke);
    if (op < 1) s += ` stroke-opacity="${op}"`;
  }
  if (a.strokeWidth != null) s += ` stroke-width="${a.strokeWidth}"`;

  s += `/>`;
  return s;
}

function serializeImage(el: ImageElement): string {
  return `<image href="${escapeXml(el.href)}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"/>`;
}

function serializeLine(el: LineElement): string {
  const a = el.attrs;
  let s = `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}"`;

  if (a.stroke) {
    s += ` stroke="${colorToSvg(a.stroke)}"`;
    const op = colorOpacity(a.stroke);
    if (op < 1) s += ` stroke-opacity="${op}"`;
  }
  if (a.strokeWidth != null) s += ` stroke-width="${a.strokeWidth}"`;
  if (a.opacity != null) s += ` opacity="${a.opacity}"`;

  s += `/>`;
  return s;
}

function serializeGroup(el: GroupElement): string {
  let s = `<g`;
  if (el.attrs.opacity != null) s += ` opacity="${el.attrs.opacity}"`;
  s += `>`;
  for (const child of el.children) {
    s += serializeElement(child);
  }
  s += `</g>`;
  return s;
}

function serializeDefs(el: DefsElement): string {
  let s = `<defs>`;
  for (const child of el.children) {
    s += serializeElement(child);
  }
  s += `</defs>`;
  return s;
}

function serializeRadialGradient(el: RadialGradientElement): string {
  let s = `<radialGradient id="${escapeXml(el.id)}">`;
  for (const stop of el.stops) {
    s += `<stop offset="${stop.offset}" stop-color="${colorToSvg(stop.color)}"`;
    const op = stop.opacity ?? colorOpacity(stop.color);
    if (op < 1) s += ` stop-opacity="${op}"`;
    s += `/>`;
  }
  s += `</radialGradient>`;
  return s;
}

// ── SvgBuilder ────────────────────────────────────────────────────

export class SvgBuilder {
  private readonly elements: SvgElement[] = [];
  private readonly parent: SvgBuilder | null;
  private readonly parentType: "group" | "defs" | null;
  private readonly groupAttrs: GroupAttrs;
  private readonly svgWidth: number;
  private readonly svgHeight: number;

  constructor(width: number, height: number);
  constructor(parent: SvgBuilder, type: "group" | "defs", attrs?: GroupAttrs);
  constructor(
    widthOrParent: number | SvgBuilder,
    heightOrType: number | "group" | "defs",
    attrs?: GroupAttrs,
  ) {
    if (typeof widthOrParent === "number") {
      this.svgWidth = widthOrParent;
      this.svgHeight = heightOrType as number;
      this.parent = null;
      this.parentType = null;
      this.groupAttrs = {};
    } else {
      this.svgWidth = 0;
      this.svgHeight = 0;
      this.parent = widthOrParent;
      this.parentType = heightOrType as "group" | "defs";
      this.groupAttrs = attrs ?? {};
    }
  }

  rect(x: number, y: number, w: number, h: number, attrs: RectAttrs = {}): this {
    this.elements.push({ type: "rect", x, y, width: w, height: h, attrs });
    return this;
  }

  text(content: string, x: number, y: number, attrs: TextAttrs = {}): this {
    this.elements.push({ type: "text", content, x, y, attrs });
    return this;
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, attrs: EllipseAttrs = {}): this {
    this.elements.push({ type: "ellipse", cx, cy, rx, ry, attrs });
    return this;
  }

  image(href: string, x: number, y: number, w: number, h: number): this {
    this.elements.push({ type: "image", href, x, y, width: w, height: h });
    return this;
  }

  line(x1: number, y1: number, x2: number, y2: number, attrs: LineAttrs = {}): this {
    this.elements.push({ type: "line", x1, y1, x2, y2, attrs });
    return this;
  }

  /** Create a nested `<g>` group. Call `.end()` on the returned builder to return to this builder. */
  group(attrs: GroupAttrs = {}): SvgBuilder {
    return new SvgBuilder(this, "group", attrs);
  }

  /** Create a `<defs>` section. Call `.end()` on the returned builder to return to this builder. */
  defs(): SvgBuilder {
    return new SvgBuilder(this, "defs");
  }

  radialGradient(id: string, stops: GradientStop[]): this {
    this.elements.push({ type: "radialGradient", id, stops });
    return this;
  }

  /** Close a group or defs builder and return to the parent. */
  end(): SvgBuilder {
    if (!this.parent || !this.parentType) {
      throw new Error("end() called on root SvgBuilder");
    }

    if (this.parentType === "group") {
      this.parent.elements.push({
        type: "group",
        attrs: this.groupAttrs,
        children: this.elements,
      });
    } else {
      this.parent.elements.push({
        type: "defs",
        children: this.elements,
      });
    }

    return this.parent;
  }

  /** Serialize the SVG document to an XML string. */
  toString(): string {
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${this.svgWidth}" height="${this.svgHeight}">`;
    for (const el of this.elements) {
      s += serializeElement(el);
    }
    s += `</svg>`;
    return s;
  }
}
