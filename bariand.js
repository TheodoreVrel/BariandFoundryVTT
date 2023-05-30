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

  // CODE LOUIS
  //
  //
  //

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
