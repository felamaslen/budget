import React from 'react';
import Media from 'react-media';
import { mediaQueryMobile } from '~client/constants';
import ListBodyDesktop from '../ListBodyDesktop';
import ListBodyMobile from '../ListBodyMobile';

export default function ListBody(props) {
    const body = isMobile => {
        if (isMobile) {
            return <ListBodyMobile {...props} />;
        }

        return <ListBodyDesktop {...props} />;
    };

    return <Media query={mediaQueryMobile}>{body}</Media>;
}

