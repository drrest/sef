"use client";

import React from "react";
import { FileText } from "lucide-react";

interface ExportButtonsProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    fileName?: string;
}

export function ExportButtons({ targetRef, fileName = "export" }: ExportButtonsProps) {
    const [isExporting, setIsExporting] = React.useState(false);

    const exportToPDF = async () => {
        if (!targetRef.current) return;

        setIsExporting(true);
        try {
            // Dynamic imports to avoid SSR issues
            const domtoimage = (await import('dom-to-image-more')).default;
            const jsPDF = (await import('jspdf')).default;

            // Capture the element with dark background, no extra padding
            const dataUrl = await domtoimage.toPng(targetRef.current, {
                quality: 1,
                bgcolor: '#0a0a0a', // Dark background to match the app
            });

            // Create image to get dimensions
            const img = new Image();
            img.src = dataUrl;
            await new Promise((resolve) => {
                img.onload = resolve;
            });

            // Create PDF with exact dimensions (no white borders)
            const pdf = new jsPDF({
                orientation: img.width > img.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [img.width, img.height],
                compress: true
            });

            // Add image with no margins (fills entire page)
            pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height, undefined, 'FAST');
            pdf.save(`${fileName}.pdf`);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            alert('Export failed. Please check console for details.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={exportToPDF}
                disabled={isExporting}
                className="group relative px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 hover:border-pink-500/60 text-white/80 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <div className="relative flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Export PDF</span>
                </div>
            </button>

            {isExporting && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-white/60">Exporting...</span>
                </div>
            )}
        </div>
    );
}
