<script>
	import { Router, Route } from "svelte-routing";
	import { chosenTheme } from "./stores.js";

	import Header from "./Header.svelte";
	import Footer from "./Footer.svelte";
	import Home from "./pages/Home.svelte";
	import About from "./pages/About.svelte";
	import Projects from "./pages/Projects.svelte";
	import Contact from "./pages/Contact.svelte";
	import Kitchen from "./pages/Kitchen.svelte";

	export let url = ""; //This property is necessary declare to avoid ignore the Router

	const storedTheme = localStorage.getItem("storedTheme");
</script>

<!-- Theme classes go here -->
<body class={$chosenTheme}>
	<Router {url}>
		<Header />
		<!-- This div holds the pages -->
		<main class="layout">
			<Route path="about" component={About} />
			<Route path="projects" component={Projects} />
			<Route path="contact" component={Contact} />
			<Route path="kitchen" component={Kitchen} />

			<!--for now the router just support case sensitive,
		   one workaround colud be add two time the route
		   Example.
		  <Route path="About" component="{About}" /> 
	   -->
			<Route path="/">
				<Home />
			</Route>
		</main>
		<Footer />
	</Router>
</body>
