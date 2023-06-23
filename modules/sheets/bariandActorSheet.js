// import { getAllItemsByType } from "../../items/bariand-helpers";

function fetchByDotOperator(object, value) {
  return value.split(".").reduce((acc, curr) => acc[curr], object);
}

const getAllItemsByType = async (item_type, game) => {
  let list_of_items = [];
  let game_items = [];
  let compendium_items = [];

  game_items = game.items
    .filter((e) => e.type === item_type)
    .map((e) => {
      return e.toObject();
    });

  let pack = game.packs.find((e) => e.metadata.name === item_type);
  let compendium_content = await pack.getDocuments();
  compendium_items = compendium_content.map((e) => {
    return e.toObject();
  });

  list_of_items = game_items.concat(compendium_items);
  list_of_items.sort(function (a, b) {
    let nameA = a.name.toUpperCase();
    let nameB = b.name.toUpperCase();
    return nameA.localeCompare(nameB);
  });
  return list_of_items;
};

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

    html.find(".edit-actor-value").click(this._onEditActorValue.bind(this));
    html.find(".item-create").click(this._onItemCreate.bind(this));
    html.find(".item-create-list").click(this._onItemCreateList.bind(this));
    html.find(".item-edit").click(this._onItemEdit.bind(this));
    html.find(".item-delete").click(this._onItemDelete.bind(this));

    html
      .find(".attributes-container label")
      .click(this._onAttributesChange.bind(this));

    html
      .find(".treeCell:not(.locked) .treeCellContent")
      .hover(this._onShowTreeTooltip.bind(this));
  }

  async _onEditActorValue(event) {
    event.preventDefault();

    const type = $(event.currentTarget).data("resource");
    const value = $(event.currentTarget).data("resource-value");
    const isVariable = !!$(event.currentTarget).data("resource-variable");
    const isResource =
      type.includes("current") &&
      (type.includes("health") || type.includes("mana"));
    const currentValue = fetchByDotOperator(this.actor.system, type);
    const resource = isResource
      ? this.actor.system[type.split(".")[0]]
      : undefined;
    const maxValue = isResource
      ? resource.max + (resource.bonus ?? 0)
      : $(event.currentTarget).data("max-value") ?? 99999;

    const newValue = Math.max(0, Math.min(currentValue + value, maxValue));

    if (value !== "" && value !== "-")
      await this.actor.update({
        [`system.${type}`]: newValue,
        [`system.health.change`]: isVariable ? "" : resource.change,
      });

    if (type.includes("health")) {
      await this.actor.update({
        [`system.health.bonus`]:
          Number(value) < 0
            ? Math.max(resource.bonus + value, 0)
            : resource.bonus,
      });
    }
  }

  async _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;

    let itemData = {
      name: "Nouveau",
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

    const list = await getAllItemsByType("talents", game);

    list.forEach((e) => {
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
              await this.addItemsToSheet(list, $(html).find(".items-to-add")),
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

  async addItemsToSheet(list, el) {
    let items_to_add = [];

    el.find("input:checked").each(function () {
      items_to_add.push(list.find((e) => e._id === $(this).val()));
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

  async _onAttributesChange(event) {
    let toUpdate = {};
    const attributes = this.actor.system.attributes;

    for (const attr in attributes) {
      toUpdate[`system.attributes.${attr}.value`] = Object.entries(
        attributes[attr].skills
      )
        .map((s) => s[1].value > 0)
        .reduce((prev, current) => prev + current);
    }

    await this.actor.update(toUpdate);
  }

  async _onShowTreeTooltip(event) {
    const element = event.currentTarget;
    const id = $(element).data("cellid");

    await this.actor.update({
      "system.treeTooltip.cell": id,
      "system.treeTooltip.title": "bonsoir" + id,
      "system.treeTooltip.description": id,
    });
  }
}
