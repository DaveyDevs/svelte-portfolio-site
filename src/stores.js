import { readable, writable } from 'svelte/store';

export const chosenTheme = writable(localStorage.getItem("storedTheme"));

export const tags = writable([
    {
        id: 1,
        name: "React",
        selected: false
    },
    {
        id: 2,
        name: "Svelte",
        selected: false
    },
    {
        id: 3,
        name: "JavaScript",
        selected: false
    },
    {
        id: 4,
        name: "HTML",
        selected: false
    },
    {
        id: 5,
        name: "WordPress",
        selected: false
    },
    {
        id: 6,
        name: "CSS",
        selected: false
    },
    {
        id: 7,
        name: "Sass",
        selected: false
    },
    {
        id: 8,
        name: "BEM",
        selected: false
    },
    {
        id: 9,
        name: "APIs",
        selected: false
    },
    {
        id: 10,
        name: "PHP",
        selected: false
    },
    {
        id: 11,
        name: "Jekyll",
        selected: false
    },
]);

export const selectedTags = writable([]);

export const projects = writable([
    {  
        id: 1,
        name: "Catan Pisco",
        type: "Professional",
        image: "../images/catan.jpg",
        description: "Working as a two person team with Kom Creative, this is a complete redesign and implementation of Catan Pisco's official website. The static site generator Jekyll was used to structure the HTML and CSS for this project.",
        link: "https://catanpisco.com/",
        github: "https://github.com/KomCreative/catanpisco.com",
        tags: ["Jekyll", "JavaScript", "HTML", "CSS", "Sass"],
        selected: true,
    },
    {  
        id: 2,
        name: "Dogs List",
        type: "Personal",
        image: "../images/dogslist.jpg",
        description: "A React and API project. The finished product is a list of dog breeds and details, all searchable by name.",
        link: "https://sad-clarke-953af3.netlify.app",
        github: "https://github.com/DaveyDevs/doglistreactapp",
        tags: ["React", "JavaScript", "HTML", "CSS", "BEM", "APIs"],
        selected: true,
    },
    {  
        id: 3,
        name: "Cannabis Equity Illinois",
        type: "Volunteer",
        image: "../images/ceic.jpg",
        description: "Part of a volunteer initiative with Code For Chicago, this WordPress project involves working directly with clients and a team of designers and developers using Slack, Docker, Figma and other tools. My main contribution has been implementing custom page templates from a Figma design and implementing the Advanced Custom Fields plugin for easier user editing.",
        link: "https://cannabisequityil.org/",
        github: "https://github.com/Code-For-Chicago/ceic_wordpress",
        tags: ["WordPress", "PHP", "HTML", "CSS", "Sass"],
        selected: true,
    },
    {
        id: 4,
        name: "Bookmarks",
        type: "Personal",
        image: "images/bookmarks.jpg",
        description: "Are your browser bookmark lists already too full? Using vanilla JavaScript and local storage, this is a simple and handy tool to save links you want to go back to a later time.",
        link: "https://daveydevs.github.io/bookmarks/",
        github: "https://github.com/DaveyDevs/bookmarks",
        tags: ["JavaScript", "HTML", "CSS"],
        selected: true,
    },
    {
        id: 5,
        name: "The Riverbank",
        type: "Personal",
        image: "../images/riverbank.jpg",
        description: "Trying to meet the need for organizing livestreaming shows in 2020, this WordPress site was used by a number of artists to promote their upcoming online concerts. It uses third party themes and plugins that were customized with CSS and PHP.",
        link: "https://diylivestreams.com/",
        github: "https://github.com/DaveyDevs/theriverbank",
        tags: ["WordPress", "PHP", "HTML", "CSS"],
        selected: true
    },
    {
        id: 6,
        name: "This site!",
        type: "Personal",
        image: "../images/daveydevs.jpg",
        description: "Meta! This site was built with Svelte, an exciting new JavaScript framework.",
        link: "https://daveydevs.com/",
        github: "https://github.com/DaveyDevs/svelte-portfolio-site",
        tags: ["Svelte", "JavaScript", "HTML", "CSS", "Sass", "BEM"],
        selected: true,
    },
])