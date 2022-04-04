<template>
  <div class="updates">
    <v-container fluid>
        <v-row>
            <v-col>
                <h3 class="h1">Remote Updates</h3>
                <p class="body-2">
                  Get notified when the remote repository master branch has newer commits.
                  <br/>
                  The check for updates is performed everytime you launch Argos3.
                </p>
                <v-switch
                    :color="$store.state.color"
                    v-on:change="toggleUpdate"
                    v-model="updateEnabled"
                ></v-switch>
                <v-row>
                  <v-col cols="5">
                    <v-text-field
                      :color="$store.state.color"
                      label="Enter your gitlab token"
                      v-model="currentToken"
                      required
                      @change="updateToken"
                      :append-icon="value ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="() => (value = !value)"
                      :type="value ? 'password' : 'text'"
                    ></v-text-field>
                    <v-btn
                        :color="$store.state.color"
                        outlined
                        @click="checkForUpdates"
                      >
                      Check for updates
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-alert v-if="text !== null"
                    
                    dense
                    text
                    :type="updateStatus"
                    close=""
                  >{{text}}</v-alert>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
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
        value: true,
        updateStatus: null,
        text: null
    }),
    methods: {
        toggleUpdate() {
          settings.save("remoteUpdate", this.updateEnabled);
        },
        updateToken() {
          settings.save('currentToken', this.currentToken);
        },
        checkForUpdates() {
          this.text = null;
          new Updates().getUpdates()
            .then((data) => {
              this.updateStatus = this.getType(data.status);
              this.text = data.message;
            }).catch((err) => {
              this.updateStatus = this.getType(err.status);
              this.text = err.message;
            });
        },
        getType(status) {
          switch (status) {
            case 'UPDATES':
              return 'warning'
            case 'INVALID':
              return 'error';
            case 'UP_TO_DATE':
              return 'success';
            case 'ERROR':
              return 'error';
            default:
              return 'error';
          }
        }
    }
});
</script>
<style lang="scss" scoped>
.updates {
    padding: 15px;
}
</style>