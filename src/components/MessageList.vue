<template>
    <div class="message-list">
        <v-btn icon @click="showSavedMessages = true">
            <v-icon>mdi-view-module</v-icon>
        </v-btn>
        <v-row justify="center">
            <v-dialog
                v-model="showSavedMessages"
                persistent
                v-on:click:outside="showSavedMessages = false"
                max-width="600px"
            >
                <v-card>
                    <v-toolbar>        
                        <v-toolbar-title>Saved Messages</v-toolbar-title>
                    </v-toolbar>
                    <v-list
                        two-line
                        flat
                    >
                        <v-list-item-group>
                        <v-list-item v-for="(message, index) in messages" v-bind:key="index" @click.stop="select(message)">
                            <template>
                                <v-list-item-content>
                                    <v-list-item-title>{{message.savedAs}}</v-list-item-title>
                                    <v-list-item-subtitle>{{subheader(message)}}</v-list-item-subtitle>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn icon @click.prevent="deleteMessage(index)">
                                        <v-icon>mdi-delete</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </template>
                        </v-list-item>
                        </v-list-item-group>
                    </v-list>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                    text
                    @click="showSavedMessages = false"
                    >
                    Close
                    </v-btn>
                </v-card-actions>
                </v-card>
            </v-dialog>
        </v-row>
    </div>
</template>

<script>
import Vue from "vue";
import { settings } from "../common/Settings";

export default Vue.extend({
    name: "MessageList",
    props: {
        dashboard: Object
    },
    data: function() {
        return {
            showSavedMessages: false,
            filterQuery: '',
            messages: settings.load('messages_' + this.dashboard.environment.name, [])
        };
    },
    methods: {
        deleteMessage: function (index) {
            const messages = settings.load('messages_' + this.dashboard.environment.name, [])
            messages.splice(index, 1)
            settings.save('messages_' + this.dashboard.environment.name, messages)
            this.messages.splice(index, 1)
        },
        select: function (message) {
            this.$emit("select_saved_message", message)
            this.showSavedMessages = false; 
        },
        subheader: function(message) {
            return message.$argos ? message.$argos : message.name;
        }
    },
    watch: {
        showSavedMessages: function (newVal, oldVal) {
            this.messages = settings.load('messages_' + this.dashboard.environment.name, []);
        }
    }
});
</script>
<style lang="scss">

</style>