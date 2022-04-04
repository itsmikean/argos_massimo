<template>
  <div class="theme">
    <v-container fluid>
        <v-row>
            <v-col>
                <p>Argos Theme</p>
                <v-switch
                    :color="$store.state.color"
                    v-on:change="updateTheme"
                    v-model="selectedTheme"
                    :label="themeLabel"
                ></v-switch>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <p>Main Color</p>
                <v-select
                    :items="colors"
                    label="Main Color"
                    v-model="selectedColor"
                    solo
                    :color="$store.state.color"
                    :item-color="$store.state.color"
                    v-on:change="updateColor"
                ></v-select>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4">
                <p>Editor Color Scheme</p>
                <v-select
                    :items="editorThemes"
                    label="Main Color"
                    v-model="selectedEditorTheme"
                    solo
                    :color="$store.state.color"
                    :item-color="$store.state.color"
                    v-on:change="updateEditorTheme"
                ></v-select>
            </v-col>
        </v-row>
    </v-container>
  </div>
</template>

<script>
import Vue from "vue";
import { settings } from "../common/Settings";
import vars from "../const/Variables.js";

export default Vue.extend({
    name: "Theme",
    data: () => ({
        themes: vars.THEMES,
        editorThemes: vars.CODE_THEMES,
        selectedTheme: settings.load('isDarkTheme', true),
        selectedEditorTheme: settings.load('selectedEditorTheme', 'base16-dark'),
        colors: vars.COLORS,
        selectedColor: null,
    }),
    methods: {
        updateTheme() {
            this.$vuetify.theme.dark = this.selectedTheme;
            settings.save("isDarkTheme", this.selectedTheme);
        },
        updateColor: function() {
            this.$store.commit("setColor", this.selectedColor);
            settings.save("color", this.selectedColor);
        },
        updateEditorTheme: function() {
            settings.save('selectedEditorTheme', this.selectedEditorTheme);
        }
    },
    mounted: function() {
        this.selectedColor = this.$store.state.color;
    },
    computed: {
        themeLabel: function() {
            return this.selectedTheme ? 'dark' : 'light';
        }
    }
});
</script>
<style lang="scss" scoped>
.theme {
    padding: 15px;
}
</style>