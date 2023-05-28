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
  CONFIG.Canvas.detectionModes.hearing = new DetectionModeHearing({
    id: "hearing",
    label: "Hearing",
    walls: false,
    angle: false,
    type: DetectionMode.DETECTION_TYPES.SOUND,
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
}
