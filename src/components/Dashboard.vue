<template lang="html">
  <div class="workspace">
    <div v-if="dashboard.environment.environmentType === type.WEB_SOCKET">
      <!-- if type ws display ws-dashboard -->
      <WSDashboard :dashboard="dashboard" :connectionevent="connectionevent"/>
    </div>
    <div v-if="dashboard.environment.environmentType === type.GQL">
      <!-- if graphql type display graphql dashboard -->
      <GQLDashboard :dashboard="dashboard"/>
    </div>
  </div>
</template>

<script>
import Env from '@/data/Environment'
import WSDashboard from '@/components/WSDashboard.vue'
import GQLDashboard from '@/components/GQLDashboard.vue'
// import { graphQl } from '@/utils/GraphQl.js'

export default {
  name: 'Dashboard',
  components: {
    WSDashboard,
    GQLDashboard
  },
  props: {
    dashboard: Object,
		connectionevent: Object
  },
  data: function () {
    return {
      type: Env.Type,
      token: ''
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
