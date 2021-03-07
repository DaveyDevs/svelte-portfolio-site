<script>
    import { Link } from "svelte-routing";    
    let pageName = "About Me";
</script>

<div class="container" id="main">
    <h2>{pageName}</h2>
    <h3>My name is Davey Anians and I am an association professional currently transitioning into web development.</h3>
    <p>I'm a member of <a href="https://komcreative.com/">Kom Creative</a> and volunteer with <a href="https://codeforchicago.org/">Code for Chicago</a>, <a href="https://chihacknight.org/">Chi Hack Night</a>, and the <a href="https://www.chicommons.coop/">Chi Commons Cooperative</a>. Born and raised in the Chicago area, I spend my free time immersed in the local music scene and performing and organizing shows both at home and throughout the US.</p>
    <p>I truly enjoy coding and problem solving, especially using JavaScript and frameworks like <span class="highlight">React</span> and <span class="highlight">Svelte</span>. I also have experience building and developing sites with <span class="highlight">WordPress</span>.</p>
    <p>Check out some of my projects <Link to="projects">here</Link> and please feel free to <Link to="contact">reach out</Link> and learn more about what I've been up to!</p>
    <h3>What do I mean by accessibility and user-conscious design?</h3>
    <p>I do my best to continue learning ways to help create an <span class="highlight">inclusive</span>, <span class="highlight">accessible</span>, and <span class="highlight">secure web</span>. To me, being user-conscious means paying attention to how different users may experience my sites differently and that device and internet limitations means thinking about resiliency and responsiveness when making decisions on what tools and techniques to use.</p>
    <p>While accessibility should never be just a list to check off, I try to make sure that all sites I work on pay attention to the basic <a href="https://www.w3.org/WAI/standards-guidelines/wcag/">WCAG guidelines</a> and incorporate semantic HTML, color contrast, keyboard use, tab order, focus styles, image descriptions, and more.</p>
</div>
