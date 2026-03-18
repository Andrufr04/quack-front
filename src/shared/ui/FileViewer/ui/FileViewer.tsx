import DocViewer, { DocViewerRenderers } from "@iamjariwala/react-doc-viewer";
import { useContext, useMemo, memo, type CSSProperties, useState } from "react";
import { AppContext } from "../../../../app/providers/AppProvider/model/AppContext";
import styles from './FileViewer.module.css'
import { SVG_A, SVG_PLUS } from "../../icons/icons";

export const FileViewer = memo(({ docs, style }: { docs: { uri: string }[], style?: CSSProperties }) => {
    const { mode } = useContext(AppContext);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);
    const [expanded, setExpanded] = useState(false)

    const config = useMemo(() => ({
        header: {
            disableHeader: true,
            disableFileName: true
        },
        themeMode: (mode === "dark" ? "dark" : "light") as "dark" | "light"
    }), [mode]);

    const mergedStyle = useMemo(() => ({
        ...style
    }), [style]);

    const activeDoc = useMemo(() => [docs[currentDocIndex]], [docs, currentDocIndex]);

    const nextDoc = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentDocIndex < docs.length - 1) setCurrentDocIndex(prev => prev + 1);
        if (currentDocIndex === docs.length - 1) setCurrentDocIndex(0);
    };

    const prevDoc = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentDocIndex > 0) setCurrentDocIndex(prev => prev - 1);
        if (currentDocIndex === 0) setCurrentDocIndex(docs.length - 1);
    };

    return (
        <>
            <div className={styles.viewerContainer} style={mergedStyle}>
                {/* {docs.length > 1 && (
                <div className={styles.customNav}>
                    <button 
                        className={styles.navBtn} 
                        onClick={prevDoc} 
                        disabled={currentDocIndex === 0}
                    >
                        ❮
                    </button>
                    
                    <span className={styles.docCounter}>
                        {currentDocIndex + 1} / {docs.length}
                    </span>

                    <button 
                        className={styles.navBtn} 
                        onClick={nextDoc} 
                        disabled={currentDocIndex === docs.length - 1}
                    >
                        ❯
                    </button>
                </div>
            )} */}
                {docs.length > 1 &&
                    <div className={styles.arrowLeft} onClick={prevDoc} >
                        {SVG_A}
                    </div>
                }
                <div className={styles.viewerWrapper}>
                    <div className={styles.zoomArea} onClick={() => setExpanded(true)}>
                        <DocViewer documents={activeDoc} pluginRenderers={DocViewerRenderers} config={config} />
                    </div>
                </div>
                {docs.length > 1 &&
                    <div className={styles.arrowRight} onClick={nextDoc} >
                        {SVG_A}
                    </div>
                }
            </div >
            <>
                {expanded && (
                    <div className={styles.overlay} onClick={() => setExpanded(false)}>
                        <div className={styles.fullViewer} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.iconModal} onClick={() => setExpanded(false)}>{SVG_PLUS}</div>
                            {docs.length > 1 &&
                                <div className={styles.arrowLeft} onClick={prevDoc} >
                                    {SVG_A}
                                </div>
                            }
                            <div className={styles.fullViewerWrapper}>
                                <DocViewer documents={activeDoc} pluginRenderers={DocViewerRenderers} config={config} />
                            </div>
                            {docs.length > 1 &&
                                <div className={styles.arrowRight} onClick={nextDoc} >
                                    {SVG_A}
                                </div>
                            }
                        </div>
                    </div>
                )}
            </>
        </>
    );
});