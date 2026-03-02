import User            from '../models/user.model.js';
import ExcelJS         from 'exceljs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit         from '@pdf-lib/fontkit';
import fs              from 'fs';
import path            from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Helpers ───────────────────────────────────────────────────
const fmt     = (v) => (v != null && v !== '' ? String(v) : '-');
const fmtBool = (v) => (v ? 'Yes' : 'No');
const fmtDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  return isNaN(date.getTime())
    ? '-'
    : date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// hex colour → pdf-lib rgb()
const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

// ── Colour palette ────────────────────────────────────────────
const NAVY    = hex('#1a2a5e');
const GOLD    = hex('#D4880B');
const LIGHT   = hex('#F0F4FA');
const BORDER  = hex('#D0D8E8');
const TXTDARK = hex('#1a1f36');
const TXT2    = hex('#5a6380');
const WHITE   = rgb(1, 1, 1);

// ── Page geometry (A4 in pdf-lib: y=0 at BOTTOM) ─────────────
const PAGE_W   = 595.28;
const PAGE_H   = 841.89;
// Letterhead header ends ~100pt from top  → y = PAGE_H - 100
// Letterhead footer starts ~95pt from bottom → y = 95
const TOP_Y    = PAGE_H - 108;   // where content starts (below letterhead header)
const BOT_Y    = 98;              // where content ends   (above letterhead footer)
const ML       = 38;              // margin left
const MR       = 38;              // margin right
const TW       = PAGE_W - ML - MR; // table width ≈ 519
const ROW_H    = 18;

// ── Column definitions ────────────────────────────────────────
const RAW_COLS = [
  { label: 'No.',       w: 26  },
  { label: 'Reg. No.',  w: 82  },
  { label: 'Full Name', w: 100 },
  { label: 'Email',     w: 128 },
  { label: 'Phone',     w: 72  },
  { label: 'Exam Date', w: 58  },
  { label: 'Approved',  w: 47  },
  { label: 'Attempted', w: 47  },
];
const totalRaw = RAW_COLS.reduce((s, c) => s + c.w, 0);
const COLS     = RAW_COLS.map(c => ({ label: c.label, w: Math.round(c.w * TW / totalRaw) }));

// Rows that fit per page
const ROWS_FIRST = Math.floor((TOP_Y - 58 - BOT_Y) / ROW_H) - 1;
const ROWS_REST  = Math.floor((TOP_Y - 18 - BOT_Y) / ROW_H) - 1;


// ────────────────────────────────────────────────────────────────
// drawPage — renders one page of user data onto a pdf-lib PDFPage
// ────────────────────────────────────────────────────────────────
function drawPage(page, usersSlice, pageNum, totalPages, totalUsers, isFirst, fonts) {
  const { bold, regular } = fonts;
  let y = TOP_Y;

  if (isFirst) {
    // ── Report title ─────────────────────────────────────────
    page.drawText('Student Details Report', {
      x: ML, y: y, size: 13, font: bold, color: NAVY,
    });
    y -= 15;

    const now = new Date().toLocaleString('en-IN');
    page.drawText(`Generated: ${now}   \u2022   Total Students: ${totalUsers}`, {
      x: ML, y: y, size: 8, font: regular, color: TXT2,
    });
    y -= 8;

    // Gold divider line
    page.drawLine({ start: { x: ML, y }, end: { x: PAGE_W - MR, y }, thickness: 1.5, color: GOLD });
    y -= 14;
  } else {
    page.drawText('Student Details Report (continued)', {
      x: ML, y: y - 4, size: 8, font: regular, color: TXT2,
    });
    y -= 16;
  }

  // ── Column header row ──────────────────────────────────────
  page.drawRectangle({ x: ML, y: y - ROW_H, width: TW, height: ROW_H, color: NAVY });

  let xi = ML;
  for (const col of COLS) {
    page.drawText(col.label, {
      x: xi + 3, y: y - ROW_H + 5, size: 7.5, font: bold, color: WHITE,
    });
    xi += col.w;
  }
  y -= ROW_H;

  // ── Data rows ──────────────────────────────────────────────
  for (let i = 0; i < usersSlice.length; i++) {
    if (y - ROW_H < BOT_Y) break;

    const u  = usersSlice[i];
    const bg = i % 2 === 0 ? LIGHT : WHITE;

    page.drawRectangle({ x: ML, y: y - ROW_H, width: TW, height: ROW_H, color: bg });

    // bottom border
    page.drawLine({
      start: { x: ML, y: y - ROW_H },
      end:   { x: ML + TW, y: y - ROW_H },
      thickness: 0.3, color: BORDER,
    });

    // cell text
    const vals = [
      fmt(u.sno), fmt(u.reg), fmt(u.name),
      fmt(u.email), fmt(u.phone), fmt(u.examDate),
      fmt(u.approved), fmt(u.attempted),
    ];

    xi = ML;
    for (let ci = 0; ci < COLS.length; ci++) {
      const col      = COLS[ci];
      // ~4.4 pts per char at size 7.5 in Helvetica
      const maxChars = Math.max(3, Math.floor(col.w / 4.4) - 1);
      let   txt      = vals[ci] || '';
      if (txt.length > maxChars) txt = txt.slice(0, maxChars - 1) + '\u2026';

      page.drawText(txt, {
        x: xi + 3, y: y - ROW_H + 5, size: 7.5, font: regular, color: TXTDARK,
      });
      xi += col.w;
    }

    y -= ROW_H;
  }

  // ── Page number ────────────────────────────────────────────
  const pgTxt  = `Page ${pageNum} of ${totalPages}`;
  const pgW    = pgTxt.length * 4; // rough width
  page.drawText(pgTxt, {
    x: (PAGE_W - pgW) / 2, y: 78, size: 7.5, font: regular, color: TXT2,
  });
}


