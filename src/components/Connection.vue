<template>
  <div class="connection">
        <v-row v-if="environments.length" style="display:flex;justify-content:space-between;">
            <v-col cols="6">
                <v-row>
                    <v-col>
                        <v-select
                            :items="environments"
                            label="Select Connection"
                            v-model="selectedEnvironment"
                            solo
                            item-text="name"
                            return-object
                            :color="$store.state.color"
                            :item-color="$store.state.color"
                            persistent-hint
                            :hint="hint"
                        ></v-select>
                    </v-col>
                    <v-col>
                        <v-btn
                            v-on:click="toggleConnection"
                            v-if="connecting === false"
                            large
                            :color="connectionColor"
                            >
                            <v-icon>{{icon}}</v-icon>
                        </v-btn>
                        <v-btn
                            v-on:click="toggleConnection"
                            v-if="connecting === true"
                            large
                            :color="connectionColor"
                            loading
                            >
                            <v-icon>{{icon}}</v-icon>
                        </v-btn>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="3" class="to-end">
                <Updates-widget />
            </v-col>
        </v-row>
        <v-row v-if="!environments.length">
            <v-col>
                Start adding a connection
                <div class="link">
                    <a>
                        <router-link to="/settings">here</router-link>
                    </a>
                </div>
            </v-col>
        </v-row>
        <v-row v-if="dashboard">
            <v-col>
                <Dashboard :dashboard="dashboard" :connectionevent="connectionEvent"/>
            </v-col>
        </v-row>
  </div>
</template>

<script>
/* eslint-disable  @typescript-eslint/no-this-alias */
import Vue from "vue";
import { settings } from "../common/Settings";
import UpdatesWidget from "../components/UpdatesWidget.vue";
import Dash from "../data/Dashboard";
import Websocket from "../data/Websocket";
import Dashboard from "../components/Dashboard.vue";
import Env from '@/data/Environment.js'

export default Vue.extend({
    name: "Connection",
    components: {
        Dashboard,
        UpdatesWidget
    },
    data: () => ({
      environments: settings.load('environments', []),
      connected: false,
      dashboard: null,
      selectedEnvironment: null,
      state: null,
      connectionEvent: null,
      connecting: false,
      waiting: null
    }),
    computed: {
        icon: function() {
            return this.connected ? "mdi-link" : "mdi-link-off";
        },
        connectionColor: function() {
            return this.connected ? this.$store.state.color : "default";
        },
        hint: function() {
            return this.connected ? "Connected" : "Disconnected";
        }
    },
    methods: {
        connect: function () {

            if (!this.selectedEnvironment) {
                alert("Please select a connection first");
                return;
            }

            if (this.selectedEnvironment.environmentType === Env.Type.GQL) {
                this.dashboard = new Dash(this.selectedEnvironment, null, this.name)
                this.connected = true
								this.connecting = false
                return;
            }

            if (this.dashboard && this.dashboard.environment === this.selectedEnvironment) {
                this.dashboard.environment = this.selectedEnvironment
            } else {
                // TODO init connection based on type
                const connection = new Websocket(this.selectedEnvironment)
                this.dashboard = new Dash(this.selectedEnvironment, connection, this.name)
            }
            this.connecting = true;
            this.connectionEvent = {
                content: `Connecting to ${this.dashboard.environment.name}...`,
                type: "default"
            };
            clearTimeout(this.waiting);
            this.dashboard.connection.connect().then(() => {
                this.connected = true;
                this.state = this.dashboard.connection.state;
                this.connecting = false;
                this.connectionEvent = {
                    content: `Succesfully connected to ${this.dashboard.environment.name}`,
                    type: "ok"
                };
            }, (err) => {
                this.connected = false;
                this.state = null;
                const errorMessage = (err.message ? err.message : 'not able to connect to the server')
                this.connectionEvent = {
                    content: errorMessage,
                    type: "error"
                };
                this.connecting = false;
            });

            const _this = this;
            this.waiting = setTimeout(() => {
                if (_this.connecting) {
                    _this.connecting = false;
                    _this.connectionEvent = {
                        content: "Could not reach the server after 10 seconds",
                        type: "error"
                    };
                }
            }, 10000);
        },
        disconnect: function () {
            if (!this.dashboard) {
                this.connected = false;
                return;
            }

						if (this.dashboard.environment.environmentType === Env.Type.GQL) {
							this.connected = false
							this.dashboard = null
							return
						}


            this.dashboard.connection.disconnect();
            this.connected = false;
            this.connectionEvent = {
                content: `Disconnected from ${this.dashboard.environment.name}`,
                type: "default"
            };
        },
        toggleConnection() {
            if (this.connected) {
                this.disconnect();
            } else {
                this.connect();
            }
        }
    },
    watch: {
        dashboard: {
            handler(newVal) {
							if (newVal.environment.environmentType === Env.Type.GQL) {
								return;
							}

							if (!newVal.connection || newVal.connection.state > 1) {
									this.connected = false
									// this.toastMessage('disconnected from server')
							}
            },
            deep: true
        }
    }   
});
</script>
<style lang="scss" scoped>
.to-end {
    display: flex;
    justify-content: flex-end;
    margin-right: 30px;
    padding-top: 24px;
}
</style>