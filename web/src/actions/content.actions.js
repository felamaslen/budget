/**
 * Actions called on content
 */

import * as A from '../constants/actions';

export const aContentRequested = req => ({ type: A.CONTENT_REQUESTED, ...req });
export const aContentLoaded = res => ({ type: A.CONTENT_LOADED, ...res });
export const aContentBlockHovered = req => ({ type: A.CONTENT_BLOCK_HOVERED, ...req });

