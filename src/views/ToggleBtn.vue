<template>
  <div>
    <input type="checkbox" v-model="toggleValue" @change="onChange"/>
    <label>{{ label }}</label>
  </div>
  <!-- <div>
    <toggle-button v-model="toggleValue"></toggle-button>
  </div> -->

    <!-- <div>
    <v-switch v-model="toggleValue" />
    </div> -->
</template>


<script>
export default {
  props: {
    label: {
      type: String,
      default: 'Toggle'
    }
  },
  data() {
    return {
      toggleValue: false
    }
  },
  methods: {
    onChange() {
      this.$emit('update:value', this.toggleValue)
    }
  }
}
</script>
