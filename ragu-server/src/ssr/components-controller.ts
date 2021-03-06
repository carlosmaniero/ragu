import {RaguServerConfig} from "../config";
import {ComponentsService} from "../services/components-service";
import {Request, Response} from "express";
import {ComponentsCompiler, getLogger} from "../..";

export class ComponentsController {
  private readonly componentService: ComponentsService;

  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler, service?: ComponentsService) {
    this.componentService = service || new ComponentsService(this.config, this.compiler);
  }

  async renderComponent(req: Request, res: Response) {
    const componentName = req.params.componentName;
    getLogger(this.config).info(`[GET] ${req.path}`);

    try {
      const props = this.getPropsFromRequest(req);

      const response = await this.componentService.renderComponent(componentName, props, req);

      res.jsonp({
        ...response,
      });
      getLogger(this.config).info(`responding "${req.path}" with 200 status code.`);
    } catch (e) {
      this.handleComponentError(e, componentName, res);
    }
  }

  private getPropsFromRequest(req: Request) {
    const props: Record<string, unknown> = {...req.query};

    // Ignore JSONP callback query parameter
    delete props['callback'];

    return props;
  }

  private handleComponentError(e: any, componentName: any, res: Response) {
    getLogger(this.config).error(`error during processing component ${componentName}`, e);
    res.statusCode = 500;
    res.send({
      error: "error during render the component",
      componentName
    });
  }
}
