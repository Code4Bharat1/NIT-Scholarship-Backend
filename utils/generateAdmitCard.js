// ================================================================
//  utils/generateAdmitCard.js
//  Clean modern admit card on Nexcore letterhead
//  npm install pdf-lib @pdf-lib/fontkit
// ================================================================

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── hex to pdf-lib rgb ────────────────────────────────────────
const hex = (h) => {
  const n = parseInt(h.replace('#',''), 16);
  return rgb(((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255);
};

const NAVY    = hex('#1a2a5e');
const GOLD    = hex('#D4880B');
const LIGHT   = hex('#F0F4FA');
const BORDER  = hex('#D0D8E8');
const TEXT    = hex('#1a1f36');
const TEXT2   = hex('#5a6380');
const WHITE   = rgb(1,1,1);
const GREEN   = hex('#11998e');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const ML     = 40;
const MR     = 40;
const TW     = PAGE_W - ML - MR;

const fmt = (v) => (v != null && v !== '' ? String(v) : '-');
const trunc = (str, max) => {
  const s = fmt(str);
  return s.length > max ? s.slice(0, max - 3) + '...' : s;
};

export async function generateAdmitCard(user) {
  // ── Load letterhead ──────────────────────────────────────────
  const lhPath  = path.join(__dirname, '../assets/Nexcore_Institute_Letter_Head.pdf');
  const lhBytes = fs.readFileSync(lhPath);

  const pdfDoc  = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const lhDoc    = await PDFDocument.load(lhBytes);
  const [lhPage] = await pdfDoc.copyPages(lhDoc, [0]);
  pdfDoc.addPage(lhPage);

  const page = pdfDoc.getPage(0);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = PAGE_H - 115; // start below letterhead

  // ══════════════════════════════════════════════════════════════
  //  TITLE BANNER
  // ══════════════════════════════════════════════════════════════
  const BANNER_H = 36;
  page.drawRectangle({ x: ML, y: y - BANNER_H, width: TW, height: BANNER_H, color: NAVY });

  const title  = 'SCHOLARSHIP EXAMINATION - ADMIT CARD';
  const titleW = bold.widthOfTextAtSize(title, 11.5);
  page.drawText(title, {
    x: ML + (TW - titleW) / 2,
    y: y - BANNER_H + 12,
    size: 11.5, font: bold, color: WHITE,
  });
  y -= BANNER_H;

  // Gold divider
  page.drawLine({ start: { x: ML, y }, end: { x: ML + TW, y }, thickness: 2.5, color: GOLD });
  y -= 20;

  // ══════════════════════════════════════════════════════════════
  //  MAIN CARD BODY
  // ══════════════════════════════════════════════════════════════
  const CARD_H = 200;

  // Card background
  page.drawRectangle({ x: ML, y: y - CARD_H, width: TW, height: CARD_H, color: WHITE });
  page.drawRectangle({ x: ML, y: y - CARD_H, width: TW, height: CARD_H, borderColor: BORDER, borderWidth: 1, color: undefined });

  // Left colored strip
  page.drawRectangle({ x: ML, y: y - CARD_H, width: 6, height: CARD_H, color: NAVY });

  const CX = ML + 18; // content x

  // ── Photo box (right) ─────────────────────────────────────────
  const PW = 90, PH = 110;
  const PX = ML + TW - PW - 16;
  const PY = y - CARD_H + (CARD_H - PH) / 2;

  page.drawRectangle({ x: PX, y: PY, width: PW, height: PH, color: LIGHT, borderColor: BORDER, borderWidth: 1 });

  console.log('[AdmitCard] photo present:', !!user.photo, '| preview:', user.photo ? user.photo.substring(0, 60) : 'NULL');

  if (user.photo) {
    try {
      let b64, isJpeg;

      if (user.photo.includes('base64,')) {
        isJpeg = user.photo.includes('image/jpeg') || user.photo.includes('image/jpg');
        b64    = user.photo.split('base64,')[1];
      } else {
        // raw base64 string with no data URI prefix — assume JPEG
        isJpeg = true;
        b64    = user.photo;
      }

      const imgBuf = Buffer.from(b64, 'base64');

      let embImg;
      try {
        embImg = isJpeg ? await pdfDoc.embedJpg(imgBuf) : await pdfDoc.embedPng(imgBuf);
      } catch {
        // fallback: try the other format
        embImg = isJpeg ? await pdfDoc.embedPng(imgBuf) : await pdfDoc.embedJpg(imgBuf);
      }

      const { width: iw, height: ih } = embImg;
      const scale = Math.min((PW - 6) / iw, (PH - 6) / ih);
      page.drawImage(embImg, {
        x: PX + (PW - iw * scale) / 2,
        y: PY + (PH - ih * scale) / 2,
        width: iw * scale, height: ih * scale,
      });
      console.log('[AdmitCard] Photo embedded OK');
    } catch (err) {
      console.error('[AdmitCard] Photo embed failed:', err.message);
    }
  } else {
    console.warn('[AdmitCard] No photo on user object — check .select("+photo") in your query');
  }

  // Photo label
  const plabel  = 'Candidate Photo';
  const plabelW = reg.widthOfTextAtSize(plabel, 7);
  page.drawText(plabel, { x: PX + (PW - plabelW) / 2, y: PY - 12, size: 7, font: reg, color: TEXT2 });

  // ── Registration Number (prominent) ──────────────────────────
  page.drawText('REGISTRATION NUMBER', { x: CX, y: y - 18, size: 7.5, font: bold, color: TEXT2 });
  const regNo  = fmt(user.registrationNumber);
  page.drawText(regNo, { x: CX, y: y - 38, size: 20, font: bold, color: NAVY });
  const regNoW = bold.widthOfTextAtSize(regNo, 20);
  page.drawLine({ start: { x: CX, y: y - 41 }, end: { x: CX + regNoW, y: y - 41 }, thickness: 1.5, color: GOLD });

  // ── Field rows ────────────────────────────────────────────────
  const FIELD_GAP = 32;
  const COL2_X    = CX + 200;

  const leftFields = [
    ['FULL NAME',  trunc(user.fullName, 30)],
    ['EMAIL',      trunc(user.email,    34)],
    ['PHONE',      trunc(user.phone,    20)],
  ];
  const rightFields = [
    ['STATE',      trunc(user.state,    20)],
    ['CITY',       trunc(user.city,     20)],
    ['SUB-CITY',   trunc(user.subCity,  20)],
  ];

  let fy = y - 60;
  leftFields.forEach(([label, value]) => {
    page.drawText(label, { x: CX, y: fy, size: 7, font: bold, color: TEXT2 });
    page.drawText(value, { x: CX, y: fy - 14, size: 9.5, font: reg, color: TEXT });
    fy -= FIELD_GAP;
  });

  let fy2 = y - 60;
  rightFields.forEach(([label, value]) => {
    page.drawText(label, { x: COL2_X, y: fy2, size: 7, font: bold, color: TEXT2 });
    page.drawText(value, { x: COL2_X, y: fy2 - 14, size: 9.5, font: reg, color: TEXT });
    fy2 -= FIELD_GAP;
  });

  // Institution row (full width, bottom of card)
  page.drawText('INSTITUTION', { x: CX, y: y - CARD_H + 30, size: 7, font: bold, color: TEXT2 });
  page.drawText(trunc(user.institution, 55), { x: CX + 82, y: y - CARD_H + 30, size: 9.5, font: reg, color: TEXT });

  y -= CARD_H + 18;

  // ══════════════════════════════════════════════════════════════
  //  STATUS BADGE — "Pending Admin Approval"
  // ══════════════════════════════════════════════════════════════
  // const BADGE_H = 32;
  // page.drawRectangle({ x: ML, y: y - BADGE_H, width: TW, height: BADGE_H, color: hex('#fff8e7'), borderColor: GOLD, borderWidth: 0.8 });

  // // const statusText = 'Status: Pending Admin Approval - You will receive login credentials via email once approved.';
  // // page.drawText(statusText, { x: ML + 14, y: y - BADGE_H + 11, size: 8, font: reg, color: hex('#7a4a00') });

  // y -= BADGE_H + 14;

  // ══════════════════════════════════════════════════════════════
  //  EXAM INFO TABLE
  // ══════════════════════════════════════════════════════════════
  const examFields = [
    ['Exam Name',    'NIT Scholarship Examination'],
    ['Total Marks',  '120 (1 mark per question)'],
    ['Duration',     '1 Hours'],
    ['Mode',         'Online (Computer Based Test)'],
  ];

  const TABLE_ROW_H = 22;
  const TABLE_H     = examFields.length * TABLE_ROW_H + 10;
  const COL1_W      = 130;

  // Table header
  page.drawRectangle({ x: ML, y: y - 24, width: TW, height: 24, color: NAVY });
  page.drawText('EXAMINATION DETAILS', { x: ML + 14, y: y - 16, size: 9, font: bold, color: WHITE });
  y -= 24;

  // Table rows
  examFields.forEach(([label, value], i) => {
    const rowY = y - TABLE_ROW_H * (i + 1);
    const bg   = i % 2 === 0 ? LIGHT : WHITE;
    page.drawRectangle({ x: ML, y: rowY, width: TW, height: TABLE_ROW_H, color: bg, borderColor: BORDER, borderWidth: 0.5 });
    // col divider
    page.drawLine({ start: { x: ML + COL1_W, y: rowY }, end: { x: ML + COL1_W, y: rowY + TABLE_ROW_H }, thickness: 0.5, color: BORDER });
    page.drawText(label, { x: ML + 10, y: rowY + 7, size: 8, font: bold, color: TEXT2 });
    page.drawText(value, { x: ML + COL1_W + 10, y: rowY + 7, size: 8.5, font: reg, color: TEXT });
  });

  y -= TABLE_H + 14;

  // ══════════════════════════════════════════════════════════════
  //  IMPORTANT NOTES
  // ══════════════════════════════════════════════════════════════
  const notes = [
    '* Keep this admit card safe for future reference.',
    '* Login credentials will be emailed after admin approval.',
    '* For queries, contact: director@nexcoreinstitute.org  |  +91 9892398976',
  ];
  const NOTE_H = notes.length * 14 + 20;

  page.drawRectangle({ x: ML, y: y - NOTE_H, width: TW, height: NOTE_H, color: hex('#f0faf8'), borderColor: GREEN, borderWidth: 0.8 });
  page.drawText('Important Notes', { x: ML + 12, y: y - 14, size: 8.5, font: bold, color: GREEN });
  notes.forEach((note, i) => {
    page.drawText(note, { x: ML + 12, y: y - 28 - i * 14, size: 7.5, font: reg, color: TEXT });
  });

  y -= NOTE_H + 12;

  // ══════════════════════════════════════════════════════════════
  //  FOOTER — Generated date + signature line
  // ══════════════════════════════════════════════════════════════
  const now     = new Date();
  const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dateStr = `Generated: ${String(now.getDate()).padStart(2,'0')} ${months[now.getMonth()]} ${now.getFullYear()}  ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  page.drawLine({ start: { x: ML, y: y - 2 }, end: { x: ML + TW, y: y - 2 }, thickness: 0.5, color: BORDER });

  const dateW = reg.widthOfTextAtSize(dateStr, 7.5);
  page.drawText(dateStr, { x: ML, y: y - 14, size: 7.5, font: reg, color: TEXT2 });

  const sigText = 'Authorised Signatory, Nexcore Institute of Technology';
  const sigW    = reg.widthOfTextAtSize(sigText, 7.5);
  page.drawText(sigText, { x: ML + TW - sigW, y: y - 14, size: 7.5, font: reg, color: TEXT2 });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}