import confetti from "canvas-confetti";

const SPEED = 8;
const TIME_TO_DETECT_BOUNCE = 25;
const TIME_TO_ENABLE_SCREENSAVER = 5000;
const HDIRECTIONS = ["right", "left"];
const VDIRECTIONS = ["down", "up"];
const COLORS = [
  "#0d8513",
  "#2900c6",
  "#c400f0",
  "#3a3a3a",
  "#979c0a",
  "#b6680f",
  "#a80204"
];

const partySound = new Audio("win.mp3");
const parkourSound = new Audio("parkour.mp3");

export const startIdleScreenSaver = () => {
  let timer;
  const dvdScreenSaver = document.createElement("dvd-screen-saver");

  document.addEventListener("click", () => resetIdle());
  document.addEventListener("keydown", () => resetIdle());
  document.addEventListener("mousemove", () => resetIdle());

  const startIdle = () => {
    timer = setTimeout(() => {
      document.body.appendChild(dvdScreenSaver);
    }, TIME_TO_ENABLE_SCREENSAVER);
  };

  const resetIdle = () => {
    clearTimeout(timer);
    dvdScreenSaver.isConnected && dvdScreenSaver.destroy();
    startIdle();
  };

  startIdle();
};

class DVDScreenSaver extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  init() {
    this.lastBounce = -50;
    this.setScreen();
    this.width = 200;
    this.height = 175;
    this.setRandomPosition();
    this.currentColorIndex = 0;
    this.currentDirection = {
      h: "right",
      v: "down"
    };

    this.style.setProperty("--width", `${this.width}px`);
    this.style.setProperty("--height", `${this.height}px`);

    document.body.style = "overflow: hidden;";
  }

  get isOverlapRight() {
    return this.x + this.width > this.maxWidth;
  }

  get isOverlapLeft() {
    return this.x < 0;
  }

  get isOverlapUp() {
    return this.y < 0;
  }

  get isOverlapDown() {
    return this.y + this.height > this.maxHeight;
  }

  setRandomPosition() {
    this.x = Math.floor(Math.random() * (this.maxWidth - this.width));
    this.y = Math.floor(Math.random() * (this.maxHeight - this.height));
    this.updateItem();
  }

  static get styles() {
    return /* css */`
      :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        background: #000e;
        width: 100vw;
        height: 100vh;
      }

      .item {
        width: var(--width);
        height: var(--height);
        background: var(--color, #a80204);
        display: flex;
        justify-content: center;
        align-items: center;
        image-rendering: pixelated;
        box-sizing: border-box;
        transform: translate(var(--x), var(--y));
      }

      .michael {
        --pos-x: calc(25% - calc(var(--width) / 2));

        position: absolute;
        left: var(--pos-x);
        bottom: 0;
        max-width: 100%;
        filter:
          drop-shadow(0 0 5px #fff)
          drop-shadow(0 0 10px #fff);
        transform: translateY(100%);
        transition: transform 0.5s;
      }

      .michael.show {
        transform: translateY(0%);
      }
    `;
  }

  connectedCallback() {
    this.init();
    this.render();

    window.addEventListener("resize", () => this.setScreen());
    this.timer = setTimeout(() => this.update(), 30);
  }

  checkBounds() {
    if (this.isOverlapRight || this.isOverlapLeft) {
      this.onBounce();
      this.currentDirection.h = HDIRECTIONS.filter(dir => dir !== this.currentDirection.h)[0];
    }
    if (this.isOverlapUp || this.isOverlapDown) {
      this.onBounce();
      this.currentDirection.v = VDIRECTIONS.filter(dir => dir !== this.currentDirection.v)[0];
    }
  }

  setScreen() {
    this.maxWidth = window.innerWidth;
    this.maxHeight = window.innerHeight;

    if (this.isOverlapDown || this.isOverlapUp || this.isOverlapRight || this.isOverlapLeft) {
      this.setRandomPosition();
    }
  }

  confetti() {
    confetti({
      particleCount: 500,
      angle: 90,
      spread: 360,
      origin: {
        x: 0.5,
        y: 0.5
      }
    });
    partySound.currentTime = 0;
    partySound.play();
  }

  onBounce() {
    this.currentColorIndex = (this.currentColorIndex + 1) % COLORS.length;
    this.style.setProperty("--color", COLORS[this.currentColorIndex]);

    const newBounce = new Date().getTime();
    const isConsecutiveBounce = newBounce - this.lastBounce < TIME_TO_DETECT_BOUNCE;
    isConsecutiveBounce && this.onCornerBounce();
    this.lastBounce = new Date().getTime();
  }

  onCornerBounce() {
    this.confetti();
    this.showMichaelScott();
  }

  showMichaelScott() {
    const michael = this.shadowRoot.querySelector(".michael");
    michael.classList.add("show");

    const parkourPlay = () => {
      parkourSound.currentTime = 0;
      parkourSound.play();
    };

    setTimeout(() => parkourPlay(), 500);
    setTimeout(() => (michael.classList.remove("show")), 1500);
  }

  move() {
    if (this.currentDirection.h === "right") {
      this.x += SPEED;
    } else if (this.currentDirection.h === "left") {
      this.x -= SPEED;
    }

    if (this.currentDirection.v === "down") {
      this.y += SPEED;
    } else if (this.currentDirection.v === "up") {
      this.y -= SPEED;
    }
  }

  updateItem() {
    this.style.setProperty("--x", `${this.x}px`);
    this.style.setProperty("--y", `${this.y}px`);
  }

  update() {
    this.move();
    this.checkBounds();
    this.updateItem();

    this.timer = setTimeout(() => this.update(), 30);
  }

  destroy() {
    document.body.style = "overflow: auto;";
    clearTimeout(this.timer);
    this.remove();
  }

  render() {
    this.shadowRoot.innerHTML = /* html */`
    <style>${DVDScreenSaver.styles}</style>
    <div class="item">
      <img src="manzdvd.gif" alt="DVD item">
    </div>
    <img class="michael" src="michael-scott.png" alt="Michael Scott">
    `;
  }
}

customElements.define("dvd-screen-saver", DVDScreenSaver);
