/**
 * Analysis of spending page
 */

import $ from "../../lib/jquery.min";

import { ANALYSIS_VIEW_WIDTH, ANALYSIS_VIEW_HEIGHT } from "const";
import { formatCurrency } from "misc/format";
import { arraySum, arraySum1, percent, capitalise } from "misc/misc";

import Page from "page/page";

// class to pack rectangles into a root node
class BlockPacker {
  constructor(data, width, height) {
    this.data   = data;

    this.width = width;
    this.height = height;

    this.numBlockColors = 16;

    this.colorOffset = this.data.reduce((a, b) => {
      return a + (b[1] & 1);
    }, 0);

    this.total  = arraySum1(data);

    const totalArea = width * height;

    this.tree = this.data.map(item => item[1] * totalArea / this.total);

    this.blocks = [];

    this.root = { x: 0, y: 0, w: width, h: height };

    const row = [];

    this.rowCount = 0;

    this.squarify(this.tree, row, this.root);
  }

  squarify(children, row, node) {
    if (!children.length) {
      return;
    }

    const next = children[0];

    const row2 = [];
    row.forEach(item => row2.push(item));
    row2.push(next);

    if (children.length === 1 && row.length === 0) {
      // use all the remaining space for the last child
      this.addRow(children, node);
    }
    else if (this.worst(row, node) >= this.worst(row2, node)) {
      children.shift();

      this.squarify(children, row2, node);
    }
    else {
      const newNode = this.addRow(row, node);

      this.squarify(children, [], newNode);
    }
  }

  addRow(row, node) {
    // returns a new node (the rest of the available space)
    const wide = node.w > node.h;

    let freeX = node.x;
    let freeY = node.y; // measured from bottom

    let freeWidth = node.w;
    let freeHeight = node.h;

    let blockWidth = node.w;
    let blockHeight = node.h;

    const sum = arraySum(row);

    if (wide) {
      blockWidth = sum / node.h;
      freeWidth -= blockWidth;
      freeX += blockWidth;
    }
    else {
      blockHeight = sum / node.w;
      freeHeight -= blockHeight;
      freeY += blockHeight;
    }

    // add row's blocks
    const newBlock = {
      w: percent(blockWidth / this.width),
      h: percent(blockHeight / this.height),
      bits: []
    };

    const newNode = {
      x: freeX,
      y: freeY,
      w: freeWidth,
      h: freeHeight
    };

    row.forEach(item => {
      const thisBlockWidth = wide ? 1 : (item / sum);

      const thisBlockHeight = wide ? (item / sum) : 1;

      const newBlockBit = {
        w: percent(thisBlockWidth),
        h: percent(thisBlockHeight)
      };

      const j = this.rowCount++;

      newBlockBit.name  = this.data[j][0];
      newBlockBit.color = (j + this.colorOffset) % this.numBlockColors;
      newBlockBit.value = this.data[j][1];

      if (this.data[j][2]) {
        const thisBlocks = new BlockPacker(
          this.data[j][2],
          thisBlockWidth * blockWidth,
          thisBlockHeight * blockHeight
        );

        newBlockBit.blocks = thisBlocks.blocks;
      }

      newBlock.bits.push(newBlockBit);
    });

    this.blocks.push(newBlock);

    return newNode;
  }

  worst(row, node) {
    // row is a list of areas
    if (row.length === 0) {
      return Infinity;
    }

    const aspect = node.w / node.h;

    let worst;

    const sum = arraySum(row);

    if (aspect > 1) {
      // wide, so fill the node from the left
      const rowWidth = sum / node.h;

      worst = row.reduce((a, b) => {
        const thisAspect = rowWidth * rowWidth / b;

        const worstAspect = Math.max(thisAspect, 1 / thisAspect);

        return worstAspect > a ? worstAspect : a;
      }, 0);
    }
    else {
      // tall, so fill the node from the bottom
      const rowHeight = sum / node.w;

      worst = row.reduce((a, b) => {
        const thisAspect = b / (rowHeight * rowHeight);

        const worstAspect = Math.max(thisAspect, 1 / thisAspect);

        return worstAspect > a ? worstAspect : a;
      }, 0);
    }

    return worst;
  }
}

