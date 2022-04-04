<template>
  <div class="dashboard">
		<v-container fluid class="no-top-space">
      <v-row>
        <v-col>
          <v-btn
            v-on:click="loadSchema"
            > load schema
            <v-icon>mdi-reload</v-icon>
          </v-btn>
        </v-col>
        <v-col class="to-end">
          <v-btn
              v-on:click="fire"
              > run query
            <v-icon>mdi-play</v-icon>
          </v-btn>
        </v-col>
      </v-row>
			<v-row>
				<v-col id="left" style="flex-basis:unset;" class="lefty">
						<v-col id="messages-row" class="scroll">
              <!-- Add schema navigator here, it would be cool! -->
              <GQLSchema :schema="schema" />
						</v-col>
						<v-col id="variables-row" class="to-bottom">
								<Variables :variables="variables" v-on:changed="updateVariables"/>
						</v-col>
				</v-col>
				<v-col id="right" class="" style="flex-basis:unset;">
					<v-row>
						<v-col id="send" style="flex-basis:unset;">
              <div class="send">
                <div class="full">
                  <textarea id="foo" rows="8" cols="80" class="notheme"></textarea>
                </div>
              </div>
						</v-col>
						<v-col id="receive" style="flex-basis:unset;">
							<v-row class="to-end">
							</v-row>
							<Code :content="receivedContent" v-on:code_changed="updateReceivedContent"/>
						</v-col>
					</v-row>
					<v-row>
						<v-col>
								<Konsole ref="konsole"/>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</v-container>
  </div>
</template>

<script>
/* eslint-disable  @typescript-eslint/no-this-alias */
import Vue from "vue";
import { settings } from "../common/Settings";
import Code from "../components/Code.vue";
import Split from "split.js";
import Konsole from "../components/Konsole.vue";
import { getIntrospectionQuery, buildClientSchema} from 'graphql'
import { graphQl } from '@/data/GraphQl.js'
import CodeMirror from 'codemirror';
import Variables from "../components/Variables.vue";
import Interpolator from "../data/Interpolator";
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/lint/lint';
import 'codemirror-graphql/hint';
import 'codemirror-graphql/lint';
import 'codemirror-graphql/mode';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/xml-fold.js';
import 'codemirror/addon/fold/indent-fold.js';
import 'codemirror/addon/comment/comment.js';
import 'codemirror/addon/comment/continuecomment.js';
import {getAutocompleteSuggestions} from 'graphql-language-service-interface';
import GQLSchema from '@/components/GQLSchema.vue';

