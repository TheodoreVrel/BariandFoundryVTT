// import { getAllItemsByType } from "../../items/bariand-helpers";

const talents = [
  {
    _id: "0IDmKmW3AiaNEBpE",
    name: "Acharné",
    permission: { default: 0 },
    system: {
      description:
        "Lorsque vous prenez des dégâts, lancez un d4. Réduisez les dégâts que vous prenez par ce chiffre. Au niveau 3, remplacez-le par un d6, et au niveau 6, vous lancez ce d6 avec Avantage.",
      type: "Combat",
      classes: "Combattant",
      statsRequired: "Vigueur 3, Ténacité 2",
      limitation: "",
    },
    flags: {},
  },
];

export default class BariandActorSheet extends ActorSheet {
  get template() {
    return `systems/bariand/templates/sheets/bariand-actor-sheet.html`;
  }
  async getData() {
    const data = await super.getData();

    data.config = CONFIG.bariand;
    data.talents = data.items.filter((item) => item.type === "talent");

    return data;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["bariand", "sheet", "actor"],
      width: 850,
      height: 1050,
      tabs: [
        {
          navSelector: ".tabs",
          contentSelector: ".all-tabs",
          initial: "abilities",
        },
      ],
    });
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".edit-resource").click(this._onEditResource.bind(this));
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-create-list").click(this._onItemCreateList.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));

    html
      .find(".treeCell:not(.locked) .treeCellContent")
      .hover(this._onShowTreeTooltip.bind(this));
  }

  async _onEditResource(event) {
    event.preventDefault();

    const type = $(event.currentTarget).data("resource");
    const value = $(event.currentTarget).data("resource-value");
    const isVariable = !!$(event.currentTarget).data("resource-variable");
    const resource = this.actor.system[type];

    if (value !== "" && value !== "-")
      await this.actor.update({
        [`system.${type}.current`]: Math.max(
          0,
          Math.min(
            resource.current + value,
            resource.max + (resource.bonus ?? 0)
          )
        ),
        [`system.${type}.bonus`]:
          Number(value) < 0
            ? Math.max(resource.bonus + value, 0)
            : resource.bonus,
        [`system.${type}.change`]: isVariable ? "" : resource.change,
      });
  }

  async _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;

    let itemData = {
      name: "New",
      type: $(element).data("type"),
    };

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }

  async _onItemCreateList(event) {
    event.preventDefault();
    const type = $(event.currentTarget).data("type");
    const distinct = $(event.currentTarget).data("distinct");
    let input_type = "checkbox";

    if (typeof distinct !== "undefined") {
      input_type = "radio";
    }

    let html = `<div class="items-to-add">`;

    talents.forEach((e) => {
      let addition_price_load = ``;

      if (typeof e.system.load !== "undefined") {
        addition_price_load += `(${e.system.load})`;
      } else if (typeof e.system.price !== "undefined") {
        addition_price_load += `(${e.system.price})`;
      }

      html += `<input id="select-item-${e._id}" type="${input_type}" name="select_items" value="${e._id}">`;
      html += `<label class="flex-horizontal" for="select-item-${e._id}">`;
      html += `${game.i18n.localize(
        e.name
      )} ${addition_price_load} <i class="tooltip fas fa-question-circle"><span class="tooltiptext">${game.i18n.localize(
        e.system.description
      )}</span></i>`;
      html += `</label>`;
    });

    html += `</div>`;

    let options = {
      // width: "500"
    };

    let dialog = new Dialog(
      {
        title: `${game.i18n.localize("Add")} ${type}`,
        content: html,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("Add"),
            callback: async (html) =>
              await this.addItemsToSheet(type, $(html).find(".items-to-add")),
          },
          two: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("Cancel"),
            callback: () => false,
          },
        },
        default: "two",
      },
      options
    );

    dialog.render(true);
  }

  async addItemsToSheet(type, el) {
    let items_to_add = [];

    el.find("input:checked").each(function () {
      items_to_add.push(talents.find((e) => e._id === $(this).val()));
    });

    return this.actor.createEmbeddedDocuments("Item", items_to_add);
  }

  async _onItemEdit(event) {
    const element = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(element.data("itemId"));

    item.sheet.render(true);
  }

  async _onItemDelete(event) {
    const element = $(event.currentTarget).parents(".item");

    await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
  }

  async _onShowTreeTooltip(event) {
    const element = event.currentTarget;
    const id = $(element).data("cellid");

    await this.actor.update({
      "system.treeTooltip.cell": id,
      "system.treeTooltip.title": "bonsoir",
      "system.treeTooltip.description": id,
    });
  }
}
