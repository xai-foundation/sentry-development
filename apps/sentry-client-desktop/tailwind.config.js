/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.tsx", // paths to your files
    "../../packages/ui/src/**/*.tsx",
  ],
  theme: {
    opacity: {
      "75": ".75"
    },
    colors: {
      white: "#fff",
      black: "#000000",

      successBgColor: "#3DD68C1A",
      dropdownItemPrimaryHoverBg: "#231D1F",
      tertiaryText: "#FF2C3A",
      primaryWarningText: "#FFC53D",
      primaryCalloutWarning: "#FFC53D1A",
      btnSecondaryText: "#1A1819",
      checkBoxCheckedPrimaryColor: "#FF0030",
      checkboxPrimaryBg: "#525252",
      tertiaryBorderColor: "#524D4F",
      inputPrimaryHoverBg: "#FF2C3A",
      primaryWarningBg: "#FFC53D",
      primaryModalWrapperBg: "#2A2828",

      red: "#f30919",
      lightBlackDarkWhite: "#181818",
      lightWhiteDarkBlack: "#ffffff",
      lightWhitedarkWhite: "#ffffff",
      creme: "#00000008",
      silverMist: "#E5E5E5",
      graphiteGray: "#4A4A4A",
      slateGray: "#808080",
      steelGray: "#8D8D8D",
      whisperWhite: "#EEEEEE",
      crystalWhite: "#F9F9F9",
      palePearl: "#EBEBEB",
      midnight: "#171717",
      lightGrey: "#cfcfd1",
      shadowGrey: "#00000008",
      hornetSting: "#FF0030", //rebranding colors start
      pelati: "#FF2C3A",
      grenadinePink: "#FF5D69",
      rubberRadish: "#FF99A0",
      pinkAndSleek: "#FFC3C7",
      sweetMallow: "#FFDEE0",
      sefidWhite: "#FFF0F1",
      reEntryRed: "#CF0614",
      crispChristmasCranberries: "#AB0914",
      netherWorld: "#8D0F18",
      brandyWine: "#4D0207",
      nulnOil: "#140F0F",
      dynamicBlack: "#201C1C",
      chromaphobicBlack: "#2A2828",
      darkRoom: "#433F3F",
      foggyLondon: "#5B5757",
      dugong: "#726F6F",
      elementalGrey: "#A19F9F",
      americanSilver: "#D0CFCF",
      white: "#FFFFFF",
      caparolGrey: "#E4E4E4",
      melanzaneBlack: "#1A1819",
      velvetBlack: "#272123",
      tourchRed: "#F1183D",
      bananaBoat: "#FFC53D",
      afterDark: "#3B3335",
      nulnOilBackground: "#140F0FBF",
      blazeOrange: "#F76808",
      greyBorders: "#524D4F",
      drunkenDragonFly: "#3DD68C"//rebranding colors end
    },
    extend: {},
  },
  plugins: [],
};