export default Vue.extend({
	name: "GQLDashboard",
	props: {
			dashboard: Object,
	},
	components: {
		Code,
		Konsole,
		Variables,
    GQLSchema
	},
	mounted: function () {
		Split(['#send', '#receive'], {
				sizes: [50, 50],
				gutterSize: 2
		});
		Split(['#left', '#right'], {
				sizes: [25, 75],
				gutterSize: 2
		});

    const _this = this

    function snippet() {
      CodeMirror.showHint(_this.code, function () {
          const schema = _this.schema;
          if (!schema) {
            return;
          }

          const cur = _this.code.getCursor();
          const token = _this.code.getTokenAt(cur);
          const rawResults = getAutocompleteSuggestions(
            schema,
            _this.code.getValue(),
            cur,
            token,
          );

          const tokenStart =
            token.type !== null && /"|\w/.test(token.string[0])
              ? token.start
              : token.end;
          const results = {
            list: rawResults.map(item => ({
              text: item.label,
              type: schema.getType(item.detail),
              description: item.description,
              isDeprecated: item.isDeprecated,
              deprecationReason: item.deprecationReason,
              displayText: item.label + ' - ' + item.documentation
            })),
            from: {line: cur.line, column: tokenStart},
            to: {line: cur.line, column: token.end},
          };

          if (results && results.list && results.list.length > 0) {
            results.from = CodeMirror.Pos(results.from.line, results.from.column);
            results.to = CodeMirror.Pos(results.to.line, results.to.column);
          }

          return results;
      }, { completeSingle: false });
    }
    const editorTheme = settings.load('selectedEditorTheme', 'default')

    if (editorTheme !== 'default') {
      require('codemirror/theme/' + editorTheme + '.css')
    }

    const welcome = '# Welcome to the graphql dashboard.\n' +
                    '# Some useful tips before you start:\n' +
                    '# - To pass the bearer token, create an `headers` object in the variables box\n' +
                    '#   in the bottom left corner of the view\n' +
                    '# - Click the load schema button to get autocomplete functionalities\n' +
                    '# - Start typing to get autocomplete suggestions\n' +
                    '# - Use `ctrl-space` or `cmd-space` to open the autocomplete suggestion list\n' +
                    '# - Use `ctrl-/` or `cmd-/` to comment/uncomment code\n' +
                    '# - Use the play icon button to trigger the graphql query\n'

    this.code = CodeMirror.fromTextArea(document.getElementById('foo'), {
      mode: 'graphql',
      lint: {
        schema: _this.schema
      },
      hint: 'graphql',
      hintOptions: {
        schema: _this.schema
      },
      theme: editorTheme,
      lineNumbers: true,
      line: true,
      collapseIdentical: true,
      styleActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      tabSize: 2,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      extraKeys: {
        'Cmd-Space': function () {
            snippet()
        },
        'Ctrl-Space': function () {
            snippet()
        },
        'Cmd-/': () => {
          _this.code.toggleComment()
        },
        'Ctrl-/': () => {
          _this.code.toggleComment()
        }
      }
    })
    this.code.setValue(welcome);
    this.code.on('keyup', function (cm, event) {
      if (event.keyCode >= 65 && event.keyCode <=90) {
        snippet()
      }
    });
    snippet()
	},
	data: function() {
    return {
      schema: null,
      token: null,
      code: null,
      receivedContent: JSON.stringify(null, null, 2),
      dictionary: [],
      theme: settings.load('selectedTheme', 'dark').name,
      headers: {
        Authorization: null
      },
      variables: "{}",
    }
	},
	computed: {

	},
	methods: {
    loadSchema: function () {
      const _this = this
      const variables = this.variables ? JSON.parse(this.variables) : null;
      this.headers = variables ? variables.headers : null;
      if (this.headers) {
        graphQl.query(this.dashboard.environment.url, getIntrospectionQuery(), this.headers)
        .then((res) => {
          const schema = buildClientSchema(res.body.data)
          _this.code.options.lint.schema = schema
          _this.code.options.hintOptions.schema = schema
          _this.schema = schema
          _this.$refs.konsole.addLine({
            content: 'Schema loaded succesfully',
            type: "ok"
          }); 
        }, (err) =>{
          _this.$refs.konsole.addLine({
            content: `Error while loading schema, ${err.message}`,
            type: "error"
          }); 
        })
        return;
      }

      _this.$refs.konsole.addLine({
        content: `Bearer Token required`,
        type: "error"
      }); 
      return null;
    },
    fire: function () {
      const _this = this
      let content = '';
      if (this.code.getValue()) {
        content = this.code.getValue()
      }
      const envVariables = this.dashboard.environment.variables;
      const objEnvVariables = envVariables ? JSON.parse(envVariables) : {};
      this.headers = this.dashboard.context.headers;
      try {
        graphQl.query(this.dashboard.environment.url, Interpolator.interpolate(content, Object.assign(objEnvVariables, this.dashboard.context)), this.headers)
          .then((result) => {
            _this.receivedContent = JSON.stringify(result.body.data, null, 2)
        }, (err) => {
          _this.receivedContent = JSON.stringify(err, null, 2)
        })
      } catch (err) {
        _this.$refs.konsole.addLine({
          content: `Unexpected error ${err.message}`,
          type: "error"
        }); 
      }
    },

    getSchemaTooltip: function () {
      if (this.schema) {
        return 'grapqhl schema loaded'
      }
      return 'no graphql schema found'
    },
    updateReceivedContent: function (content) {
      this.receivedContent = content
    },
    updateHeaders: function (headers) {
      this.headers = headers;
    },
		updateVariables: function(variables) {
			try {
				if (!variables || !variables.length) {
					this.dashboard.context = {};
				} else {
					const parsed = JSON.parse(variables);
					this.dashboard.context = parsed;
					this.variables = variables;
				}
			} catch (err) {
			// let's not spam the console or the konsole for now...
			}
		}
	}
});
</script>
<style lang="scss">
.gutter.gutter-horizontal {
	width: 2px;
	background-color: #212321;
	cursor: ew-resize;
}
.gutter.gutter-vertical {
	margin: 10px 0px;
	background-color: #212321;
	cursor: ns-resize;
}
.custom-size {
	flex: 0 0 82%!important;
	max-width: 85%!important;
}

.to-end {
	display: flex;
	justify-content: flex-end;
	padding: 5px;
}

.no-top-space {
	padding-top: 0px;
	margin-top: -25px;
	padding-right: 30px;
}

.lefty {
	position: relative;
	display: flex;
	flex-direction: column;
}

.scroll {
	overflow-y: auto;
}

.to-bottom {
	max-height: 175px;
}

ul.CodeMirror-hints {
  position: fixed;
  width: 500px;
  z-index: 2000;
  border: 1px black;
  background: rgb(220, 219, 219);
  border-radius: 3px;
  font-size: .9rem;
  font-family: monospace;
  // color: $light-text-color;
  list-style-type: none;
  padding: 10px;
}

li.CodeMirror-hint-active {
  background: rgb(240, 131, 47);
  color: black;
}

.send {
  border: 1px solid #313131;
  margin-top: 10px;
}
</style>