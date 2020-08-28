<template>
  <transition name="modal" appear>
    <div class="modal modal-overlay" @click.self="$emit('close')">
      <div class="modal-window">
        <div class="modal-content">
          <slot></slot>
        </div>
        <footer class="modal-footer">
          <slot name="footer">
            <button @click="$emit('close')">close</button>
          </slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.modal {
  &.modal-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 30;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  &-window {
    background: #ffffff;
    border-radius: 4px;
    overflow: hidden;
    margin: 0 20%;
    width: 100%;
    max-width: 450px;
    padding-top: 25px;
  }

  &-content {
    padding: 10px 20px;
  }

  &-footer {
    background: #ccc;
    padding: 10px;
    text-align: right;
    margin-top: 25px;
  }
}

// オーバーレイのトランジション
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.4s;

  // オーバーレイに包含されているモーダルウィンドウのトランジション
  // translateYの初期値は0px
  .modal-window {
    transition: opacity 0.4s, transform 0.4s;
  }
}

// ディレイをつけるとモーダルウィンドウが消えた後にオーバーレイが消える
// .modal-leave-active {
//   transition: opacity 0.6s ease 0.4s;
// }

.modal-enter, .modal-leave-to {
  opacity: 0;

  .modal-window {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>