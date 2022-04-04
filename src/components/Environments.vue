<template>
  <div class="environments">
    <v-row>
      <v-col>
        <v-btn v-on:click="addEnv"
          class="mx-2"
          fab
          small
          max-width="600px"
        >
          <v-icon>
            mdi-plus
          </v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <v-text-field
          :color="$store.state.color"
          v-model="envFilter"
          label="Filter environments"
          clearable
        ></v-text-field>
      </v-col>
    </v-row>
    <v-container fluid>
        <v-row dense>
        <v-col
            v-for="environment in filteredEnvironments"
            :key="environment.id"
            cols="4"
        >
            <v-card elevation="3" outlined>
            <v-card-title v-text="environment.name"></v-card-title>
            <v-card-text>
                <p>{{environment.url | truncate}}</p>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn icon @click="manageMessages(environment)">
                    <v-icon>mdi-folder</v-icon>
                </v-btn>

                <v-btn icon @click="edit(environment)">
                    <v-icon>mdi-square-edit-outline</v-icon>
                </v-btn>

                <v-btn icon @click="deleteEnvironment(environment)">
                    <v-icon>mdi-delete</v-icon>
                </v-btn>
            </v-card-actions>
            </v-card>
        </v-col>
        </v-row>
    </v-container>
    <ManageMessages :toggled="editMessages" :environment="selectedEnvironment" v-on:close_manage_messages="closeEditMessages"/>
    <v-row justify="center">
      <v-dialog
        v-model="editMode"
        persistent
      >
        <v-card>
          <v-card-title>
            <span class="headline">Edit Environment</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-select
                    :item-color="$store.state.color"
                    :color="$store.state.color"
                    v-model="selectedEnvironment.environmentType"
                    :items="environmentTypes"
                    label="Choose Environment type"
                  ></v-select>
                  <v-text-field
                    :color="$store.state.color"
                    label="Enter name"
                    v-model="selectedEnvironment.name"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    :color="$store.state.color"
                    label="Enter url"
                    v-model="selectedEnvironment.url"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-show="selectedEnvironment.environmentType === 'websocket'"
                    :color="$store.state.color"
                    label="Enter message required field if any"
                    v-model="selectedEnvironment.field"
                    required
                  ></v-text-field>
                </v-col>
                <v-col>
                  <Variables :variables="selectedEnvironment.variables" v-on:changed="updateVariables"/>
                  {{errorMessage}}
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
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
import { settings } from "../common/Settings";
import Env from "../data/Environment.js";
import vars from "../const/Variables.js";
import Environment from "../data/Environment.js";
import ManageMessages from "../components/ManageMessages.vue";
import Variables from "../components/Variables.vue";

export default Vue.extend({
    name: "Environments",
    components: {
        ManageMessages,
        Variables
    },
    data: () => ({
        environments: settings.load('environments', []),
        editMode: false,
        editMessages: false,
        selectedEnvironment: {},
        errorMessage: null,
        envFilter: '',
        environmentTypes: vars.ENVIRONMENT_TYPES.map((envType) => {
          return {
            text: Environment.environmentTypeLabel(envType),
            value: envType,
            // default to websocket
            selected: envType === Environment.Type.WEB_SOCKET ? true : false
          };
        })
    }),
    mounted: function() {
      // make sure all the loaded environments are prototyped so 
      // methods from the Environment class can be invoked
      this.environments.map((env) => {
        const instance = Object.setPrototypeOf(env, Environment.prototype);
        // for back compatibility make sure the instance is set to websocket for 
        // existing environments
        if (!instance.environmentType) {
          instance.environmentType = Environment.Type.WEB_SOCKET;
        }
      });
    },
    methods: {
        addEnv: function() {
            this.environments.push(new Env(
            "Enter name",
            "Enter url",
            "type",
            vars.ENVIRONMENT_TYPES[0]
            ));
        },
        deleteEnvironment: function(env) {
            this.environments = this.environments.filter(function(el) {
            return el.id !== env.id
            })
            settings.save('environments', this.environments);
        },
        edit: function(env) {
            this.editMode = true;
            this.selectedEnvironment = env;
        },
        save: function() {
          this.errorMessage = null;
          try {
            const parsed = JSON.parse(this.selectedEnvironment.variables);
            if (!(parsed instanceof Object)) {
              throw new TypeError("Variables must be an object");
            }
            settings.save('environments', this.environments);
            this.editMode = false;
            this.selectedEnvironment = {}
          } catch (err) {
            // display error message
            this.errorMessage = "Varialbes must be a valid json object";
            return;
          }
        },
        manageMessages: function(environment) {
            this.editMessages = true;
            this.selectedEnvironment = environment;
        },
        closeEditMessages: function() {
            this.editMessages = false;
            this.selectedEnvironment = {};
        },
        updateVariables: function(variables) {
          this.selectedEnvironment.variables = variables;
        }
    },
    computed: {
      filteredEnvironments: function() {
        // if the filter is either empty, null or undefined then return all the environments
        if (!this.envFilter) {
          return this.environments;
        }
        // return only the environments matching the envFilter value otherwise
        return this.environments.filter((env) => {
          return env.matches(this.envFilter);
        });
      }
    },
    filters: {
      truncate: function (value) {
        if (value.length > 25) {
          value = value.substring(0, 35) + '...'
        }
        return value
      }
    },
    watch: {
      selectedEnvironment: {
          handler(newVal) {
            if (!this.selectedEnvironment.variables) {
              this.selectedEnvironment.variables = "{}";
            }
          },
          deep: true
        } 
    }
});
</script>
<style lang="scss" scoped>
.environments {
    padding: 15px;
}
</style>