<script>
  import { Router, Route } from 'svelte-routing';
  import Navbar from './components/Navbar.svelte';
  import Footer from './components/Footer.svelte';
  import Home from './pages/Home.svelte';
  import About from './pages/About.svelte';
  import Facilities from './pages/Facilities.svelte';
  import Teachers from './pages/Teachers.svelte';
  import Media from './pages/Media.svelte';
  import Notices from './pages/Notices.svelte';
  import Contact from './pages/Contact.svelte';
  import Login from './pages/Login.svelte';
  import Register from './pages/Register.svelte';
  import Admin from './pages/Admin.svelte';
  import Dashboard from './pages/Dashboard.svelte';

  export let url = "";
</script>

<Router {url}>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <Navbar />

    <main class="flex-grow">
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/facilities" component={Facilities} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/media" component={Media} />
      <Route path="/notices" component={Notices} />
      <Route path="/contact" component={Contact} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin" component={Admin} />
      <Route path="/dashboard" component={Dashboard} />
    </main>

    <Footer />
  </div>
</Router>
