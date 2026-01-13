"use client";

import React, { useState, useEffect, useCallback } from "react";
import Papa from "papaparse";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

export interface FirmData {
    rank: string;
    name: string;
    country: string;
    sales: number;
    profit: number;
    asset: number;
    market_value: number;
    year: number;
    id: string;
}

interface DataManagerProps {
    onDataLoaded: (data: FirmData[]) => void;
}

export function DataManager({ onDataLoaded }: DataManagerProps) {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const parseCSV = useCallback((fileContent: string) => {
        Papa.parse(fileContent, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            transformHeader: (header: string) => header.trim().toLowerCase(),
            complete: (results: any) => {
                const validData: FirmData[] = results.data.filter((row: any) => {
                    return row.name && row.year && !isNaN(parseFloat(row.sales));
                }) as FirmData[];

                if (validData.length === 0) {
                    setStatus("error");
                    setErrorMessage("No valid data found in export_dataset.csv");
                    return;
                }

                setStatus("success");
                onDataLoaded(validData);
            },
            error: (error: Error) => {
                setStatus("error");
                setErrorMessage(error.message);
            }
        });
    }, [onDataLoaded]);

    useEffect(() => {
        const fetchDefault = async () => {
            try {
                const response = await fetch("/export_dataset.csv");
                if (!response.ok) throw new Error("export_dataset.csv not found in public folder");
                const text = await response.text();
                parseCSV(text);
            } catch (err: any) {
                console.error("Failed to load dataset:", err);
                setStatus("error");
                setErrorMessage(err.message || "Failed to load default dataset");
            }
        };
        fetchDefault();
    }, [parseCSV]);


    return (
        <GlassCard className="p-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Database Status</h2>

            {status === "loading" && (
                <div className="flex items-center gap-2 text-purple-300">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Initializing...</span>
                </div>
            )}

            {status === "success" && (
                <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connected</span>
                </div>
            )}

            {status === "error" && (
                <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Error</span>
                </div>
            )}
        </GlassCard>
    );
}
