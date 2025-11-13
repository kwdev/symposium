// This file runs in the webview context (browser environment)
import { MynahUI } from "@aws/mynah-ui";

// Initialize mynah-ui when the DOM is ready
const mynahUI = new MynahUI({
  rootSelector: "#mynah-root",
  loadStyles: true,
  defaults: {
    store: {
      tabTitle: "Symposium",
    },
  },
});

console.log("MynahUI initialized:", mynahUI);
