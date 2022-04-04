<template>
  <div class="manage-messages">
    <v-row justify="center">
      <v-dialog
        v-model="toggled"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">Manage saved messages for {{environment.name}}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-file-input
                v-model="savedMessagesFile"
                :color="$store.state.color"
                counter
                label="Import Messages (this will override your saved messages for this environment)"
                placeholder="Select your file"
                prepend-icon="mdi-paperclip"
                outlined
                :show-size="1000"
                >
                <template v-slot:selection="{ index, text }">
                    <v-chip
                    v-if="index < 2"
                    :color="$store.state.color"
                    label
                    small
                    >
                    {{ text }}
                    </v-chip>
                </template>
                </v-file-input>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text
              @click="cancel"
            >
              Close
            </v-btn>
            <v-btn
              :color="$store.state.color"
              text
              @click="importMessages"
            >
              Import
            </v-btn>
            <v-btn
              :color="$store.state.color"
              text
              @click="exportMessages"
              v-bind:href="savedMessagesLocation" download="saved_messages.json"
            >
              Export
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <div class="text-center ma-2">
        <v-snackbar
            v-model="toggleToast"
        >
            {{ toastMessage }}
    
            <template v-slot:action="{ attrs }">
            <v-btn
                :color="$store.state.color"
                text
                v-bind="attrs"
                @click="toggleToast = false"
            >
                Ok
            </v-btn>
            </template>
        </v-snackbar>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import Environments from "../components/Environments.vue";
import Theme from "../components/Theme.vue";
import { settings } from "../common/Settings";
import { files } from "../common/Files";

export default Vue.extend({
  name: "ManageMessages",
  props: {
    environment: Object,
    toggled: Boolean
  },
  data: () => ({
    savedMessagesFile: null,
    toastMessage: "",
    toggleToast: false
}),
  computed: {
        savedMessagesLocation: function () {
          return 'data:json/plain;base64,' + btoa(JSON.stringify(settings.load('messages_' + this.environment.name, []), null, '').trim());;
        }
  },
  methods: {
    importMessages: function(ev) {
        const path = this.savedMessagesFile.path;
        if (path.indexOf('.json') === (path.length - 5)) {
            files.readJsonFile(this.savedMessagesFile, this.validateJson).then((content)=>{
            this.toast('File imported successfully');
            settings.save('messages_' + this.environment.name, content);
            this.$emit("close_manage_messages");
            this.savedMessagesFile = null;
            }, () => {
                this.toast("Import failed. Invalid format found");
                this.savedMessagesFile = null;
            });
        } else {
            this.toast('json format required');
        }
    },
    exportMessages: function() {
        // this.$emit("close_manage_messages");
    },
    validateJson: function(data) {
        if (Object.prototype.toString.call(data) !== '[object Array]') {
            return false;
        }

        for (let i = 0; i < data.length; i++) {
            const current = data[i];
            if (!current.savedAs) {
                return false;
            }
        }
        return true;
    },
    cancel: function() {
        this.$emit("close_manage_messages");
    },
    toast: function(message) {
        this.toastMessage = message;
        this.toggleToast = true;
    },

    closeToast: function() {
        this.toastMessage = '';
        this.toggleToast = false;
    }
  }
});
</script>

<style lang="scss" scoped>

</style>
