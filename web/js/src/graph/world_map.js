/**
 * Graph with world map, highlighting countries
 */

import $ from "../../lib/jquery.min";

// coefficients for finding score colours
const Cr = 2;
const Cg = -30;
const Cb = -30;
const c0 = 238;
const colorScore = (x, C) => c0 * (Math.pow(Math.E, C) - Math.pow(Math.E, C * x)) / (Math.pow(Math.E, C) - 1);

export class WorldMap {
  constructor() {
    this.$elem = $("<div></div>").addClass("graph-container").addClass("graph-world-map");
    this.mapLoaded = false;
    this.regionElems = [];
    this.regions = [];
    this.queue = [];
    this.loadMap();
  }
  loadMap() {
    $.get("/world_map.min.svg", svgDoc => {
      const svgRoot = document.importNode(svgDoc.documentElement, true);
      this.$elem.append(svgRoot);

      try {
        this.regionElems = this.$elem.children("svg").children(".world").children();
        this.regions = Array.from(this.regionElems).map(item => item.classList[0].toString());

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
      const regionIndex = this.regions.findIndex(region => region === item[0]);
      if (regionIndex !== -1) {
        const color = this.getColor(item[1]);
        $(this.regionElems[regionIndex]).css("fill", color);
      }
    });
  }
  getColor(weight) {
    return "rgb(" + [
      Math.round(colorScore(weight, Cr), 1),
      Math.round(colorScore(weight, Cg), 1),
      Math.round(colorScore(weight, Cb), 1)
    ].join(", ") + ")";
  }
}
