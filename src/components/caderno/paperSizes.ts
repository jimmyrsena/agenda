// Real paper sizes in cm and their pixel equivalents at 96 DPI (1cm ≈ 37.795px)
export const CM_TO_PX = 37.795;

export interface PaperSize {
  id: string;
  label: string;
  widthCm: number;
  heightCm: number;
}

export const PAPER_SIZES: PaperSize[] = [
  { id: 'a4', label: 'A4 (21 × 29,7 cm)', widthCm: 21, heightCm: 29.7 },
  { id: 'letter', label: 'Carta (21,6 × 27,9 cm)', widthCm: 21.6, heightCm: 27.9 },
  { id: 'legal', label: 'Ofício (21,6 × 35,6 cm)', widthCm: 21.6, heightCm: 35.6 },
  { id: 'a5', label: 'A5 (14,8 × 21 cm)', widthCm: 14.8, heightCm: 21 },
  { id: 'a3', label: 'A3 (29,7 × 42 cm)', widthCm: 29.7, heightCm: 42 },
  { id: 'b5', label: 'B5 (17,6 × 25 cm)', widthCm: 17.6, heightCm: 25 },
];

export function getPaperSize(id: string): PaperSize {
  return PAPER_SIZES.find(p => p.id === id) || PAPER_SIZES[0];
}

export function getPaperDimensions(paperId: string, orientation: 'portrait' | 'landscape') {
  const paper = getPaperSize(paperId);
  const wCm = orientation === 'landscape' ? paper.heightCm : paper.widthCm;
  const hCm = orientation === 'landscape' ? paper.widthCm : paper.heightCm;
  return {
    widthCm: wCm,
    heightCm: hCm,
    widthPx: Math.round(wCm * CM_TO_PX),
    heightPx: Math.round(hCm * CM_TO_PX),
  };
}
