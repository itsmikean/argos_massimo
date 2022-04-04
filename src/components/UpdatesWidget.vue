<template>
  <div class="updates-widget">
    <v-row>
      <v-progress-circular
        v-if="updateEnabled && alert === null"
        indeterminate
        :color="$store.state.color"
      ></v-progress-circular>
      <v-alert v-if="updateEnabled && alert !== null"
        :type="alert.type"
        dense
        elevation="10"
        outlined
        @click="toSettings"
      ><span class="caption display-1">{{alert.text}}</span></v-alert>
    </v-row>
  </div>
</template>

<script>
import Vue from "vue";
import { settings } from "../common/Settings";
import Updates from "../common/Updates.ts";

export default Vue.extend({
    name: "Theme",
    data: () => ({
        updateEnabled: settings.load('remoteUpdate', true),
        currentToken: settings.load('currentToken', ''),
        alert: null
    }),
    methods: {
      toggleUpdate() {
        settings.save("remoteUpdate", this.updateEnabled);
      },
      updateToken() {
        settings.save('currentToken', this.currentToken);
      },
      checkForUpdates() {
        this.alert = null;
        new Updates().getUpdates()
          .then((data) => {
            this.alert = this.getAlert(data.status);
          }).catch((err) => {
            this.alert = this.getAlert(err.status);
          });
      },
      getAlert(status) {
        switch (status) {
          case 'UPDATES':
            return {
              type: 'warning',
              text: 'update available'
            }
          case 'INVALID',
               'ERROR':
            return {
              type: 'error',
              text: 'click for more'
            };
          case 'UP_TO_DATE':
            return {
              type: 'success',
              text: 'up to date'
            };
          default:
            return {
              type: 'error',
              text: 'click for more'
            };
        }
      },
      toSettings() {
        this.$router.push({name: 'Settings', params: {selectedTab: 2}})
      }
    },
    created: async function() {
      await this.checkForUpdates();
    }
});
</script>
<style lang="scss" scoped>
.updates {
    padding: 15px;
}
.v-alert {
  width: 45px;
  overflow: hidden;
  height: 44px;
  padding-left: 10px;
  transition: width 0.3s ease-in-out;
  &:hover {
    width: 170px;
    cursor: pointer;
  }
}
</style>