// ────────────────────────────────────────────────────────────────
// @desc   Export all users as Excel (.xlsx)
// @route  GET /api/admin/export/csv
// @access Private/Admin
// ────────────────────────────────────────────────────────────────
export const exportUsersCSV = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    const workbook    = new ExcelJS.Workbook();
    workbook.creator  = 'Nexcore Institute';
    workbook.created  = new Date();
    workbook.modified = new Date();

    const sheet = workbook.addWorksheet('Student Details', {
      pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true },
    });

    // Branding row 1
    sheet.mergeCells('A1:N1');
    const t1      = sheet.getCell('A1');
    t1.value      = 'NEXCORE INSTITUTE OF TECHNOLOGY';
    t1.font       = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF1B3A6B' } };
    t1.alignment  = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 32;

    // Branding row 2
    sheet.mergeCells('A2:N2');
    const t2      = sheet.getCell('A2');
    t2.value      = 'Student Details Report  \u2022  Generated: ' + new Date().toLocaleString('en-IN');
    t2.font       = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF555555' } };
    t2.alignment  = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(2).height = 20;
    sheet.addRow([]); // spacer

    const columns = [
      { header: '#',                key: 'sno',       width: 6  },
      { header: 'Registration No.', key: 'regNo',     width: 20 },
      { header: 'Full Name',        key: 'fullName',  width: 26 },
      { header: 'Email',            key: 'email',     width: 32 },
      { header: 'Phone',            key: 'phone',     width: 16 },
      { header: 'Gender',           key: 'gender',    width: 10 },
      { header: 'Date of Birth',    key: 'dob',       width: 15 },
      { header: 'City',             key: 'city',      width: 16 },
      { header: 'State',            key: 'state',     width: 18 },
      { header: 'Exam Date',        key: 'examDate',  width: 14 },
      { header: 'Email Verified',   key: 'emailVer',  width: 14 },
      { header: 'SMS Verified',     key: 'smsVer',    width: 13 },
      { header: 'Approved',         key: 'approved',  width: 12 },
      { header: 'Exam Attempted',   key: 'attempted', width: 15 },
    ];
    sheet.columns = columns;

    // Header row (row 4)
    const hr    = sheet.getRow(4);
    hr.values   = columns.map(c => c.header);
    hr.height   = 26;
    hr.eachCell(cell => {
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B3A6B' } };
      cell.font      = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border    = {
        top: { style: 'thin', color: { argb: 'FF8EA8C8' } }, bottom: { style: 'thin', color: { argb: 'FF8EA8C8' } },
        left: { style: 'thin', color: { argb: 'FF8EA8C8' } }, right: { style: 'thin', color: { argb: 'FF8EA8C8' } },
      };
    });

    // Data rows
    users.forEach((u, i) => {
      const row = sheet.addRow({
        sno: i + 1, regNo: fmt(u.registrationNumber), fullName: fmt(u.fullName),
        email: fmt(u.email), phone: fmt(u.phone), gender: fmt(u.gender),
        dob: fmtDate(u.dateOfBirth), city: fmt(u.city), state: fmt(u.state),
        examDate: fmt(u.examDate), emailVer: fmtBool(u.isEmailVerified),
        smsVer: fmtBool(u.isSmsVerified), approved: fmtBool(u.isApproved),
        attempted: fmtBool(u.examAttempted),
      });
      const bg = i % 2 === 0 ? 'FFF4F6FA' : 'FFFFFFFF';
      row.height = 20;
      row.eachCell({ includeEmpty: true }, cell => {
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.font      = { name: 'Calibri', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border    = {
          top: { style: 'hair', color: { argb: 'FFD0D8E8' } }, bottom: { style: 'hair', color: { argb: 'FFD0D8E8' } },
          left: { style: 'hair', color: { argb: 'FFD0D8E8' } }, right: { style: 'hair', color: { argb: 'FFD0D8E8' } },
        };
      });
      row.getCell('fullName').alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell('email').alignment    = { vertical: 'middle', horizontal: 'left' };
    });

    sheet.addRow([]);
    const sumRow = sheet.addRow([`Total Students: ${users.length}`]);
    sumRow.getCell(1).font      = { bold: true, size: 11, color: { argb: 'FF1B3A6B' } };
    sumRow.getCell(1).alignment = { horizontal: 'left' };
    sheet.mergeCells(`A${sumRow.number}:D${sumRow.number}`);
    sheet.views = [{ state: 'frozen', ySplit: 4 }];

    const buffer   = await workbook.xlsx.writeBuffer();
    const filename = `nexcore_students_${Date.now()}.xlsx`;
    res.setHeader('Content-Type',        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length',       buffer.length);
    res.setHeader('Content-Encoding',    'identity');
    res.setHeader('Cache-Control',        'no-cache, no-store');
    return res.end(buffer);

  } catch (err) {
    console.error('[exportUsersCSV]', err);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: 'Export failed', error: err.message });
  }
};


