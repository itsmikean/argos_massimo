<template>
	<div class="konsole">
		<v-row class="konsole-header">
			<v-tooltip left>
				<template v-slot:activator="{ on, attrs }">
					<v-btn icon x-small 
							@click="clearKonsole"                 
							v-bind="attrs"
							v-on="on">
							<v-icon>mdi-backspace</v-icon>
					</v-btn>
				</template>
				<span>clear console</span>
			</v-tooltip>
		</v-row>
		<v-card
				elevation="5"
				class="konsole-inner"
				>
			<v-row>
				<v-card-text v-for="(line, index) in lines" v-bind:key="index" style="font-size:12px; padding: 1px 7px; line-height:15px;" v-bind:style="{ color: line.color }">
					<b> </b> <span v-html="line.content"></span><br />
				</v-card-text>
			</v-row>
		</v-card>
	</div>
</template>

<script>
import Vue from "vue";
const colors = {
	error: "#ef6363",
	ok: "#6ad86a",
	default: "inherit"
};

export default Vue.extend({
	name: "Konsole",
	data: () => ({
		lines: [{content: 'Sequence console ready.', color: 'inherit'}]
	}),
	methods: {
		addLine: function(line) {
			if (this.lines.length > 50) {
				this.lines.shift();
			}

			const content = line.indent ? `&nbsp;&nbsp;${line.content}` : line.content;
			this.lines.unshift({
				content: content,
				color: colors[line.type] ? colors[line.type] : colors.default
			});
		},
		clearKonsole: function() {
			this.lines = [];
		}
	}
});
</script>
<style lang="scss">
.konsole {
	font-family: monospace;
}

.konsole-inner {
	height:180px;
	padding: 8px 15px 8px 15px;
	overflow-y:auto;
}

.konsole-header {
	padding: 0px 11px 4px 11px;
	display: flex; 
	justify-content: flex-end;
}
</style>