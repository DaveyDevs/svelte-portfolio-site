<script>
    import { Link } from "svelte-routing";
</script>

<style type="text/scss">
.skip-to-content-link {
  color: var(--textColor);
  left: 50%;
  padding: 1em;
  position: absolute;
  transform: translateY(-100%);
  z-index: 999;
}
</style>

<header>
    <a class="skip-to-content-link" href='#main'>Skip to content</a>
    <!-- Navigation-->
    <div class="header-nav">
        <div class="logo">
            <Link to="/">DaveyDevs</Link>
        </div>
    
        <nav>
            <Link to="/">Home</Link>
            <Link to="about">About</Link>
            <Link to="projects">Projects</Link>
            <Link to="contact">Contact</Link>
            <!-- <Link to="kitchen">Kitchen Sink</Link> -->
        </nav>
    </div>
</header>
