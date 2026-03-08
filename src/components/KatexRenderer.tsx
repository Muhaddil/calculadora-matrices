import katex from "katex";
import "katex/dist/katex.min.css";

interface Props {
    math: string;
    displayMode?: boolean;
}

const KatexRenderer = ({ math, displayMode = false }: Props) => {
    try {
        const html = katex.renderToString(math, {
            displayMode,
            throwOnError: false,
        });
        return <span dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
        return <span>{math}</span>;
    }
};

export const BlockMath = ({ math }: { math: string }) => {
    return <KatexRenderer math={math} displayMode={true} />;
};

export const InlineMath = ({ math }: { math: string }) => {
    return <KatexRenderer math={math} displayMode={false} />;
};