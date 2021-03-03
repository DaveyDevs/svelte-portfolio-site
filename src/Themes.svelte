<script>
    // Transitions
    import { fade } from "svelte/transition";

    import { chosenTheme } from "./stores.js";

    let show = false;
    let showThemesText = "Press here to change theme";

    let themes = [
        {
            id: 1,
            name: "default",
            text: "#1b2d45",
            background: "#fffffe",
            primary: "#00ebc7",
        },
        {
            id: 2,
            name: "dark",
            text: "#fffffe",
            background: "#1b2d45",
            primary: "#00214d",
        },
        {
            id: 3,
            name: "oled",
            text: "#fffffe",
            background: "#000",
            primary: "#00ebc7",
        },
        {
            id: 4,
            name: "purple",
            text: "#010101",
            background: " #7f5af0",
            primary: "#2cb67d",
        },
        {
            id: 5,
            name: "burnt",
            text: "#fffffe",
            background: "#000",
            primary: "#ff8906",
        },
        {
            id: 6,
            name: "greyed",
            text: "#020826",
            background: "#f9f4ef",
            primary: "#716040",
        },
    ];

    const showThemes = () => {
        show = !show;
        showThemesText = "Press here to change theme";

        if (show) {
            showThemesText = "Hide themes";
        }
    };

    const changeTheme = (theme) => {
        $chosenTheme = theme.target.innerText;
        localStorage.setItem("storedTheme", $chosenTheme);
    };
</script>

<style>
</style>

<p>This site has a variety of themes.</p>
<p>
    Current theme:
    <span
        class="showCurrentTheme">{$chosenTheme ? $chosenTheme : 'default'}</span>
</p>
<div class="container">
    <button on:click={showThemes}>{showThemesText}</button>
    {#if show}
        <div transition:fade>
            {#each themes as theme}
                <button
                    class="theme-button"
                    on:click={changeTheme}
                    style="background: {theme.background}; color: {theme.text}; border: .2rem dashed {theme.primary}">{theme.name}</button>
            {/each}
        </div>
    {/if}
</div>
