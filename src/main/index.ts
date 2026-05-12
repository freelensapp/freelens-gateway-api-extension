import { Main } from "@freelensapp/extensions";
import { ExamplePreferencesStore } from "../common/store";

export default class ExampleMain extends Main.LensExtension {
  async onActivate() {
    await ExamplePreferencesStore.getInstanceOrCreate().loadExtension(this);
  }
}
