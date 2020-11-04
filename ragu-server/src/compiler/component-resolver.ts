import {RaguServerConfig} from "../config";
import fs from "fs";
import path from "path";
import {getLogger} from "../..";

type Dependency = {
  nodeRequire: string;
  dependency: string;
  globalVariable: string
};

export abstract class ComponentResolver {
  constructor(protected readonly config: RaguServerConfig) {
  }

  abstract componentList(): Promise<string[]>;
  abstract componentViewPath(componentName: string): Promise<string>;
  abstract componentHydratePath(componentName: string): Promise<string>;
  abstract componentsOnlyDependencies(componentName: string): Promise<Dependency[]>;

  async componentViewWebpackEntries() {
    return await this.extractEntries(this.componentViewPath.bind(this));
  }

  async componentHydrateWebpackEntries() {
    return await this.extractEntries(this.componentHydratePath.bind(this));
  }

  private async extractEntries(componentNameToFile: (componentName: string) => Promise<string>) {
    const componentNames = await this.componentList();
    const entries: Record<string, string> = {};

    for (let componentName of componentNames) {
      entries[componentName] = await componentNameToFile(componentName);
    }

    return entries;
  }

  defaultDependencies(_componentName: string) {
    return this.config.components.defaultDependencies || [];
  }

  async dependenciesOf(componentName: string): Promise<Dependency[]> {
    const defaultDependencies = await this.defaultDependencies(componentName);
    const componentDependencies = await this.componentsOnlyDependencies(componentName);

    return [...defaultDependencies, ...componentDependencies];
  }
}

export class ByFileStructureComponentResolver extends ComponentResolver {
  private static instance: ComponentResolver;

  componentList(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.config.components.sourceRoot, (err, files) => {
        if (err) {
          reject(err);
          return
        }
        resolve(files);
      });
    });
  }

  async componentHydratePath(componentName: string): Promise<string> {
    return path.join(this.config.components.sourceRoot, componentName, 'hydrate')
  }

  async componentViewPath(componentName: string): Promise<string> {
    return path.join(this.config.components.sourceRoot, componentName, 'view');
  }

  async componentsOnlyDependencies(componentName: string): Promise<Dependency[]> {
    return JSON.parse(await this.dependenciesFileContentOf(componentName));
  }

  private dependenciesFileContentOf(componentName: string): Promise<string> {
    return new Promise((resolve) => {
      fs.readFile(this.dependenciesPathOf(componentName), (err, data) => {
        if (err) {
          getLogger(this.config).debug(`Component "${componentName}" has no dependencies described.`)
          resolve('[]');
          return;
        }

        getLogger(this.config).debug(`Dependencies found for "${componentName}".`)
        resolve(data.toString());
      })
    });
  }

  private dependenciesPathOf(componentName: string) {
    return path.join(this.config.components.sourceRoot, componentName, 'dependencies.json');
  }

  static getInstance(config: RaguServerConfig) {
    if (!ByFileStructureComponentResolver.instance) {
      ByFileStructureComponentResolver.instance = new ByFileStructureComponentResolver(config);
    }

    return ByFileStructureComponentResolver.instance;
  }
}

export abstract class TemplateComponentResolver extends ByFileStructureComponentResolver {
  abstract viewTemplateFor(componentName: string): Promise<string>;
  abstract hydrateTemplateFor(componentName: string): Promise<string>;

  async componentViewPath(componentName: string): Promise<string> {
    const template = await this.viewTemplateFor(componentName);
    const tempPath = await this.createRaguTempDirectory(componentName);
    const viewPath = path.join(tempPath, 'view.js');

    getLogger(this.config).debug(`"${componentName}" view file generated at "${viewPath}" by "${this.constructor.name}"`);

    await fs.promises.writeFile(viewPath, template);
    return viewPath;
  }

  async componentHydratePath(componentName: string): Promise<string> {
    const template = await this.hydrateTemplateFor(componentName);

    const tempPath = await this.createRaguTempDirectory(componentName);
    const hydratePath = path.join(tempPath, 'hydrate.js');

    getLogger(this.config).debug(`"${componentName}" hydrate file generated at "${hydratePath}" by "${this.constructor.name}"`);

    await fs.promises.writeFile(hydratePath, template);
    return hydratePath;
  }

  private async createRaguTempDirectory(componentName: string): Promise<string> {
    const baseComponentDirectory = this.config.components.resolverOutput || path.join(process.cwd(), '.jig-components');
    const componentDirectory = path.join(baseComponentDirectory, componentName);

    getLogger(this.config).debug(`"${componentName}" output will be generated at "${componentDirectory}"`);

    await fs.promises.mkdir(componentDirectory, {recursive: true});
    return componentDirectory;
  }
}

export abstract class StateComponentResolver extends TemplateComponentResolver {
  abstract viewFileFor(componentName: string): string;
  abstract hydrateFileFor(componentName: string): string;
  abstract stateFileFor(componentName: string): string;

  abstract viewResolver: string;
  abstract hydrateResolver: string;
  abstract stateResolver: string;

  async hydrateTemplateFor(componentName: string): Promise<string> {
    return `
      var component = require('${this.hydrateFileFor(componentName)}');
      var resolver = require('${this.hydrateResolver}');

      module.exports.default = (resolver.default || resolver)(component.default || component);
    `;
  }

  async viewTemplateFor(componentName: string): Promise<string> {
    return `
      var component = require('${this.viewFileFor(componentName)}');
      var resolver = require('${this.viewResolver}');
      var stateResolver = require('${this.stateResolver}');
      var stateResolverFn = (stateResolver.default || stateResolver)(${await this.resolveStateFile(componentName)})
      module.exports.default = (resolver.default || resolver)(component.default || component, stateResolverFn);
    `;
  }

  async resolveStateFile(componentName: string) {
    const statePath = this.stateFileFor(componentName);
    const stateFilename = path.basename(statePath);
    const componentPath = path.dirname(statePath);
    const files: string[] = await fs.promises.readdir(componentPath);

    const fileExists = files.find((filename) => {
      const extension = path.extname(filename);

      return filename.replace(extension, '').toLowerCase() === stateFilename;
    });

    if (!fileExists) {
      return 'null';
    }

    return `require('${statePath}').default || require('${statePath}')`
  }
}

export const getComponentResolver = (config: RaguServerConfig): ComponentResolver => {
  if (config.components.resolver) {
    return config.components.resolver;
  }
  return ByFileStructureComponentResolver.getInstance(config);
}