import React, {
    useRef,
    useState,
    useCallback,
    useEffect,
} from 'react';
import PropTypes from 'prop-types';

import { blocksShape } from '~client/prop-types/block-packer';
import Blocks from '~client/components/BlockPacker/blocks';

import * as Styled from './styles';

export default function BlockPacker({
    blocks,
    blocksDeep,
    activeMain,
    activeSub,
    onHover,
    onClick,
    status,
}) {
    const onMouseOut = useCallback(() => onHover(null), [onHover]);
    const [preview, setPreview] = useState(null);
    const onClickMain = useCallback((name, nextPreview) => {
        onClick(name);
        setPreview(nextPreview);
    }, [onClick]);

    const [expanded, setExpanded] = useState(false);
    const expandTimer = useRef();
    const havePreview = Boolean(preview);
    useEffect(() => () => clearTimeout(expandTimer.current), []);
    useEffect(() => {
        if (havePreview) {
            setExpanded(true);
            clearTimeout(expandTimer.current);
            expandTimer.current = setTimeout(() => {
                setPreview((last) => ({ ...last, opened: true }));
            }, Styled.fadeTime);
        } else {
            setExpanded(false);
        }
    }, [havePreview]);

    const haveDeep = Boolean(blocksDeep && preview && preview.opened);
    useEffect(() => {
        if (haveDeep) {
            setPreview((last) => ({ ...last, hidden: true }));
            clearTimeout(expandTimer.current);
            expandTimer.current = setTimeout(() => {
                setPreview(null);
            }, Styled.fadeTime);
        }
    }, [haveDeep]);

    return (
        <Styled.BlockView onMouseOut={onMouseOut} onTouchEnd={onMouseOut}>
            <Styled.BlockTreeOuter>
                {blocks && (
                    <Blocks
                        blocks={blocks}
                        activeMain={activeMain}
                        activeSub={activeSub}
                        onHover={onHover}
                        onClick={onClickMain}
                    />
                )}
                {blocksDeep && !(preview && !preview.hidden) && (
                    <Blocks
                        deep
                        blocks={blocksDeep}
                        activeMain={activeMain}
                        activeSub={activeSub}
                        onHover={onHover}
                        onClick={onClick}
                    />
                )}
                {preview && (
                    <Styled.Preview {...preview} expanded={expanded} />
                )}
            </Styled.BlockTreeOuter>
            <Styled.StatusBar>{status}</Styled.StatusBar>
        </Styled.BlockView>
    );
}

BlockPacker.propTypes = {
    blocks: blocksShape,
    blocksDeep: blocksShape,
    activeMain: PropTypes.string,
    activeSub: PropTypes.string,
    onHover: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    status: PropTypes.string.isRequired,
};
