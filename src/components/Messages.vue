<template>
  <div class="messages">
    <v-card
    >
      <v-toolbar>  
        <v-toolbar-title>Messages</v-toolbar-title>
  
        <v-spacer></v-spacer>

        <MessageList :dashboard="dashboard" v-on:select_saved_message="selectSavedMessage"/>
  
        <v-btn icon @click="clearMessages">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-toolbar>
  
      <v-list>  
        <v-list-item
            v-on:click.stop="selectMessage(item)"
            v-for="(item, index) in items"
            :key="index"
        >
          <v-list-item-avatar>
            <v-icon
                :color="messageColor(item)"
            >
              {{messageIcon(item)}}
            </v-icon>
          </v-list-item-avatar>
  
          <v-list-item-content>
            <v-list-item-title v-text="item.name"></v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click.prevent="deleteMessage($event, index)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import Vue from "vue";
import Message from "../data/Message";
import MessageList from "../components/MessageList";

export default Vue.extend({
    name: "Messages",
    props: {
        dashboard: Object
    },
    components: {
        MessageList
    },
    data: () => ({

    }),
    methods: {
        clearMessages: function() {
            this.dashboard.connection.clearMessages()
        },
        deleteMessage: function(ev, message) {
            ev.preventDefault()
            this.$emit("delete_message", message)
        },
        selectMessage: function (msg) {
          this.$emit("select_message", msg)
        },
        selectSavedMessage: function(message) {
          this.$emit("select_saved_message", message)
        },
        messageIcon: function(item) {
            return item.direction === Message.Type.IN ? "mdi-call-received" : "mdi-call-made";
        },
        messageColor: function(item) {
            return item.direction === Message.Type.IN ? "orange" : "green"; 
        }
    },
    computed: {
        items: function() {
            return this.dashboard.connection.messages;
        }
    }

});
</script>
<style lang="scss" scoped>

</style>