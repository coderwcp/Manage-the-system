export default {
  methods: {
    checkPermission(key) {
      try {
        return this.$store.state.user.userInfo.roles.points.includes(key)
      } catch (err) {
        console.log(err)
        return false
      }
    }
  }
}
