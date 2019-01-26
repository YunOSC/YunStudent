<template>
  <nav class="navbar navbar-expand-lg navbar-light">
    <a class="navbar-brand" href="#">YunWorker</a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbatNav" aria-expanded="false" aria-label="Toggle navgaton">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <div class="navbar-nav">
        <router-link to="/" class="nav-item nav-link">Dashboard</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'navigator'
}
</script>

