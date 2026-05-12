import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { ExamplePreferencesStore } from "../../common/store";

const { observer } = MobxReact;

const {
  Component: { Checkbox },
} = Renderer;

const preferences = ExamplePreferencesStore.getInstanceOrCreate<ExamplePreferencesStore>();

export const ExamplePreferenceInput = observer(() => {
  return (
    <Checkbox
      label="Example checkbox"
      value={preferences.enabled}
      onChange={(v) => {
        console.log(`[EXAMPLE-PREFERENCES-STORE] onChange ${v}`);
        preferences.enabled = v;
      }}
    />
  );
});

export const ExamplePreferenceHint = () => <span>This is an example of an preference for extensions.</span>;
