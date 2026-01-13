"use client";

import React, { useEffect, useRef } from "react";

class Blob {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 100 + 150;
        const colors = [
            "rgba(76, 29, 149, 0.4)",
            "rgba(30, 64, 175, 0.4)",
            "rgba(15, 118, 110, 0.4)",
            "rgba(88, 28, 135, 0.4)",
            "rgba(192, 38, 211, 0.3)",
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -this.radius) this.x = this.width + this.radius;
        if (this.x > this.width + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = this.height + this.radius;
        if (this.y > this.height + this.radius) this.y = -this.radius;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

export function MetamorphicBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const blobs: Blob[] = [];
        const blobCount = 15;

        const init = () => {
            canvas.width = width;
            canvas.height = height;
            for (let i = 0; i < blobCount; i++) {
                blobs.push(new Blob(width, height));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Background fill
            ctx.fillStyle = "#0a0a0a"; // Very dark base
            ctx.fillRect(0, 0, width, height);

            // Draw blobs (the "metamorphosis" logic is handled by CSS blur mostly)
            blobs.forEach((blob) => {
                blob.update();
                blob.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            blobs.length = 0;
            init();
        };

        init();
        animate();

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-black">
            {/* 
        This SVG filter creates the "gooey" / metamorphic effect 
        by boosting alpha contrast and then blurring.
      */}
            <svg className="hidden">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="50" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                            result="goo"
                        />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>

            <canvas
                ref={canvasRef}
                className="w-full h-full opacity-80"
                style={{ filter: "blur(60px)" }} // Simple blur also works well for ambient
            // style={{ filter: "url(#goo)" }} // Using SVG filter for stronger liquid effect if desired, but pure blur is often smoother for background
            />

            {/* Overlay noise/texture for premium feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
        </div>
    );
}
