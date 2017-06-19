/**
 * Actions called to manipulate graphs
 */

import buildMessage from '../messageBuilder';
import { AC_GRAPH_SHOWALL_TOGGLED } from '../constants/actions';

export const aShowAllToggled = () => buildMessage(AC_GRAPH_SHOWALL_TOGGLED);

