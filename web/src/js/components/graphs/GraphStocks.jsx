/*
 * Graph general cash flow (balance over time)
 */

import { List as list } from 'immutable';
import PropTypes from 'prop-types';
import { LineGraph } from './LineGraph';
import { rgba } from '../../misc/color';
import {
  COLOR_PROFIT, COLOR_LOSS, COLOR_DARK, FONT_AXIS_LABEL
} from '../../misc/config';

export class GraphStocks extends LineGraph {
  update() {
    if (this.props.data.size < 2) {
      return;
    }
    this.processData();
    this.draw();
  }
  processData() {
    const dataY = this.props.data.map(item => item.last());
    const dataX = this.props.data.map(item => item.first());

    let minY = dataY.min();
    let maxY = dataY.max();
    if (maxY - minY === 0) {
      maxY += 0.01;
      minY -= 0.01;
    }
    const minX = dataX.min();
    const maxX = dataX.max();

    this.setRange([minX, maxX, minY, maxY]);
  }
  drawAxes() {
    // draw axes
    this.ctx.font = FONT_AXIS_LABEL;
    this.ctx.fillStyle = rgba(COLOR_DARK);
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'bottom';

    // draw time (X axis) ticks
    const y0 = this.pixY(this.minY);
    const tickAngle = -Math.PI / 6;
    const timeTicks = this.getTimeScale(0);
    timeTicks.forEach(tick => {
      if (tick.text) {
        this.ctx.save();
        this.ctx.translate(tick.pix, y0);
        this.ctx.rotate(tickAngle);
        this.ctx.fillText(tick.text, 0, 0);
        this.ctx.restore();
      }
    });
  }
  draw() {
    if (!this.supported) {
      return;
    }

    // clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawAxes();

    this.ctx.lineWidth = 1.5;
    this.drawLine(this.props.data, value => value < 0 ? rgba(COLOR_LOSS) : rgba(COLOR_PROFIT));
  }
}

GraphStocks.propTypes = {
  data: PropTypes.instanceOf(list)
};

