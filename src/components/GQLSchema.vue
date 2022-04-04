<template lang="html">
  <div class="gql-schema">
    <v-card elevation="3" outlined v-if="!gqlSchema">
      GraphQl Schema Not Loaded
    </v-card>
    <v-card elevation="3" outlined v-if="gqlSchema">
      <v-row>
        <v-col>
          <v-btn
            v-on:click="back"
            icon
            :disable="!history.length"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-list two-line v-if="selectedNode === gqlSchema">
        <v-list-item two-line @click="select(gqlSchema._queryType)">
          <v-list-item-content>
            <v-list-item-title>{{gqlSchema._queryType.name}}</v-list-item-title>
            <v-list-item-subtitle>{{gqlSchema._queryType.description}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item two-line @click="select(gqlSchema._mutationType)">
          <v-list-item-content>
            <v-list-item-title>{{gqlSchema._mutationType.name}}</v-list-item-title>
            <v-list-item-subtitle>{{gqlSchema._mutationType.description}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-list three-line v-if="selectedNode !== gqlSchema && selectedNode._fields">
        <v-list-item three-line
          v-for="(field, index) in selectedNode._fields"
          :key="index" @click="select(field)">
          <v-list-item-content>
            <v-list-item-title>{{fieldName(field)}}</v-list-item-title>
            <v-list-item-subtitle>{{field.description}}</v-list-item-subtitle>
            <v-list-item-subtitle>returns: {{returnFor(field)}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-list three-line v-if="selectedNode !== gqlSchema && !selectedNode._fields && selectedNode.type && selectedNode.type._fields">
        <v-list-item three-line
          v-for="(field, index) in selectedNode.type._fields"
          :key="index" @click="select(field)">
          <v-list-item-content>
            <v-list-item-title>{{fieldName(field)}}</v-list-item-title>
            <v-list-item-subtitle>{{field.description}}</v-list-item-subtitle>
            <v-list-item-subtitle>returns: {{returnFor(field)}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-list three-line v-if="selectedNode !== gqlSchema && !selectedNode._fields && selectedNode.type && !selectedNode.type._fields && selectedNode.type.ofType">
        <v-list-item three-line
          v-for="(field, index) in selectedNode.type.ofType._fields"
          :key="index" @click="select(field)">
          <v-list-item-content>
            <v-list-item-title>{{fieldName(field)}}</v-list-item-title>
            <v-list-item-subtitle>{{field.description}}</v-list-item-subtitle>
            <v-list-item-subtitle>returns: {{returnFor(field)}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script>
import { GraphQLSchema } from 'graphql'

export default {
  name: 'GQLSchema',
  props: {
    schema: GraphQLSchema
  },
  data: function() {
    return {
      selectedNode: this.gqlSchema,
      history: []
    }
  },
  computed: {
    gqlSchema: function() {
      return this.schema;
    }
  },
  methods: {
    select: function(node) {
      // do not select the field when
      if ((!node._fields && !node.type) 
        || (!node._fields && !node.type._fields && !node.type.ofType)
        || (!node._fields && !node.type._fields && !node.type.ofType._fields)) {
        return;
      }
      this.history.push(this.selectedNode);
      this.selectedNode = node;
    },
    back: function() {
      this.selectedNode = this.history.pop();
    },
    fieldName: function(field) {
      let n = '';
      n = field.name
      let args = '';
      if (field.args.length) {
        args = `(${field.args.map((arg) => {
          return `${arg.name}: ${arg.type.name}`
        }).reduce((accumulator, combiner) => {
          return `${accumulator}, ${combiner}`
        })})`;
      }
      n = n + args;
      return n;
    },
    returnFor: function(field) {
      if (field.type.name) {
        return field.type.name;
      } else if (field.type.ofType.name) {
        return field.type.ofType.name;
      }

      return 'unknown';
    }
  },
  watch: {
    schema: function (newVal) {
      // when the schema is reloaded:
      // update the selected node
      this.selectedNode = newVal;
      // clear the history
      this.history = []
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