export class PageAnalysis extends Page {
  constructor(api, state) {
    super({ page: "analysis" }, api, state);

    this.period   = "year";
    this.grouping = "category";

    this.pageIndex = 0;

    this.cost = [];
    this.items = [];

    this.$blocks = [];
    this.$subBlocks = {};

    this.$deepBlock = null;
    this.$deepBlockTree = null;

    this.deepBlockTime = 250;
    this.blockAppearTime = 100;

    // stores whether tree items are expanded or not
    this.treeStatus = {};

    this.treeWidth  = ANALYSIS_VIEW_WIDTH;
    this.treeHeight = ANALYSIS_VIEW_HEIGHT;
  }

  hookDataAddArgs(args) {
    args.push(this.period);
    args.push(this.grouping);

    args.push(this.pageIndex);

    return args;
  }

  render() {
    this.$upper = $("<div></div>").addClass("upper");

    this.$inputPeriodOuter = $("<span></span>").addClass("input-period");

    this.$inputPeriod = {
      year:   $("<input type=\"radio\" name=\"period\"></input>"),
      month:  $("<input type=\"radio\" name=\"period\"></input>"),
      week:   $("<input type=\"radio\" name=\"period\"></input>")
    };

    this.$inputPeriod[this.period].attr("checked", true);

    this.$inputPeriodOuter
    .append($("<span></span>").text("Period: "))
    .append(this.$inputPeriod.year)
    .append($("<span></span>").text("Year"))
    .append(this.$inputPeriod.month)
    .append($("<span></span>").text("Month"))
    .append(this.$inputPeriod.week)
    .append($("<span></span>").text("Week"));

    this.$inputGroupingOuter = $("<span></span>").addClass("input-grouping");

    this.$inputGrouping = {
      category: $("<input type=\"radio\" name=\"grouping\"></input>"),
      shop:     $("<input type=\"radio\" name=\"grouping\"></input>")
    };

    this.$inputGrouping[this.grouping].attr("checked", true);

    this.$inputGroupingOuter
    .append($("<span></span>").text("Grouping: "))
    .append(this.$inputGrouping.category)
    .append($("<span></span>").text("Category"))
    .append(this.$inputGrouping.shop)
    .append($("<span></span>").text("Shop"));

    this.$btnPagePrevious = $("<button></button>")
    .addClass("btn-previous")
    .text("Previous");

    this.$btnPagePrevious.on("click", () => this.changePage(1));

    this.$btnPageNext = $("<button></button>")
    .addClass("btn-next")
    .text("Next");

    this.$btnPageNext.on("click", () => this.changePage(-1));

    const $btns = $("<div></div>").addClass("btns");

    $btns.append(this.$btnPagePrevious)
    .append(this.$btnPageNext);

    this.$upper
    .append(this.$inputPeriodOuter)
    .append(this.$inputGroupingOuter)
    .append($btns);

    this.$page.append(this.$upper);

    this.$title = $("<h3></h3>").addClass("period-title");

    this.$page.append(this.$title);

    this.$inputPeriod.year.on("click",  () => this.changePeriod("year"));
    this.$inputPeriod.month.on("click", () => this.changePeriod("month"));
    this.$inputPeriod.week.on("click",  () => this.changePeriod("week"));

    this.$inputGrouping.category.on("click",  () => this.changeGrouping("category"));
    this.$inputGrouping.shop.on("click",  () => this.changeGrouping("shop"));

    this.$flexBox = $("<div></div>").addClass("flexbox");

    this.$treeOuter = $("<div></div>").addClass("tree");

    this.$tree = $("<ul></ul>")
    .addClass("tree-list")
    .addClass("flex");
    this.$treeOuter.append(this.$tree);

    this.$flexBox.append(this.$treeOuter);

    this.$blockView = $("<div></div>").addClass("block-view");

    this.$view = $("<div></div>")
    .addClass("block-tree")
    .addClass("flex");

    this.$blockView.append(this.$view);

    this.$statusBar = $("<div></div>").addClass("status-bar");

    this.$blockView.append(this.$statusBar);

    this.$blockView.on("mouseout", () => {
      this.$statusBar.html("");
    });

    this.$flexBox.append(this.$blockView);

    this.$page.append(this.$flexBox);
  }

  changePeriod(period) {
    this.period = period;
    this.pageIndex = 0;

    this.updateView();
  }

  changeGrouping(grouping) {
    this.grouping = grouping;
    this.pageIndex = 0;

    this.updateView();
  }

  changePage(direction) {
    const pageIndex = Math.max(0, this.pageIndex + direction);

    if (pageIndex !== this.pageIndex) {
      this.pageIndex = pageIndex;

      this.updateView();
    }
  }

