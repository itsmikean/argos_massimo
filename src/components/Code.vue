<template>
    <div class="code-editor boxed">
        <div class="notheme">
            <codemirror :value="codeContent"
            :options="cmOptions"
            @input="onCmCodeChange"
            @ready="onCmReady"
            @viewportChange="viewportChange"
            ref="codeeditor"></codemirror>
        </div>
    </div>
</template>

<script>
import Vue from "vue";
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import { settings } from "../common/Settings";
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/matchbrackets.js';
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint.js';
import 'codemirror/addon/lint/json-lint.js';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/xml-fold.js';
import 'codemirror/addon/fold/indent-fold.js';
// make the lint work
import jsonlint from "../common/jsonparser";

window.jsonlint = jsonlint
const editorTheme = settings.load('selectedEditorTheme', '')

export default Vue.extend({
    name: "Code",
    components: {
        codemirror
    },
    props: {
        content: String
    },
    data: () => ({
      theme: editorTheme,
      cmOptions: {
        tabSize: 2,
        mode: {
          name: 'javascript',
          json: true
        },
        theme: editorTheme,
        lineNumbers: true,
        line: true,
        collapseIdentical: true,
        styleActiveLine: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        lint: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers']
      }
    }),
    mounted: function() {
        const editorTheme = settings.load('selectedEditorTheme', 'base16-dark')

        if (editorTheme !== 'default') {
            require('codemirror/theme/' + editorTheme + '.css')
        }
        this.theme = settings.load('selectedEditorTheme', 'base16-dark');
    },
    watch: {
        theme: function (newVal) {
            this.cmOptions.theme = newVal
        }
    },
    methods: {
        onCmCodeChange: function (newVal) {
            this.$emit("code_changed", newVal)
        },
        onCmReady: function() {
            // do nothing for now
        },
        viewportChange: function() {
            // FIXME ugly hack to fix the gutter hiding the content in the environment variables editor
            const gutters = this.$el.querySelector(".CodeMirror-gutter.CodeMirror-linenumbers");
            gutters.style = "width: 0px !important;"
        }
    },
    computed: {
        codeContent: function () {
            return this.content
        }
    }
});
</script>
<style lang="scss">
.CodeMirror {
  font-size: .91rem;
  height: 55vh;
  min-height: 450px;
//   overflow: auto;
}
.CodeMirror-hscrollbar {
    bottom: 0;
    left: 0; 
    overflow-y: auto;
    overflow-x: auto;
}
.boxed {
  // -webkit-box-shadow: 0 1px 8px 1px $default-border-color;
  border-radius: 2px;
  border: 1px solid rgb(41, 41, 41);
}
</style>