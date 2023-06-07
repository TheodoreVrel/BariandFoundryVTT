export default class BariandItemSheet extends ItemSheet {
  get template() {
    return `systems/bariand/templates/sheets/bariand-${this.item.data.type}-sheet.html`;
  }
}
