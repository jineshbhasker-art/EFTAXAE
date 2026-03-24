import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { VATReturn } from '../types';

export const generateVAT201PDF = (ret: VATReturn) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;
  
  // Helper for centered text
  const centerText = (text: string, y: number, fontSize = 10, style = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', style);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, y);
  };

  // --- Header ---
  // Left Logo Placeholder
  doc.setDrawColor(0);
  doc.setLineWidth(0.1);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FEDERAL TAX AUTHORITY', margin + 5, 15);
  
  // Right Logo Placeholder
  doc.text('UNITED ARAB EMIRATES', pageWidth - margin - 50, 15);
  
  // Title
  centerText(`VAT 201 Return - ${ret.id.substring(0, 12).toUpperCase()}`, 30, 12, 'bold');

  // --- Section 1: Taxpayer Information ---
  doc.setFillColor(200, 200, 200);
  doc.rect(margin, 35, pageWidth - (margin * 2), 7, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  centerText('Taxpayer Information', 40);

  const infoY = 50;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Column 1
  doc.text('TRN', margin + 2, infoY);
  doc.setFont('helvetica', 'bold');
  doc.text(ret.formData?.vatRef || '100354945600003', margin + 50, infoY);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Legal Name of Entity (English)', margin + 2, infoY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text('MOHAMMAD SHAFIULALAM VEGETABLES AND FRUITS TRADING L.L.C', margin + 50, infoY + 10);

  doc.setFont('helvetica', 'normal');
  doc.text('Address', margin + 2, infoY + 20);
  doc.setFont('helvetica', 'bold');
  const address = 'SHOP G # 3, ADULLAH AHAMD MOHAMMEDABDUL, RAK AL KHOR, DUBAI, 296466, Dubai, +97143330755';
  const splitAddress = doc.splitTextToSize(address, 60);
  doc.text(splitAddress, margin + 50, infoY + 20);

  // Column 2
  const col2X = 120;
  doc.setFont('helvetica', 'normal');
  doc.text('VAT Return Period', col2X, infoY);
  doc.setFont('helvetica', 'bold');
  doc.text(ret.period, col2X + 40, infoY);

  doc.setFont('helvetica', 'normal');
  doc.text('VAT Stagger', col2X, infoY + 10);
  doc.setFont('helvetica', 'bold');
  doc.text('Stagger 2 - Quarterly (Mar to Feb)', col2X + 40, infoY + 10);

  doc.setFont('helvetica', 'normal');
  doc.text('VAT Return Due Date', col2X, infoY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(ret.dueDate || '30/03/2026', col2X + 40, infoY + 20);

  doc.setFont('helvetica', 'normal');
  doc.text('Tax Year End', col2X, infoY + 30);
  doc.setFont('helvetica', 'bold');
  doc.text(ret.formData?.taxYearEnd || '28/02/2026', col2X + 40, infoY + 30);

  // --- Section 2: VAT on Sales ---
  const salesY = infoY + 45;
  doc.setFillColor(200, 200, 200);
  doc.rect(margin, salesY, pageWidth - (margin * 2), 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('VAT on Sales and All Other outputs', margin + 2, salesY + 5);

  const salesData = [
    ['1a', 'Standard Rated Supplies in Abu Dhabi', (ret.formData?.sales?.standardRated?.abuDhabi?.amount || 0).toFixed(2), (ret.formData?.sales?.standardRated?.abuDhabi?.vat || 0).toFixed(2), '0.00'],
    ['1b', 'Standard Rated Supplies in Dubai', (ret.formData?.sales?.standardRated?.dubai?.amount || 0).toFixed(2), (ret.formData?.sales?.standardRated?.dubai?.vat || 0).toFixed(2), '0.00'],
    ['1c', 'Standard Rated Supplies in Sharjah', (ret.formData?.sales?.standardRated?.sharjah?.amount || 0).toFixed(2), (ret.formData?.sales?.standardRated?.sharjah?.vat || 0).toFixed(2), '0.00'],
    ['1d', 'Standard Rated Supplies in Ajman', (ret.formData?.sales?.standardRated?.ajman?.amount || 0).toFixed(2), (ret.formData?.sales?.standardRated?.ajman?.vat || 0).toFixed(2), '0.00'],
    ['1e', 'Standard Rated Supplies in Umm Al Quwain', (ret.formData?.sales?.standardRated?.ummAlQuwain?.amount || 0).toFixed(2), (ret.formData?.sales?.standardRated?.ummAlQuwain?.vat || 0).toFixed(2), '0.00'],
    ['1f', 'Standard Rated Supplies in Ras Al Khaimah', (ret.formData?.sales?.standardRated?.rasAlKhaimah?.amount || 0).toFixed(2), (ret.formData?.sales?.standardRated?.rasAlKhaimah?.vat || 0).toFixed(2), '0.00'],
    ['1g', 'Standard Rated Supplies in Fujairah', (ret.formData?.sales?.standardRated?.fujairah?.amount || 0).toFixed(2), (ret.formData?.sales?.standardRated?.fujairah?.vat || 0).toFixed(2), '0.00'],
    ['2', 'Tax Refunds provided to Tourists', '0.00', '0.00', '0.00'],
    ['3', 'Supplies subject to reverse charge', (ret.formData?.sales?.reverseCharge?.amount || 0).toFixed(2), (ret.formData?.sales?.reverseCharge?.vat || 0).toFixed(2), ''],
    ['4', 'Zero Rated Supplies', (ret.formData?.sales?.zeroRated?.amount || 0).toFixed(2), '', ''],
    ['5', 'Exempt Supplies', (ret.formData?.sales?.exempt?.amount || 0).toFixed(2), '', ''],
    ['6', 'Goods imported into the UAE', (ret.formData?.sales?.goodsImported?.amount || 0).toFixed(2), (ret.formData?.sales?.goodsImported?.vat || 0).toFixed(2), ''],
    ['7', 'Adjustments to goods imported', (ret.formData?.sales?.adjustmentsImports?.amount || 0).toFixed(2), (ret.formData?.sales?.adjustmentsImports?.vat || 0).toFixed(2), ''],
    ['8', 'Totals', (ret.totalSales || 0).toFixed(2), (ret.totalVAT || 0).toFixed(2), '0.00']
  ];

  autoTable(doc, {
    startY: salesY + 8,
    head: [['Row', 'Description', 'Amount (AED)', 'VAT Amount (AED)', 'Adjustment (AED)']],
    body: salesData,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 6 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.row.index === 13) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 230, 230];
      }
    }
  });

  // --- Section 3: VAT on Expenses ---
  const expensesY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFillColor(200, 200, 200);
  doc.rect(margin, expensesY, pageWidth - (margin * 2), 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('VAT on Expenses and All Other Inputs', margin + 2, expensesY + 5);

  const expensesData = [
    ['9', 'Standard Rated Expenses', (ret.formData?.expenses?.standardRated?.amount || 0).toFixed(2), (ret.formData?.expenses?.standardRated?.vat || 0).toFixed(2), '0.00'],
    ['10', 'Supplies subject to reverse charge', (ret.formData?.expenses?.reverseCharge?.amount || 0).toFixed(2), (ret.formData?.expenses?.reverseCharge?.vat || 0).toFixed(2), ''],
    ['11', 'Totals', (ret.totalExpenses || 0).toFixed(2), (ret.totalRecoverableVAT || 0).toFixed(2), '0.00']
  ];

  autoTable(doc, {
    startY: expensesY + 8,
    head: [['Row', 'Description', 'Amount (AED)', 'VAT Amount (AED)', 'Adjustment (AED)']],
    body: expensesData,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 6 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 70 },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 230, 230];
      }
    }
  });

  // --- Section 4: Net VAT Due ---
  const netY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFillColor(200, 200, 200);
  doc.rect(margin, netY, pageWidth - (margin * 2), 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Net VAT Due', margin + 2, netY + 5);

  const netData = [
    ['12', 'Total Value of due tax for the period', (ret.totalVAT || 0).toFixed(2)],
    ['13', 'Total Value of recoverable tax for the period', (ret.totalRecoverableVAT || 0).toFixed(2)],
    ['14', 'Payable tax for the period', (ret.netVAT || 0).toFixed(2)]
  ];

  autoTable(doc, {
    startY: netY + 8,
    head: [['Row', 'Description', 'Amount (AED)']],
    body: netData,
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 120 },
      2: { halign: 'right' }
    },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [230, 230, 230];
      }
    }
  });

  // Refund Question
  const refundY = (doc as any).lastAutoTable.finalY + 5;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Do you wish to request a refund for the above amount of excess recoverable tax?', margin + 2, refundY);
  doc.setFont('helvetica', 'bold');
  doc.text(ret.formData?.refundRequest || 'No', margin + 2, refundY + 4);

  // Profit Margin Scheme
  const profitY = refundY + 10;
  doc.setFillColor(200, 200, 200);
  doc.rect(margin, profitY, pageWidth - (margin * 2), 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Profit Margin Scheme', margin + 2, profitY + 5);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Did you apply the profit margin scheme in respect of any supplies made during the tax period?', margin + 2, profitY + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(ret.formData?.profitMarginScheme || 'No', margin + 2, profitY + 16);

  // --- Section 5: Authorised Signatory ---
  const signY = profitY + 25;
  doc.setFillColor(200, 200, 200);
  doc.rect(margin, signY, pageWidth - (margin * 2), 7, 'F');
  centerText('Authorised Signatory', signY + 5, 10, 'bold');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const signInfoY = signY + 12;
  doc.text('Name in English', margin + 2, signInfoY);
  doc.setFont('helvetica', 'bold');
  doc.text('MOHAMMAD SHAFIUL ALAM BADSHAH MEAH', margin + 50, signInfoY);

  doc.setFont('helvetica', 'normal');
  doc.text('Mobile Country Code', margin + 2, signInfoY + 8);
  doc.setFont('helvetica', 'bold');
  doc.text('+971', margin + 50, signInfoY + 8);

  doc.setFont('helvetica', 'normal');
  doc.text('Date of Submission', margin + 2, signInfoY + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(ret.filedAt ? new Date(ret.filedAt).toLocaleDateString() : '23/03/2026', margin + 50, signInfoY + 16);

  // Right Signatory Column
  const signCol2X = 120;
  doc.setFont('helvetica', 'normal');
  doc.text('Name in Arabic', signCol2X, signInfoY);
  doc.setFont('helvetica', 'bold');
  doc.text('محمد شفيع علام بادشاه ميه', signCol2X + 40, signInfoY);

  doc.setFont('helvetica', 'normal');
  doc.text('Mobile Number', signCol2X, signInfoY + 8);
  doc.setFont('helvetica', 'bold');
  doc.text('506988625', signCol2X + 40, signInfoY + 8);

  doc.setFont('helvetica', 'normal');
  doc.text('Email Address', signCol2X, signInfoY + 16);
  doc.setFont('helvetica', 'bold');
  doc.text('ALAMVEG966@GMAIL.COM', signCol2X + 40, signInfoY + 16);

  // Footer Generation Info
  const footerY = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Date and time when this document was generated', margin, footerY);
  doc.text(new Date().toLocaleString(), pageWidth - margin - 40, footerY);

  // Footer Disclaimer
  doc.setFontSize(6);
  doc.setTextColor(100);
  const disclaimer = 'This is a system generated document and does not need to be signed. The Taxpayer is solely responsible for the usage of this document. FTA cannot be held liable for any damage caused to the Taxpayer or recipient of this document.';
  const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - (margin * 2));
  doc.text(splitDisclaimer, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

  doc.save(`VAT_Return_${ret.period.replace(/\s+/g, '_')}.pdf`);
};
