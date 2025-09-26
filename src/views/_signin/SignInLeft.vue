<template>
    <div class="left">
        <img src="@/assets/img/login-icon.png" alt="" />
    </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.left {
    // height: 100%;
    // width: 30rem;
    border-radius: 2rem 0 0 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    // background: linear-gradient(135deg, #0f4c75, #2492c2);
    background: linear-gradient(135deg, #2492c2, #6acbe0);
    // background: linear-gradient(135deg, #0f4c75, #6acbe0);
    // background: linear-gradient(135deg, #2492c2e6, #6acbe0b3);
    // backdrop-filter: blur(3px);
    // -webkit-backdrop-filter: blur(3px);

    img {
        max-width: 80%;
    }
}
</style>
