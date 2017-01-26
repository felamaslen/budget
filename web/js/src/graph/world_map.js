/**
 * Graph with world map, highlighting countries
 */

import $ from "../../lib/jquery.min";

// coefficients for finding score colours
const weightColor = (params, x) => {
  return (params[1] + params[0] + 2 * (params[2] - params[3])) * Math.pow(x, 3) +
    (3 * (params[3] - params[2]) - 2 * params[0] - params[1]) * Math.pow(x, 2) +
    params[0] * x +
    params[2];
};

const params = {
  r: [0.21, 0, 0.84, 1],
  g: [0.21, 0.21, 0.85, 0],
  b: [2.67, -1.14, 1, 0]
};

const cr = x => weightColor(params.r, x);
const cg = x => weightColor(params.g, x);
const cb = x => weightColor(params.b, x);

const getColor = score => {
  return "rgb(" + ([cr(score), cg(score), cb(score)]
  .map(x => Math.max(0, Math.min(255, Math.round(255 * x)))).join(", ")) + ")";
};

export class WorldMap {
  constructor() {
    this.$elem = $("<div></div>").addClass("graph-container").addClass("graph-world-map");
    this.mapLoaded = false;
    this.regionElems = [];
    this.regions = {};
    this.queue = [];
    this.loadMap();
  }
  loadMap() {
    $.get("/world_map.min.svg", svgDoc => {
      const svgRoot = document.importNode(svgDoc.documentElement, true);
      this.$elem.append(svgRoot);

      try {
        this.regionElems = this.$elem.children("svg").children(".world").children();
        Array.from(svgRoot.children[0].children).forEach((item, key) => {
          if (item.classList) {
            item.classList.forEach(region => {
              this.regions[region] = key;
            });
          }
        });

        this.mapLoaded = true;
        this.processQueue();
      }
      catch (error) {
        console.warn("Bad world map svg");
      }
    });
  }
  addWeights(weights) {
    if (this.mapLoaded) {
      this.processItem(weights);
    }
    else {
      this.queue.push(weights);
    }
  }
  processQueue() {
    while (this.queue.length > 0) {
      this.processItem(this.queue.pop());
    }
  }
  processItem(weights) {
    // colourise regions based on weights
    weights.forEach(item => {
      if (this.regions[item[0]]) {
        const color = getColor(item[1]);
        $(this.regionElems[this.regions[item[0]]]).css("fill", color);
      }
    });
  }
}
