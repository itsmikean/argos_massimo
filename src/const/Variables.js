import Env from "../data/Environment";

export default (() => {
  return {
    THEMES: [{ name: "dark" }, { name: "light" }],
    ENVIRONMENT_TYPES: [Env.Type.WEB_SOCKET, Env.Type.GQL],
    CODE_THEMES: [
      'base16-dark',
      'darcula',
      'material',
      'default',
      'duotone-light',
      'idea',
      'monokai',
      'railscasts',
      'shadowfox',
      'oceanic-next',
      'mdn-like'
    ],
    COLORS: ["red", "pink", "purple", "blue", "light-blue", "cyan", "green", "light-green", "lime", "yellow", "amber", "orange", "brown", "blue-grey", "indigo", "deep-purple"]
  };
})();
