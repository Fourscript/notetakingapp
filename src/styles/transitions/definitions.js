//#region SPRING TRANSITIONS
export const springDefault = {
  type: "spring",
  stiffness: 700,
  damping: 30,
};
export const spring = {
  type: "spring",
  bounce: 0.3,
  duration: 0.7,
};
export const springShort = {
  type: "spring",
  bounce: 0.3,
  duration: 0.5,
};
export const springShorter = {
  type: "spring",
  bounce: 0.3,
  duration: 0.4,
};
export const springShortest = {
  type: "spring",
  bounce: 0.3,
  duration: 0.2,
};
//#endregion

//#region VARIANTS
export const variantFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
export const variantFadeWithStagger = {
  hidden: { opacity: 0, transition: { duration: 0.2 } },
  visible: (i) => ({
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: i * 0.02,
    },
  }),
};
export const variantFadeSlideDown = {
  hidden: { opacity: 0, y: -20, transition: springShortest },
  visible: { opacity: 1, y: 0, transition: springShorter },
};
export const variantFadeSlideDownSlow = {
  hidden: { opacity: 0, y: -20, transition: springShort },
  visible: { opacity: 1, y: 0, transition: spring },
};
export const variantFadeSlideUp = {
  hidden: { opacity: 0, y: 20, transition: springShortest },
  visible: { opacity: 1, y: 0, transition: springShorter },
};
export const variantFadeSlideUpSlow = {
  hidden: { opacity: 0, y: 20, transition: springShort },
  visible: { opacity: 1, y: 0, transition: spring },
};
export const variantFadeHeight = {};
//#endregion
