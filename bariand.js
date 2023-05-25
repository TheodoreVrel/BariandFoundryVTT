// import { bariand } from "./modules/config.js";
// import { BariandActorSheet } from "./modules/sheets/bariand-actor-sheet.js";
import BariandItemSheet from "./modules/sheets/bariandItemSheet.js";

Hooks.once("init", function () {
  console.log("bariand - initialisation");

  // CONFIG.bariand = bariand;

  // Actors.unregisterSheet("core", ActorSheet);
  // Actors.registerSheet("bariand", BariandActorSheet, {
  //   types: ["personnage"],
  //   makeDefault: true,
  // });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("bariand", BariandItemSheet, { makeDefault: true });
});
