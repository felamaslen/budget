import React from 'react';
import Media from 'react-media';
import { mediaQueries } from '../../constants';
import ListBodyDesktop from '../ListBodyDesktop';
import ListBodyMobile from '../ListBodyMobile';

export default function ListBody(props) {
    const body = isMobile => {
        if (isMobile) {
            return <ListBodyMobile {...props} />;
        }

        return <ListBodyDesktop {...props} />;
    };

    return <Media query={mediaQueries.mobile}>{body}</Media>;
}

