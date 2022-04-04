<template>
  <div class="dashboard">
		<v-container fluid class="no-top-space">
			<v-row>
				<v-col id="left" style="flex-basis:unset;" class="lefty">
					<!-- <v-row > -->
						<v-col id="messages-row" class="scroll">
								<Messages :dashboard="dashboard"
										v-on:delete_message="deleteMessage"
										v-on:select_message="selectMessage"
										v-on:select_saved_message="selectSavedMessage"/>
						</v-col>
					<!-- </v-row> -->
					<!-- <v-row> -->
						<v-col id="variables-row" class="to-bottom">
								<Variables :variables="variables" v-on:changed="updateVariables"/>
						</v-col>
					<!-- </v-row> -->
				</v-col>
				<v-col id="right" class="" style="flex-basis:unset;">
					<v-row>
						<v-col id="send" style="flex-basis:unset;">
							<v-row class="to-end">
									<!-- <v-col> -->
										<SaveMessage :content="sendContent" :environment="dashboard.environment" v-on:save_message="saveMessage"/>
									<!-- </v-col>
									<v-col> -->
										<v-btn
												v-on:click="send"
												icon
												large
												>
											<v-icon>mdi-send</v-icon>
										</v-btn>
									<!-- </v-col> -->
							</v-row>
							<Code :content="sendContent" v-on:code_changed="updateSendContent"/>
						</v-col>
						<v-col id="receive" style="flex-basis:unset;">
							<v-row class="to-end">
								<!-- <v-col> -->
									<v-btn
											v-on:click="resend"
											icon
											large
											>
										<v-icon>mdi-send</v-icon>
									</v-btn>
								<!-- </v-col> -->
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
import Message from "../data/Message";
import Messages from "../components/Messages.vue";
import Sequence from "../data/Sequence";
import SaveMessage from "../components/SaveMessage.vue";
import Variables from "../components/Variables.vue";
import Interpolator from "../data/Interpolator";

const example = {

}
export default Vue.extend({
	name: "WSDashboard",
	props: {
			dashboard: Object,
			connectionevent: Object
	},
	components: {
		Code,
		Konsole,
		Messages,
		SaveMessage,
		Variables
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
		// Split(['#messages-row', '#variables-row'], {
		//     sizes: [75, 25],
		//     gutterSize: 2,
		//     direction: "vertical",
		//     cursor: "row-resize"
		// });
	},
	data: function() {
		example[this.dashboard.environment.field] = "";
		return {
			sendContent: JSON.stringify(example, null, 2),
			receivedContent: JSON.stringify(null, null, 2),
			variables: "{}",
			selectedMessage: null
			// savedMessages: settings.load('messages_' + this.dashboard.environment.name, [])
		};
	},
	computed: {
		messages: function() {
			return this.dashboard.connection.messages;
		},
		savedMessages: function() {
			return settings.load('messages_' + this.dashboard.environment.name, []);
		}
	},
	methods: {
		send: function () {
			try {
				const message = JSON.parse(this.sendContent);
				if (message.$argos === 'sequence') {
					const sequence = new Sequence(this.dashboard, message);
					sequence.register(this.broadcast);
					try {
						sequence.executeOn(this.dashboard.connection);
					} catch (error) {
						sequence.clear(this.dashboard.connection);
						this.$refs.konsole.addLine({
							content: 'Sequence Failed',
							type: 'error'
						});
					}
				} else {
					try {
						const message = JSON.parse(this.sendContent);
						const envVariables = this.dashboard.environment.variables;
						const objEnvVariables = envVariables ? JSON.parse(envVariables) : {};
						this.dashboard.connection.sendMessage(Interpolator.interpolate(message, Object.assign(objEnvVariables, this.dashboard.context)));
					} catch (err) {
						this.$refs.konsole.addLine({
								content: `Failed to send message ${err.message}`,
								type: "error"
						});  
					}
				}
			} catch (err) {
				this.$refs.konsole.addLine({
					content: `Failed to send message ${err.message}`,
					type: "error"
				});  
			}
		},
		resend: function () {
			try {
				const message = JSON.parse(this.receivedContent);
				const envVariables = this.dashboard.environment.variables;
				const objEnvVariables = envVariables ? JSON.parse(envVariables) : {};
				this.dashboard.connection.sendMessage(Interpolator.interpolate(message, Object.assign(objEnvVariables, this.dashboard.context)));
			} catch (err) {
				this.$refs.konsole.addLine({
					content: `Failed to send message ${err.message}`,
					type: "error"
				});               
			}
		},
		updateSendContent: function (value) {
			this.sendContent = value
		},
		updateReceivedContent: function (value) {
			this.receivedContent = value
		},
		deleteMessage: function (index) {
			this.dashboard.connection.messages.splice(index, 1);
		},
		selectMessage: function (message, to) {
			this.selectedMessage = message
			this.receivedContent = message.data
		},
		saveMessage: function (message) {
			this.savedMessages.unshift(message)
				settings.save('messages_' + this.dashboard.environment.name, this.savedMessages)
				this.$refs.konsole.addLine({
				content: `message ${message.savedAs} saved to dashboard ${this.dashboard.environment.name}`,
				type: 'default'
			})
		},
		selectSavedMessage: function (message) {
			this.sendContent = message.data;
		},
		broadcast: function(sequence, errorMessage) {
			if (errorMessage) {
				this.$refs.konsole.addLine({
					content: `✖ ${errorMessage}`,
					type: 'error'
				});
			}
			const report = sequence.getReport();

			report.steps.forEach((report) => {
				report.verifications.forEach((verification) => {
					this.$refs.konsole.addLine({
						content: `✔ ${verification.description}`,
						type: 'ok',
						indent: true
					});
				});

				const symbol = report.passed ? '✔' : '✖';
				this.$refs.konsole.addLine({
					content: `${symbol} ${report.message} - ${report.description}`,
					type: report.passed ? 'ok' : 'error'
				});
			});

			const symbol = errorMessage ? '✖' : '✔';
			this.$refs.konsole.addLine({
				content: `${symbol} ${report.description}`,
				type: errorMessage ? 'error' : 'ok'
			});
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
	},
	watch: {
		messages: function () {
			const last = (this.messages.length ? this.messages[0] : null)

			if (last && last.direction === Message.Type.IN) {
				this.selectedMessage = last;
				this.receivedContent = last.data;
			}
		},
		connectionevent: function(newVal) {
			if (newVal && newVal.content && newVal.type) {
				this.$refs.konsole.addLine(newVal);
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
</style>