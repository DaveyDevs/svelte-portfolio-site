<script>
    import { tags, projects, selectedTags } from "../stores.js";
    
    let displayedTags = "";
    
        const select = (e) => {
            // Look through tags and set selected if it's checked 
            if (e.target.checked) {
                for (let tag of $tags) {
                    if (e.target.id === tag.name) {
                        tag.selected = true;
                    } 
                }
            } else {
                for (let tag of $tags) {
                    if (e.target.id === tag.name) {
                        tag.selected = false;
                    }
                }
            }
    
            $tags = $tags;
    
            // Filter to a selected tags object
            $selectedTags = $tags.filter(tag => tag.selected).map(tag => tag.name);
    
            // Show or hide project based on the above results.
    
            for (let project of $projects) {
                if ($selectedTags.every(tag => project.tags.join(" ").includes(tag))) {
                    project.selected = true;
                } else {
                    project.selected = false;
                }
            }
    
            $projects = $projects;
    
            displayedTags = `Listing projects that use: ${$selectedTags.join(", ")}`;
        }
    </script>
    
    <style type="text/scss">
    ul {
        list-style-type: none;
        padding: 0;
    
        li {
            margin-bottom: .5rem;
        }
    }
    
    .projects__image-and-description  p{
        margin-right: 2rem;
    }
    
        // The tags listed under each project
    .tags-container__tags {
        width: 100%;
    
        span {
                border-top: 0.15rem solid var(--secondary);
                border-bottom: 0.15rem solid var(--secondary);
                // border-radius: 10px;
                display: inline-block;
                margin: .5em;
                padding: 0.2rem;
                white-space: nowrap;
        }
    }
    
    // Tags to select for each project
    legend {
        font-size: var(--p);
        margin-bottom: .5em;
    }
    
    label {
        font-size: var(--p);
    }
    
    .tags-group__checkboxes {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        width: 75vw;
    }
    
    .tags-group__checkbox {
        margin-top: 1rem;
    }
    
    // Hides the original checkbox
    .tags-group__checkbox input[type="checkbox"] {
        opacity: 0;
    }
    
    .tags-group__checkbox label {
        position: relative;
        display: inline-block;
    }
    
    /*Outer box of the fake checkbox*/
    
    .tags-group__checkbox label::before{
        content: "";
        display: inline-block;
    
    
        height: 110%;
        width: 100%;
        
        // transform: translateX(-1rem);
    
        border-bottom: 0.15rem solid var(--secondary);
        // border-radius: 10px;
        // padding: 0.2rem 1.5rem;
        white-space: nowrap;
        position: absolute;
    
        
        /*(24px line-height - 16px height of fake checkbox) / 2 - 1px for the border
         *to vertically center it.
         */
        // top: .2em;
    }
    
    .tags-group__checkbox input[type="checkbox"]:checked + label::before {
        border-top: 0.15rem solid var(--primary);
        border-bottom: 0.15rem solid var(--primary);    
        content: "";
    }
    
    /*Adding focus styles on the outer-box of the fake checkbox*/
    .tags-group__checkbox input[type="checkbox"]:focus + label::before,
    .tags-group__checkbox input[type="checkbox"]:hover + label::before {
        cursor: pointer;
        outline: var(--primary) 0.15rem solid;
    }
    
    @media only screen and (max-width: 750px) {
        .image-container {
            width: 100%;
        }
    }
    
    </style>
    
    <div class="container projects" id="main">
        <h2>Projects</h2>
        <h3>(Both Personal and Volunteer)</h3>
        <div class=" container projects__tags">
            <fieldset class="tags-group">
                <legend>Select one or more tags below to filter the projects by the tech and tools used:</legend>
                <hr />
                <div class="tags-group__checkboxes">
                    {#each $tags as tag}
                        <div class="tags-group__checkbox">
                            <input id={tag.name} type="checkbox" on:click={select} bind:checked={tag.selected}>
                            <label for={tag.name}>{tag.name}</label>
                        </div>
                    {/each}
                </div>
                <hr />
            </fieldset>
        </div>
            <ul>
                <p>{displayedTags}</p>
                {#each $projects as project}
                    {#if project.selected}
                        <li class="projects__project card">
                            <h3><a href="{project.link}">{project.name} ({project.type})</a></h3>
                            <div class=" projects__image-and-description">
                                <p>{project.description}</p>
                                <div class="image-container">
                                    <img
                                        class="intro__image"
                                        src={project.image}
                                        alt={`Screenshot from ${project.name} app front page`} 
                                    />
                                </div>
                            
                                
                        </div>
                            <p><a href={project.github}>{project.name} on GitHub</a></p>
                            <div class="projects__tags-container">
                                <p>This project uses:</p>
                                <div class="tags-container__tags">
                                    {#each project.tags as tag}
                                        <span>{tag}</span>
                                    {/each}
                                </div>
                            </div>
                        </li>
                    {/if}
                {/each}
            </ul>
        </div>
    