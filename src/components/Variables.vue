<template>
    <div class="variables">
        <Code :content="variables" v-on:code_changed="updateVars"/>
    </div>
</template>

<script>
import Vue from "vue";
import Code from "../components/Code";

export default Vue.extend({
    name: "Variables",
    props: {
        variables: String
    },
    mounted: function() {
        const codeEditor = this.$el.querySelector(".CodeMirror");

        codeEditor.style = "font-size: .91rem; height: 150px; min-height:unset;";

        // const hScrollbar = this.$el.querySelector(".CodeMirror-hscrollbar");

        // hScrollbar.style = "bottom: 0;left: 0; overflow-y: auto;overflow-x: auto;";
    },
    components: {
        Code
    },
    data: () => ({
        // variables: "{}"
    }),
    methods: {
        updateVars: function(variables) {
            this.$emit("changed", variables);
        }
    }
});
</script>
<style lang="scss">

</style>