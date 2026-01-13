declare module 'dom-to-image-more' {
    export interface Options {
        quality?: number;
        bgcolor?: string;
        width?: number;
        height?: number;
        style?: Record<string, string>;
        filter?: (node: Node) => boolean;
    }

    export interface DomToImage {
        toPng(node: HTMLElement, options?: Options): Promise<string>;
        toJpeg(node: HTMLElement, options?: Options): Promise<string>;
        toSvg(node: HTMLElement, options?: Options): Promise<string>;
        toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
    }

    const domToImage: DomToImage;
    export default domToImage;
}
