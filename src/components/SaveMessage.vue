<template>
  <div class="save-messages">
    <v-btn icon @click="editSaveMessage = true" large>
        <v-icon>mdi-content-save</v-icon>
    </v-btn>
    <v-row justify="center">
      <v-dialog
        v-model="editSaveMessage"
        v-on:click:outside="editSaveMessage = false"
        persistent
        max-width="600px"
      >
        <v-card>
          <v-card-title>
            <span class="headline">Save Message</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    :color="$store.state.color"
                    label="Enter message name"
                    v-model="messageName"
                    required
                    :hint="errorMessage"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              text
              @click="editSaveMessage = false"
            >
              Cancel
            </v-btn>
            <v-btn
              :color="$store.state.color"
              text
              @click="save"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Vue from "vue";
import Message from "../data/Message";

export default Vue.extend({
    name: "SaveMessage",
    props: {
        content: String,
        environment: Object
    },
    methods: {
        save: function () {
            this.errorMessage = (!this.messageName ? 'a name is required' : '')
            this.type = (!this.errorMessage ? '' : 'is-danger')
            if (!this.errorMessage) {
                const message = new Message(Message.Type.OUT, JSON.parse(this.content), this.environment.field)
                message.savedAs = this.messageName
                this.$emit("save_message", message)
                this.editSaveMessage = false
                this.messageName = ''
            }
        },
    },
    data: () => ({
        editSaveMessage: false,
        messageName: '',
        errorMessage: '',
        type: ''   
    })

});
</script>
<style lang="scss" scoped>

</style>