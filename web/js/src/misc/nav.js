/**
 * UI navigation functions
 */

import $ from "../../lib/jquery.min";

import { NAV_HANDLE_EVENT, PAGE_DEF } from "const";

import { PageOverview } from "page/overview";
import { PageList } from "page/list";
import { PageAnalysis } from "page/analysis";
import { PageFunds } from "page/funds";

function newPageList(api, state, page) {
  return new PageList(PAGE_DEF[page], api, state);
}
function selectPage(api, state, id, button, callback) {
  if (button.is(".active")) {
    return;
  }

  let pageExists = true;

  if (typeof state.pages[id] === "undefined") {
    pageExists = false;

    switch (id) {
    case "overview":
      state.pages[id] = new PageOverview(api, state);
      break;
    case "analysis":
      state.pages[id] = new PageAnalysis(api, state);
      break;
    case "funds":
      state.pages[id] = new PageFunds(PAGE_DEF.funds, api, state);
      break;
    default:
      state.pages[id] = newPageList(api, state, id);
    }
  }

  Cookies.set("currentPage", id, { expires: 7 });

  state.pages[id].switchTo(pageExists);

  if (state.navActive) {
    state.navActive.removeClass("active");
  }
  else {
    $("#bg").fadeOut();
    $("#nav").removeClass("hide-nav");
  }

  if (state.pageActive) {
    $("#page-" + state.pageActive).hide();
  }

  button.addClass("active");
  state.navActive = button;
  state.pageActive = id;

  $("#page-" + id).show();

  if (typeof callback === "function") {
    callback();
  }
}

export function navHandler(api, state, index, btn) {
  const $btn = $(btn);
  const pageName = $btn.attr("id").substring(9);

  $btn.on(NAV_HANDLE_EVENT, () => {
    selectPage(api, state, pageName, $btn);
  });
}

function tableNavigate(state, wasEditing, evt, x, y, dx, dy, maxX, maxY) {
  if (evt.key === "Tab") {
    if (evt.shiftKey) {
      if (wasEditing) {
        if (x > 0) {
          dx = -1;
          dy = 0;
        }
        else if (y > 0) {
          dx = maxX;
          dy = -1;
        }
      }
      else {
        return false;
        // x = maxX;
        // y = maxY;
      }
    }
    else if (wasEditing) {
      if (x < maxX) {
        dx = 1;
        dy = 0;
      }
      else if (y < maxY) {
        dx = -1 * maxX;
        dy = 1;
      }
    }

    x += dx;
    y += dy;
  }

  if (state.pageActive === "overview") {
    if (dx !== 0) {
      return false;
    }

    if (evt.key === "ArrowUp" && !wasEditing) {
      y = maxY;
    }

    state.pages.overview.$td[y].balance.mousedown();
  }
  else {
    const $span = state.pages[state.pageActive].$lbody
      .children(":eq(" + (y + 1).toString() + ")")
      .children(".editable:eq(" + x.toString() + ")");

    $span.mousedown();
  }

  return true;
}

/**
 * main window keydown handler
 * @param {User} user user object
 * @param {object} state application state
 * @param {event} evt the event object send by the event listener
 * @returns {void} nothing
 */
export function keyDownHandler(user, state, evt) {
  if (user.uid) {
    if (evt.key === "Enter") {
      if (state.editing.finish()) {
        evt.preventDefault();
      }
    }
    else if (evt.key === "Escape") {
      if (state.editing.cancel()) {
        evt.preventDefault();
      }
    }
    else if (state.pageActive && (
      (evt.ctrlKey && (evt.key === "ArrowLeft" || evt.key === "ArrowRight")) ||
      (evt.key === "ArrowUp" || evt.key === "ArrowDown") ||
      (!state.editingAdd && evt.key === "Tab")
    )) {
      const page0 = state.pageActive === "overview";

      let x = 0;
      let y = 0;

      const dx = evt.key === "ArrowLeft"  ? -1 : (evt.key === "ArrowRight"  ? 1 : 0);
      const dy = evt.key === "ArrowUp"    ? -1 : (evt.key === "ArrowDown"   ? 1 : 0);

      let maxX;
      let maxY;

      if (page0) {
        maxX = 0;
        maxY = state.pages.overview.data.cost.balance.length - 1;
      }
      else {
        maxX = state.pages[state.pageActive].numEditCols() - 1;
        maxY = state.pages[state.pageActive].data.length - 1;
      }

      if (state.editing.active) {
        if (page0) {
          y = Math.min(maxY, Math.max(
            0, state.editing.$elem.parent().index() + dy));
        }
        else {
          x = Math.min(maxX, Math.max(
            0, state.editing.$elem.index() + dx));

          y = Math.min(maxY, Math.max(
            0, state.editing.$elem.parent().index() - 1 + dy));
        }

        state.editing.finish(
          () => tableNavigate(state, true, evt, x, y, dx, dy, maxX, maxY)
        );
      }
      else {
        tableNavigate(state, false, evt, x, y, dx, dy, maxX, maxY);
      }

      evt.preventDefault();
    }
  }
}

/**
 * main window mouseup handler
 * @param {object} state application state
 * @returns {void} void
 */
export function mouseUpHandler(state) {
  if (state.editing.clicked) {
    // handle selecting from inside to outside input
    state.editing.unlock();
    state.editing.clicked = false;
  }
  else {
    state.editing.finish();
  }
}

