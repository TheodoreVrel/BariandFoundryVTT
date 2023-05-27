export default class BariandActorSheet extends ActorSheet {
  get template() {
    return `systems/bariand/templates/sheets/bariand-actor-sheet.html`;
  }

  getData() {
    const data = super.getData();

    data.config = CONFIG.bariand;
    console.log(data.data.system);
    return data;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bariand", "sheet", "actor"],
      width: 850,
      height: 1050,
    });
  }
}
