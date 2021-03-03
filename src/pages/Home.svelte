<script>
</script>

<style type="text/scss">
    .intro {
        &__header {
            font-size: var(--h3);
            margin: auto 3rem auto auto;
        }
    }

    @media only screen and (max-width: 750px) {
        .intro {
            margin-top: 2rem;
        }

        .intro__image-container {
            margin: 1rem auto auto auto;
            width: 85vw;
        }
    }
</style>

<div class="container flex intro" id="main">
    <h2 class="intro__header">
        Front-end web development with an emphasis on
        <span class="highlight">accessibility</span>
        and <span class="highlight">user-conscious design</span>.
    </h2>
    <div class="image-container intro__image-container">
        <img
            class="intro__image"
            src="/images/me.jpg"
            alt="Davey facing the camera and standing on an above-ground train platform at night." />
    </div>
</div>
