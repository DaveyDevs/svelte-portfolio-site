<script>
    import { Link } from "svelte-routing";

    import Themes from "./Themes.svelte";
</script>

<style type="text/scss">
    .creds {
        margin-top: 3em;
    }
</style>

<footer>
    <hr />
    <Themes />
    <nav>
        <Link to="/">Home</Link>
        <Link to="about">About</Link>
        <Link to="projects">Projects</Link>
        <Link to="contact">Contact</Link>
        <!-- <Link to="kitchen">Kitchen Sink</Link> -->

        <div class="creds">
        <p>Copyright (c) 2021 DaveyDevs</p>
        <a href="https://opensource.org/licenses/MIT">MIT License</a>
        </div>
    </nav>
</footer>
