declare module "*.css";

declare module "react-icons-kit" {
  export const Icon: any;
}

declare module "react-icons-kit/*/*" {
  export const ic_apps: any;
  export const ic_chat_bubble: any;
  export const ic_menu: any;
  export const ic_notifications: any;
  export const ic_search: any;
  export const ic_video_call: any;
  export const ic_sentiment_satisfied: any;
  export const github: any;
}

declare module "map-values" {
  export default function mapValues<In, Out>(
    object: Record<string, In>,
    iteratee: (value: In, key: string) => Out
  ): Record<string, Out>;
}
