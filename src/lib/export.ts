import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// PDF Export
export function exportTableToPDF(
    title: string,
    columns: string[],
    rows: (string | number)[][],
    filename: string
) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(29, 29, 31);
    doc.text(title, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(134, 134, 139);
    doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, 30);
    doc.text("SPMS — Student Project Management System", 14, 36);

    // Table
    autoTable(doc, {
        startY: 44,
        head: [columns],
        body: rows,
        styles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: [230, 230, 230],
            lineWidth: 0.5,
        },
        headStyles: {
            fillColor: [0, 113, 227],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 10,
        },
        alternateRowStyles: {
            fillColor: [249, 249, 249],
        },
        margin: { top: 44 },
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    doc.save(`${filename}.pdf`);
}

// Excel Export
export function exportToExcel(
    sheets: { name: string; columns: string[]; rows: (string | number | null)[][] }[],
    filename: string
) {
    const wb = XLSX.utils.book_new();

    for (const sheet of sheets) {
        const data = [sheet.columns, ...sheet.rows];
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Auto-fit column widths
        const colWidths = sheet.columns.map((col, i) => {
            const maxLen = Math.max(
                col.length,
                ...sheet.rows.map(row => String(row[i] ?? "").length)
            );
            return { wch: Math.min(maxLen + 4, 40) };
        });
        ws["!cols"] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    }

    XLSX.writeFile(wb, `${filename}.xlsx`);
}
