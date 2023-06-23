// import { bariand } from "./modules/config.js";
import { preloadHandlebarsTemplates } from "./modules/bariand-templates.js";
import BariandActorSheet from "./modules/sheets/bariandActorSheet.js";
import BariandItemSheet from "./modules/sheets/bariandItemSheet.js";

const cells = {
  "00": {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "01",
  },
  "01": {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "11",
  },
  "03": {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "13",
  },
  "04": {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "03",
  },
  10: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "11",
  },
  11: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "12",
  },
  12: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "22",
  },
  13: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "12",
  },
  14: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "13",
  },
  21: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "22",
  },
  22: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "23",
  },
  23: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "33",
  },
  32: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "42",
  },
  33: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "32",
  },
  41: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "42",
  },
  42: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "43",
  },
  43: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "53",
  },
  44: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "43",
  },
  45: {
    fighter: "",
    rogue: "",
    mage: "",
    engineer: "",
    child: "44",
  },
  53: {
    fighter: "+1 roll Force",
    rogue: "",
    mage: "",
    engineer: "",
    child: "",
  },
};

Hooks.once("init", async function () {
  console.log("bariand - initialisation");

  CONFIG.cells = cells;

  CONFIG.Combat.initiative.formula = "1d20 + @attributes.dexterity.value";

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("bariand", BariandActorSheet, {
    types: ["personnage"],
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("bariand", BariandItemSheet, { makeDefault: true });

  CONFIG.Canvas.visionModes.intangibleEye = new VisionMode(
    {
      id: "intangibleEye",
      label: "Intangible Eye",
      canvas: {
        shader: ColorAdjustmentsSamplerShader,
        uniforms: {
          contrast: 0,
          saturation: -0.8,
          exposure: -0.65,
        },
      },
      lighting: {
        background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
        illumination: {
          visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED,
        },
        coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
      },
      vision: {
        darkness: { adaptive: false },
        defaults: {
          attenuation: 0,
          contrast: 0.4,
          saturation: -0.7,
          brightness: 1,
        },
      },
    },
    { animated: false },
    {}
  );

  CONFIG.specialStatusEffects.DEAF = "deaf";

  CONFIG.Canvas.detectionModes.hearing = new DetectionModeHearing({
    id: "hearing",
    label: "Hearing",
    walls: true,
    angle: false,
    type: DetectionMode.DETECTION_TYPES.SOUND,
  });
  CONFIG.Canvas.detectionModes.trueHearing = new DetectionModeTrueHearing({
    id: "trueHearing",
    label: "True Hearing",
    walls: false,
    angle: false,
    type: DetectionMode.DETECTION_TYPES.SOUND,
  });

  Token.prototype._onApplyStatusEffect = async function (statusId, active) {
    switch (statusId) {
      case CONFIG.specialStatusEffects.INVISIBLE:
        canvas.perception.update({ refreshVision: true });
        this.renderFlags.set({ refreshMesh: true, refreshShader: true });
        break;
      case CONFIG.specialStatusEffects.BLIND:
        this.updateVisionSource();
        canvas.perception.update({ initializeVision: true });
        break;
      case CONFIG.specialStatusEffects.DEAF:
        this.updateVisionSource();
        canvas.perception.update({ initializeVision: true });
        break;
    }

    Hooks.callAll("applyTokenStatusEffect", this, statusId, active);
  };

  await preloadHandlebarsTemplates();

  /************************************** Methods **************************************/
  // Multiboxes
  Handlebars.registerHelper("multiboxes", function (selected, options) {
    let html = options.fn(this);

    // Fix for single non-array values.
    if (!Array.isArray(selected)) {
      selected = [selected];
    }

    if (typeof selected !== "undefined") {
      selected.forEach((selected_value) => {
        if (selected_value !== false) {
          let escapedValue = RegExp.escape(
            Handlebars.escapeExpression(selected_value)
          );
          let rgx = new RegExp(' value="' + escapedValue + '"');
          let oldHtml = html;
          html = html.replace(rgx, "$& checked");
          while (oldHtml === html && escapedValue >= 0) {
            escapedValue--;
            rgx = new RegExp(' value="' + escapedValue + '"');
            html = html.replace(rgx, "$& checked");
          }
        }
      });
    }
    return html;
  });

  // Times from a -> b
  Handlebars.registerHelper("times_from", function (a, b, block) {
    var accum = "";
    for (var i = a; i <= b; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });

  // Progress bar
  Handlebars.registerHelper(
    "progress_bar",
    function (current, max, bonus, block) {
      var accum = "";

      for (var i = 1; i <= Number(max) + Number(bonus); ++i) {
        accum += block.fn({
          i,
          class:
            "progress-bar " +
            (i % 10 === 0 && i !== Number(max) + Number(bonus) ? "tens " : "") +
            (i === Number(max) && Number(bonus) !== 0 ? "max " : "") +
            (i <= current ? "filled-bar " : "empty-bar ") +
            (i > max ? "bonus" : ""),
        });
      }
      return accum;
    }
  );

  // Calculate value + bonus
  Handlebars.registerHelper("calc", function (value, bonus) {
    return Number(value) + Number(bonus);
  });

  // Attribute Counter
  Handlebars.registerHelper("attribute_counter", (skills, options) => {
    let html = options.fn(this);

    let count = 0;
    for (const [name, skill] of Object.entries(skills)) {
      if (Number(skill.value) > 0) count++;
    }

    if (count > 3) count = 3;

    const rgx = new RegExp(' value="' + count + '"');
    return html.replace(rgx, "$& checked");
  });

  // Level tree
  Handlebars.registerHelper(
    "tree",
    function (playerClass, unlockedCells, displayedCell, block) {
      let html = "";

      console.log(this.actor.system.attributes);

      for (let row = 0; row <= 5; ++row) {
        html += "<div class='treeRow'>";

        for (let col = 0; col <= 5; ++col) {
          const cell = `${row}${col}`;
          const containerClass = `${
            !Object.keys(cells).includes(cell) ? "hideSubs" : ""
          } ${(col + row) % 2 === 0 ? "down" : "up"} ${
            unlockedCells.includes(cell)
              ? "unlocked"
              : unlockedCells.includes(cells[cell]?.child)
              ? "unlockable"
              : "locked"
          } ${String(displayedCell) === cell && "highlighted"}`;

          html += block.fn({
            containerClass,
            cellContent: "abcdefghij klmno", //cells[cell]?.[playerClass],
            cellId: cell,
          });
        }

        html += "</div>";
      }
      return html;
    }
  );

  // Conditional if
  Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
    switch (operator) {
      case "==":
        return Number(v1) == Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case "===":
        return Number(v1) === Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case "!=":
        return Number(v1) != Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case "!==":
        return Number(v1) !== Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case "<":
        return Number(v1) < Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case "<=":
        return Number(v1) <= Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case ">":
        return Number(v1) > Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case ">=":
        return Number(v1) >= Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case "&&":
        return Number(v1) && Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      case "||":
        return Number(v1) || Number(v2)
          ? options.fn(this)
          : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });
});

class DetectionModeHearing extends DetectionModeBasicSight {
  /** @override */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [1, 0.7, 0.4, 1],
      knockout: true,
      wave: true,
    }));
  }
  /** @override */
  _canDetect(visionSource, target) {
    // The source may not be blind if the detection mode requires sight
    const src = visionSource.object.document;
    const isDeaf =
      src instanceof TokenDocument &&
      this.type === DetectionMode.DETECTION_TYPES.SOUND &&
      src.hasStatusEffect(CONFIG.specialStatusEffects.DEAF);

    const tgt = target?.document;
    const isInvisible =
      tgt instanceof TokenDocument &&
      tgt.hasStatusEffect(CONFIG.specialStatusEffects.INVISIBLE);

    return !isDeaf && !isInvisible;
  }
}
class DetectionModeTrueHearing extends DetectionModeHearing {
  /** @override */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [1, 0.7, 0.5, 1],
      knockout: true,
      wave: true,
    }));
  }
  /** @override */
  _canDetect(visionSource, target) {
    // The source may not be blind if the detection mode requires sight
    const src = visionSource.object.document;
    const isDeaf =
      src instanceof TokenDocument &&
      this.type === DetectionMode.DETECTION_TYPES.SOUND &&
      src.hasStatusEffect(CONFIG.specialStatusEffects.DEAF);
    return !isDeaf;
  }
}
