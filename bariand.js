// import { bariand } from "./modules/config.js";
import BariandActorSheet from "./modules/sheets/bariandActorSheet.js";
import BariandItemSheet from "./modules/sheets/bariandItemSheet.js";

Hooks.once("init", function () {
  console.log("bariand - initialisation");

  //CONFIG.bariand = bariand;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("bariand", BariandActorSheet, {
    types: ["personnage"],
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("bariand", BariandItemSheet, { makeDefault: true });

  /************************************** Methods **************************************/
  // Multiboxes
  Handlebars.registerHelper("multiboxes", function (selected, options) {
    let html = options.fn(this);

    // Fix for single non-array values.
    if (!Array.isArray(selected)) {
      selected = [selected];
    }

    console.log({ selected });

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

  // Times from 1
  Handlebars.registerHelper("times_from_1", function (n, block) {
    var accum = "";
    for (var i = 1; i <= n; ++i) {
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
            (i % 10 === 0 ? "tens " : "") +
            (i === Number(max) && Number(bonus) !== 0 ? "max " : "") +
            (i <= current ? "filled-bar " : "empty-bar ") +
            (i > max ? "bonus" : ""),
        });
      }
      return accum;
    }
  );
});
