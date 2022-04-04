<template>
  <v-app>
    <SideMenu />
    <v-main>
      <div class="main-content">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script>
import Vue from "vue";
import SideMenu from "./components/SideMenu.vue";
import { settings } from "./common/Settings";

export default Vue.extend({
  name: "App",
  components: {
    SideMenu
  },
  data: () => ({
    drawer: true,
    theme: "dark",
    items: [
      { title: "Dashboard", icon: "mdi-view-dashboard", to: "/" },
      { title: "Settings", icon: "mdi-settings", to: "Settings" }
    ],
    mini: true
  }),
  mounted: function() {
    // set the theme
    this.$vuetify.theme.dark = settings.load("isDarkTheme", true);
  }
});
</script>

<style lang="scss">
.main-content {
  padding: 20px 0px 0px 70px;
  height: 100%;
}
</style>
