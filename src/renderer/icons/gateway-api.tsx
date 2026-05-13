import { Renderer } from "@freelensapp/extensions";
import svgIcon from "./gateway-api.svg?raw";

const {
  Component: { Icon },
} = Renderer;

export function GatewayApiIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}
