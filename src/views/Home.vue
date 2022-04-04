<template>
  <div class="home">
    <Connection />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Connection from "../components/Connection.vue";

export default Vue.extend({
  name: "Home",
  components: {
    Connection
  }
});
</script>
