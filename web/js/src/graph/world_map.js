/**
 * Graph with world map, highlighting countries
 */

import $ from "../../lib/jquery.min";

// coefficients for finding score colours
const c0 = 238 / 255;

const mr = (Math.pow(Math.E, -Math.pow(0.49, 2) / 0.2) - c0) / 0.01;
const mg = (Math.pow(Math.E, -Math.pow(0.01, 2) / 0.1) - c0) / 0.01;
const mb = (0.5 * Math.pow(Math.E, -Math.pow(0.01, 2)) - c0) / 0.01;

const cr = x => x < 0.01 ? mr * x + c0 : (x < 0.5 ? Math.pow(Math.E, -Math.pow(x - 0.5, 2) / 0.2) : 1);
const cg = x => x < 0.01 ? mb * x + c0 : Math.pow(Math.E, -Math.pow(x, 2) / 0.1);
const cb = x => x < 0.01 ? mg * x + c0 : 0.5 * Math.pow(Math.E, -Math.pow(x - 0.1, 2));

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
        const color = this.getColor(item[1]);
        $(this.regionElems[this.regions[item[0]]]).css("fill", color);
      }
    });
  }
  getColor(weight) {
    return "rgb(" + [
      Math.round(255 * cr(weight), 1),
      Math.round(255 * cg(weight), 1),
      Math.round(255 * cb(weight), 1)
    ].join(", ") + ")";
  }
}