// ────────────────────────────────────────────────────────────────
// @desc   Export all users as PDF with Nexcore letterhead
// @route  GET /api/admin/export/pdf
// @access Private/Admin
// ────────────────────────────────────────────────────────────────
export const exportUsersPDF = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    // ── Build payload ─────────────────────────────────────────
    const payload = users.map((u, i) => ({
      sno:      i + 1,
      reg:      fmt(u.registrationNumber),
      name:     fmt(u.fullName),
      email:    fmt(u.email),
      phone:    fmt(u.phone),
      examDate: fmt(u.examDate),
      approved: fmtBool(u.isApproved),
      attempted:fmtBool(u.examAttempted),
    }));

    // ── Load letterhead PDF bytes ─────────────────────────────
    // Place the PDF at:  src/assets/Nexcore_Institute_Letter_Head.pdf
    const lhPath  = path.join(__dirname, '../assets/Nexcore_Institute_Letter_Head.pdf');
    const lhBytes = fs.readFileSync(lhPath);

    // ── Create output PDF ─────────────────────────────────────
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    // Embed standard fonts
    const boldFont    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fonts       = { bold: boldFont, regular: regularFont };

    // ── Split users into per-page chunks ──────────────────────
    const chunks = [];
    let idx = 0, p = 0;
    while (idx < payload.length) {
      const cap = p === 0 ? ROWS_FIRST : ROWS_REST;
      chunks.push(payload.slice(idx, idx + cap));
      idx += cap;
      p++;
    }
    // Edge case: no users → at least 1 page
    if (chunks.length === 0) chunks.push([]);

    const totalPages = chunks.length;

    // ── For each chunk: embed letterhead + draw data ──────────
    for (let i = 0; i < chunks.length; i++) {
      // Load a fresh copy of the letterhead for each page
      const lhDoc      = await PDFDocument.load(lhBytes);
      const [lhPage]   = await pdfDoc.copyPages(lhDoc, [0]);
      pdfDoc.addPage(lhPage);

      const page = pdfDoc.getPage(i);
      drawPage(page, chunks[i], i + 1, totalPages, payload.length, i === 0, fonts);
    }

    // ── Serialise and send ────────────────────────────────────
    const pdfBytes = await pdfDoc.save();
    const buffer   = Buffer.from(pdfBytes);
    const filename = `nexcore_students_${Date.now()}.pdf`;

    res.setHeader('Content-Type',        'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length',       buffer.length);
    res.setHeader('Content-Encoding',    'identity');
    res.setHeader('Cache-Control',        'no-cache, no-store');
    return res.end(buffer);

  } catch (err) {
    console.error('[exportUsersPDF]', err);
    if (!res.headersSent)
      res.status(500).json({ success: false, message: 'PDF export failed', error: err.message });
  }
};