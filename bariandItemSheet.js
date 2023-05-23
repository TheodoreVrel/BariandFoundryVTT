export default class BariandItemSheet extends ItemSheet {
    get template(){
        return 'systems/bariandVTT/templates/sheets/${this.item.data.type}-sheet.html';
    }
}