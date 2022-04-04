<template>
  <div class="side-menu">
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      permanent
      absolute
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-icon>mdi-menu</v-icon>
        </v-list-item-avatar>

        <v-list-item-title>ARGOS</v-list-item-title>

        <v-btn icon @click.stop="mini = !mini">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item v-for="item in items" :key="item.title" :href="item.to">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "SideMenu",
  data: () => ({
    drawer: true,
    theme: "dark",
    items: [
      { title: "Dashboard", icon: "mdi-view-dashboard", to: "/" },
      { title: "Settings", icon: "mdi-settings", to: "Settings" }
    ],
    mini: true
  })
});
</script>