  updateView() {
    this.loadData(null, false, true, true);
  }

  sortItems(a, b) {
    if (a[1] > b[1]) {
      return -1;
    }

    return 1;
  }
  sortData(data) {
    return data.map(item => {
      const total = arraySum1(item[1]);

      const subTree = item[1].sort(this.sortItems);

      return [item[0], total, subTree];
    })
    .sort(this.sortItems)
    .filter(
      item => item[1] > 0
    );
  }

  hookDataLoadedAfterRender(callback, res) {
    // sort the data
    this.cost = this.sortData(res.data.cost);

    for (const category in res.data.items) {
      this.items[category] = res.data.items[category].sort(this.sortItems);
    }

    this.drawTree();

    this.drawMainBlocks();

    this.$title.text(res.data.description);
  }

  treeListItem(item, total) {
    const pct = "&nbsp;(" + (100 * item[1] / total).toFixed(1) + "%)";

    const $li = $("<li></li>")
    .addClass("tree-list-item")
    .append($("<div></div>").addClass("main")
      .append($("<span></span>").addClass("title").text(item[0]))
      .append($("<span></span>").addClass("cost").html(formatCurrency(item[1])))
      .append($("<span></span>").addClass("pct").html(pct))
    );

    return $li;
  }
  drawTree() {
    this.$tree.empty();

    const total = arraySum1(this.cost);

    this.cost.forEach((item, key) => {
      const $li = this.treeListItem(item, total);

      $li.on("click", () => {
        this.toggleTreeItem($li, key);
      });

      this.$tree.append($li);

      $li.children(".main").on("mouseover", () => this.hlBlock(key, true))
      .on("mouseout", () => this.hlBlock(key, false));

      this.toggleTreeItem($li, key, !!this.treeStatus[item[0]]);
    });
  }
  toggleTreeItem($li, cKey, status) {
    const category = this.cost[cKey][0];

    const open = typeof status === "undefined"
      ? !this.treeStatus[category] : status;

    const wasOpen = !!this.treeStatus[category];

    $li.toggleClass("open", open);

    if (!open && wasOpen) {
      $li.children(".sub-tree").remove();
    }
    else if (open) {
      const $subTree = $("<ul></ul>").addClass("sub-tree");

      const items = this.cost[cKey][2];

      const total = arraySum1(items);

      items.forEach((item, key) => {
        const $sLi = this.treeListItem(item, total);

        $sLi.on("mouseover", () => this.hlSubBlock(category, key, true))
        .on("mouseout", () => this.hlSubBlock(category, key, false));

        $subTree.append($sLi);
      });

      $li.append($subTree);
    }

    this.treeStatus[category] = open;
  }

  _deactivateBlock($block) {
    $block && $block.removeClass("active");
  }
  _activateBlock($block) {
    $block && $block.addClass("active");
  }
  hlBlock(key, active) {
    if (!active) {
      this._deactivateBlock(this.$blocks[key]);
    }
    else {
      this._activateBlock(this.$blocks[key]);
    }
  }
  hlSubBlock(category, key, active) {
    if (!active) {
      this._deactivateBlock(this.$subBlocks[category][key]);
    }
    else {
      this._activateBlock(this.$subBlocks[category][key]);
    }
  }

