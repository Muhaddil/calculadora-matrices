import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
    math: string;
    displayMode?: boolean;
}

export const BlockMath = ({ math }: { math: string }) => {
    try {
        const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
        });
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
        return <span>{math}</span>;
    }
};

export const InlineMath = ({ math }: { math: string }) => {
    try {
        const html = katex.renderToString(math, {
            displayMode: false,
            throwOnError: false,
        });
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
        return <span>{math}</span>;
    }
};