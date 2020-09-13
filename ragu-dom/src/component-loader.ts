import {ComponentDependency, DependencyContext} from "./dependency-context";
import {JsonpGateway} from "./gateway/jsonp-gateway";

export interface ComponentLoaderContext {
  dependencyContext: DependencyContext;
  jsonpGateway: JsonpGateway
}

export interface Component<Props, State> {
  dependencies?: ComponentDependency[];
  props: Props;
  state: State;
  html: string;
  client: string;
  resolverFunction: string;
  disconnect?: () => void
  hydrate: (element: HTMLElement, props: Props, state: State) => Promise<void>;
}

export class ComponentLoader {
  constructor(readonly context: ComponentLoaderContext) {
  }

  async load<P, S, T extends Component<P, S>>(componentUrl: string): Promise<T> {
    const componentResponse: T = await this.context.jsonpGateway.fetchJsonp<T>(componentUrl);

    return {
      ...componentResponse,
      hydrate: async (htmlElement: HTMLElement, props: P, state: S) => {
        const dependencies = componentResponse.dependencies || [];

        await this.context.dependencyContext.loadAll(dependencies);

        await this.context.dependencyContext.load({ dependency: componentResponse.client });

        const component = await (window as any)[componentResponse.resolverFunction].resolve();
        await component.hydrate(htmlElement, props, state);
      }
    };
  }
}
