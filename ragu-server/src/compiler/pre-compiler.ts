import {RaguServerConfig} from "../config";
import webpack from "webpack";
import {createDefaultWebpackConfiguration} from "./webpack-config-factory";
import * as path from "path";
import {merge} from "webpack-merge";
import * as fs from "fs";

const node_modules = fs
    .readdirSync('node_modules')
    .filter(function(x) { return x !== '.bin' });

export class PreCompilationOutputError extends Error {
  constructor(readonly key: string, readonly componentName: string) {
    super(`Compilation Error! The component "${componentName}" does not exports ${key}. Verify your webpack configuration. The compilation must result in a commonjs module.`);
  }
}

export class PreCompilationFailFileNotFoundError extends Error {
  constructor(readonly componentName: string) {
    super(`Compilation Error! The component "${componentName}" was not found at the pre-compiler output path. Verify your webpack configuration. The compilation must result in a commonjs module.`);
  }
}

export class PreCompiler {
  constructor(readonly config: RaguServerConfig) {
  }

  async compileAll(): Promise<void> {
    const components = fs.readdirSync(this.config.components.sourceRoot);

    await Promise.all(components.map((componentName) => this.compileComponent(componentName)));
  }

  private compileComponent(componentName: string) {
    return new Promise<void>((resolve, reject) => {
      webpack(this.getWebpackConfig(componentName), (err, stats) => {
        if (err) {
          return reject(err);
        }
        if (stats.hasErrors()) {
          const statsJson = stats.toJson('minimal');
          statsJson.errors.forEach(error => console.error(error));
          return reject(stats);
        }

        try {
          this.checkCompilationResult(componentName);
        } catch (e) {
          reject(e);
        }

        resolve();
      });
    });
  }

  private getWebpackConfig(componentName: string) {
    const requiredConfig: Partial<webpack.Configuration> = {
      target: "node",
      output: {
        libraryTarget: "commonjs2",
        filename: '[name].js',
        path: this.config.components.preCompiledOutput
      },
      externals: node_modules,
      entry: {
        [componentName]: path.join(this.config.components.sourceRoot, componentName)
      }
    };

    if (this.config.webpackPreCompilerConfiguration) {
      return merge(requiredConfig, this.config.webpackPreCompilerConfiguration);
    }

    return merge(createDefaultWebpackConfiguration({}), requiredConfig);
  }

  private checkCompilationResult(componentName: string) {
    const component = this.getCompiledComponent(componentName);
    if (!('default' in component)) {
      throw new PreCompilationOutputError('default', componentName);
    }
  }

  private getCompiledComponent(componentName: string) {
    try {
      return require(path.join(this.config.components.preCompiledOutput, componentName));
    } catch (e) {
      throw new PreCompilationFailFileNotFoundError(componentName);
    }
  }
}
