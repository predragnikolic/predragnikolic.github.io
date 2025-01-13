customElements.define(
  "x-graph",
  class extends HTMLElement {
    constructor() {
      super();
      const num = Number.parseInt(this.getAttribute("numbers"), 10) || 1;
      this.attachShadow({ mode: "open" }).innerHTML = `
      <style>
        :host {
        --width: var(--size, '480px');
        --num: ${num};
        width: var(--width);
        min-width: var(--width);
        max-width: 100%;
      }
      .graph {
        --cell-size: calc(var(--size, 80vh) / var(--num) * 5);
        width: var(--cell-size);
        height: var(--cell-size);
        background: transparent;
        position: relative;
        float: left;
      }
      .graph:after {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        border-radius: var(--corner, '100% 0 0 0');
        background: var(--color, #00000);
      }
      </style>
      <div id="hello" style="height: 100%;">
         ${'<div class="graph"></div>'.repeat(num)}
      </div>
    `;
      const helloEl = this.shadowRoot.querySelector("#hello");
      helloEl.addEventListener("click", () => {
        const height = helloEl.getBoundingClientRect().height;
        helloEl.style.height = `${height}px`;
        shuffleChildrenWithFlip(helloEl);
      });
    }
    _random(array) {
      return array[Math.floor(Math.random() * array.length)];
    }
    connectedCallback() {
      this.doTheThing();
    }

    doTheThing() {
      const graphs = this.shadowRoot.querySelectorAll(".graph");
      const colorSet = [
        [
          "rgb(254, 233, 166)",
          "rgb(254, 192, 171)",
          "rgb(102, 8, 96)",
          "rgb(250, 88, 148)",
          "rgb(147, 128, 183)",
          "transparent",
        ],
        [
          "rgb(142, 151, 141)",
          "rgb(151, 196, 173)",
          "rgb(191, 237, 190)",
          "rgb(230, 252, 217)",
          "rgb(205, 242, 214)",
          "transparent",
        ],
        [
          "rgb(190, 206, 196)",
          "rgb(104, 138, 124)",
          "rgb(157, 124, 91)",
          "rgb(227, 82, 65)",
          "rgb(228, 145, 131)",
          "transparent",
        ],
        [
          "rgb(132, 191, 195)",
          "rgb(255, 245, 214)",
          "rgb(255, 184, 112)",
          "rgb(217, 97, 83)",
          "rgb(0, 5, 17)",
          "transparent",
        ],
      ];
      [].forEach.call(graphs, (g) => {
        g.style.setProperty("--color", this._random(this._random(colorSet)));
        g.style.filter = "grayscale(0.5)";
        g.style.setProperty(
          "--corner",
          this._random([
            // "100% 0 0 %100",
            "0 100% 0 0",
            "0 0 100% 0",
            "0 0 0 100%",
          ]),
        );
      });
    }
  },
);

let isAnimating = false;
let animations = [];
function shuffleChildrenWithFlip(el) {
  const children = Array.from(el.children);
  const originalPositions = children.map((child, index) => ({
    child,
    originalIndex: index,
  }));

  // Shuffle children
  const shuffledChildren = shuffleArray(children);

  // Get initial positions of shuffled children
  const initialPositions = shuffledChildren.map((child) => {
    const rect = child.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  });

  const finalPositions = originalPositions.map((item) => {
    const rect = item.child.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  });

  if (isAnimating) {
    return;
  }

  isAnimating = true;

  // Apply initial styles to shuffled children
  shuffledChildren.forEach((child, index) => {
    child.style.position = "fixed";
    child.style.left = `${initialPositions[index].left}px`;
    child.style.top = `${initialPositions[index].top}px`;
    child.style.width = `${initialPositions[index].width}px`;
    child.style.height = `${initialPositions[index].height}px`;
  });

  // Append shuffled children to parent
  el.innerHTML = "";
  shuffledChildren.forEach((child) => el.appendChild(child));

  // Calculate and store original container height
  const originalContainerHeight = el.offsetHeight;

  // Create and store animations
  animations = shuffledChildren.map((child, index) => {
    const keyframes = [
      { transform: `translate(0, 0)` },
      {
        transform: `translate(${finalPositions[index].left - initialPositions[index].left}px, ${finalPositions[index].top - initialPositions[index].top}px)`,
      },
    ];

    const timing = {
      duration: 400,
      easing: "ease",
    };

    const animation = child.animate(keyframes, timing);

    animation.onfinish = () => {
      // Remove styles after animation
      child.style.position = "";
      child.style.left = "";
      child.style.top = "";
      child.style.width = "";
      child.style.height = "";
      child.style.transform = "";

      // Check if all animations have finished
      if (animations.every((animation) => animation.finished)) {
        el.style.height = `${originalContainerHeight}px`;
        isAnimating = false;
        animations = [];
      }
    };

    return animation;
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
