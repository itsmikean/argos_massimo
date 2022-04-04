<template>
  <div class="settings">
    <v-tabs v-model="tab" align-with-title :color="color">
        <v-tabs-slider ></v-tabs-slider>
        <v-tab v-for="option in options" :key="option">
            {{ option }}
        </v-tab>
    </v-tabs>
    <section class="setting-section">
        <!-- if tab === 0 then display environments setup -->
        <Environments v-show="tab === 0"/>
        <!-- if tab === 1 then display theme setup -->
        <Theme v-show="tab === 1"/>
        <!-- if tab === 2 then display updates setup -->
        <Updates v-show="tab === 2"/>
    </section>
  </div>
</template>

<script lang="js">
import Vue from "vue";
import Environments from "../components/Environments.vue";
import Theme from "../components/Theme.vue";
import Updates from "../components/Updates.vue";

export default Vue.extend({
  name: "Settings",
  components: {
      Environments,
      Theme,
      Updates
  },
  props: {
    selectedTab: Number
  },
  mounted() {
    if (this.$route.params.selectedTab) {
      this.tab = this.$route.params.selectedTab;
    }
  },
  data: () => ({
    tab: null,
    options: ['Environments', 'Theme', 'Updates'],
  }),
  computed: {
      color: function() {
          return this.$store.state.color;
      }
  }
});
</script>

<style lang="scss" scoped>
.settings {
    margin-top: -20px;
    margin-left: -15px;
}
</style>
