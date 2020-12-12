

import App from "./App.mjs";

async function main(){
  await App.load();
  window.app=new App({
    view:document.querySelector("#View"),
  });
}

main();