  /**
   * draws a block tree, which is a tree data block visualisation
   * with two levels
   * @param {array} data: data to visualise
   * @param {object} $root: DOM element to place
   * @param {function} blockCallback: callback to run on each block
   * @param {boolean} noBlockClass: don't add the block's name to the classes
   * @returns {array} block and sub-block elements
   */
  drawBlockTree(data, $root, blockCallback, noBlockClass) {
    const packer = new BlockPacker(data, this.treeWidth, this.treeHeight);

    const $blocks = [];
    const $subBlocks = {};

    packer.blocks.forEach(group => {
      const $blockGroup = $("<div></div>")
      .addClass("block-group")
      .css({
        width:  group.w,
        height: group.h
      });

      group.bits.forEach(block => {
        const $block = $("<div></div>")
        .addClass("block")
        .addClass("block-" + block.color)
        .css({
          width: block.w,
          height: block.h
        });

        if (!noBlockClass) {
          $block.addClass("block-" + block.name);
        }

        $subBlocks[block.name] = [];

        if (block.blocks) {
          let flashTimes = [];
          let k = 0;

          for (let i = 0; i < block.blocks.length; i++) {
            for (let j = 0; j < block.blocks[i].bits.length; j++) {
              flashTimes.push(++k);
            }
          }

          let i = 0;
          flashTimes = flashTimes.sort(() => {
            return i++ & 2 ? 1 : -1;
          });

          const blockFlashTime = k > 0 ? this.blockAppearTime / k : 0;

          k = 0;

          block.blocks.forEach(subBlockGroup => {
            const $subBlockGroup = $("<div></div>")
            .addClass("block-group")
            .css({
              width:  subBlockGroup.w,
              height: subBlockGroup.h
            });

            subBlockGroup.bits.forEach(subBlock => {
              const title = capitalise(block.name) + ": " + subBlock.name + " (" +
                formatCurrency(subBlock.value, { raw: true }) + ")";

              const $subBlock = $("<div></div>")
              .addClass("sub-block")
              .addClass("hidden")
              .css({
                width:  subBlock.w,
                height: subBlock.h
              });

              $subBlock.on("mouseover", () => {
                this.$statusBar.html(title);
              });

              $subBlocks[block.name].push($subBlock);

              $subBlockGroup.append($subBlock);

              window.setTimeout(() => {
                $subBlock.removeClass("hidden");
              }, flashTimes[k++] * blockFlashTime);
            });

            $block.append($subBlockGroup);
          });
        }

        $blocks.push($block);

        $blockGroup.append($block);

        if (blockCallback) {
          blockCallback($block, block.name);
        }
      });

      $root.append($blockGroup);
    });

    return { $blocks, $subBlocks };
  }

  expandBlock($block, category) {
    if (category !== "bills") {
      $block.on("click", () => {
        const offset = $block.position();

        const width = $block.width();
        const height = $block.height();

        const left = offset.left;
        const top = offset.top;

        const $preview = $("<div></div>")
        .addClass("preview")
        .addClass("block")
        .addClass("block-" + category)
        .css({ width, height, left, top });

        this.$deepBlock = {
          $preview,
          $block,
          width,
          height,
          left,
          top
        };

        $block.addClass("expanded");

        this.$view.append($preview);

        $preview.animate({
          width: this.treeWidth,
          height: this.treeHeight,
          left: 0,
          top: 0
        }, this.deepBlockTime);

        this.deepBlock(category, new Date().getTime());
      });
    }
  }
  drawMainBlocks() {
    this.$view.empty().removeClass("deep");

    const result = this.drawBlockTree(this.cost, this.$view, (a, b) => this.expandBlock(a, b));

    this.$blocks = result.$blocks;
    this.$subBlocks = result.$subBlocks;
  }
  drawDeepBlocks(data, category) {
    if (this.$deepBlockTree) {
      this.$deepBlockTree.remove();
    }

    this.$deepBlockTree = $("<div></div>")
    .addClass("deep-block-tree")
    .addClass("block-tree-" + category);

    this.drawBlockTree(data, this.$deepBlockTree, null, true);

    this.$deepBlockTree.on("click", () => {
      this.$deepBlockTree.remove();

      this.$view.removeClass("deep");

      this.$deepBlock.$preview.show().animate({
        width: this.$deepBlock.width,
        height: this.$deepBlock.height,
        left: this.$deepBlock.left,
        top: this.$deepBlock.top
      }, this.deepBlockTime, () => {
        this.$deepBlock.$preview.remove();

        this.$deepBlock.$block.removeClass("expanded");

        this.$deepBlock = null;
      });
    });

    this.$view.addClass("deep").append(this.$deepBlockTree);
  }

  deepBlock(category, time0) {
    // selects a block to analyse more deeply
    if (this.loading) {
      return;
    }

    this.loading = true;

    const args = [
      "data", "analysis_category", category, this.period, this.grouping, this.pageIndex
    ];

    this.api.request(
      args.join("/"), "GET", null,
      res => this.deepBlockDataLoaded(res.data, category, time0),
      null,
      () => this.deepBlockComplete(),
      false
    );
  }
  deepBlockDataLoaded(data, category, time0) {
    const items = this.sortData(data.items);

    // possibly wait until the expand transition has completed
    const transitionTime = Math.max(0, this.deepBlockTime - (new Date().getTime() - time0));

    window.setTimeout(() => {
      this.drawDeepBlocks(items, category);

      this.$deepBlock.$preview.hide();
    }, transitionTime);
  }
  deepBlockComplete() {
    this.loading = false;
  }
}

