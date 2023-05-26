export default class BariandActorSheet extends ActorSheet {
  get template() {
    return `systems/bariand/templates/sheets/bariand-actor-sheet.html`;
  }

  getData() {
    const data = super.getData();

    data.config = CONFIG.bariand;
    console.log({ data });
    return data;
  }
}
