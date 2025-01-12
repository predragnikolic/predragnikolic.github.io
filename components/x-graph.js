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
      ${'<div class="graph"></div>'.repeat(num)}
    `;
    }
    _random(array) {
      return array[Math.floor(Math.random() * array.length)];
    }
    connectedCallback() {
      const graphs = this.shadowRoot.querySelectorAll(".graph");
      const colorSet = [
        [
          'rgb(254, 233, 166)',
          'rgb(254, 192, 171)',
          'rgb(102, 8, 96)',
          'rgb(250, 88, 148)',
          'rgb(147, 128, 183)',
          'transparent'

        ],
        [
        'rgb(142, 151, 141)',
        'rgb(151, 196, 173)',
        'rgb(191, 237, 190)',
        'rgb(230, 252, 217)',
        'rgb(205, 242, 214)',
        'transparent'

      ],
      [
        'rgb(190, 206, 196)',
        'rgb(104, 138, 124)',
        'rgb(157, 124, 91)',
        'rgb(227, 82, 65)',
        'rgb(228, 145, 131)',
        'transparent'

      ],
      [
        'rgb(132, 191, 195)',
        'rgb(255, 245, 214)',
        'rgb(255, 184, 112)',
        'rgb(217, 97, 83)',
        'rgb(0, 5, 17)',
        'transparent'

      ]
      ];
      [].forEach.call(graphs, (g) => {
        g.style.setProperty(
          "--color",
          this._random(this._random(colorSet)),
        );
        g.style.filter = "grayscale(0.5)"
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
)
