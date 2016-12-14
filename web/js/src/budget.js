/**
 * Main entry point for budget web app
 */

import $ from "../lib/jquery.min";

import { NAV_HANDLE_EVENT } from "const";
import { mouseUpHandler, keyDownHandler, navHandler } from "misc/nav";
import { EditItem, editable } from "misc/edit";

import { Api } from "api/api";

const navState = {
  pages: {},
  pageActive: null,
  navActive: null,
  currentPage: null,
  graphHidden: false,
  editing: new EditItem(),
  editingAdd: false
};

const api = new Api(navState);

$.fn.editable = editable;

$(document).ready(() => {
  $(window)
  .on("mouseup", mouseUpHandler.bind(null, navState))
  .on("keydown", keyDownHandler.bind(null, api.user, navState));

  // handle user login
  api.user.init($("#login-form").children(".input-pin"), $("#login-form"));

  $(".nav-link").each(navHandler.bind(null, api, navState));
  $("#nav-link-logout").on(NAV_HANDLE_EVENT, () => api.user.logout());
  navState.currentPage = Cookies.get("currentPage");

  if (!navState.currentPage) {
    navState.currentPage = "overview";
  }
});

