import Vue from "vue";
import Vuex from "vuex";
import { settings } from "../common/Settings";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    color: settings.load("color", "blue")
  },
  mutations: {
    setColor (state, color) {
      state.color = color;
    }
  },
  actions: {},
  modules: {},
});
