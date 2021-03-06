import {
  createDefaultWebpackConfiguration,
  PreCompilationFailFileNotFoundError,
  PreCompilationOutputError,
  RaguServerConfig,
  ServerSideCompiler
} from "../..";
import {createTestConfig} from "../test-config-factory";
import {emptyDirSync} from "fs-extra";
import * as path from "path";
import * as fs from "fs";
import {merge} from "webpack-merge";
import {TestTemplateComponentResolver} from "./test-template-component-resolver";

describe('View Compiler', () => {
  let compiler: ServerSideCompiler;
  let config: RaguServerConfig;

  beforeAll(async () => {
    config = await createTestConfig();
    compiler = new ServerSideCompiler(config);
  });

  afterAll(() => {
    emptyDirSync(path.join(config.compiler.output.serverSide, '..'));
  });

  describe('returning the compiled path', () => {
    it('returns a file inside the path described by output.view configuration', () => {
      const helloPath = compiler.compiledComponentPath('hello-world');
      const helloDirectoryPath = path.dirname(helloPath);

      expect(helloDirectoryPath).toEqual(config.compiler.output.serverSide);
    });

    it('returns the filename with the same name of component name', () => {
      const helloPath = compiler.compiledComponentPath('hello-world');
      const fileName = path.basename(helloPath);

      expect(fileName).toEqual('hello-world.js');
    });
  });

  describe('compiling components', () => {
    beforeAll(async () => {
      await compiler.compileAll();
    });

    it('compiles the component', () => {
      const componentFileAsText = fs.readFileSync(path.join(config.components.sourceRoot, 'hello-world', 'server-side.ts')).toString();
      const compiledComponentFileAsText = fs.readFileSync(compiler.compiledComponentPath('hello-world')).toString();

      expect(componentFileAsText).not.toEqual(compiledComponentFileAsText);
    });

    it('keeps the behaviour after compilation', () => {
      const {default: component} = require(path.join(config.components.sourceRoot, 'hello-world', 'server-side.ts'));
      const {default: compiledComponent} = require(compiler.compiledComponentPath('hello-world'));

      expect(component.dependencies).toEqual(compiledComponent.dependencies);
      const props = {
        params: {
          name: 'World'
        },
        isServer: true,
        request: {
          path: 'hello-world'
        },
        config
      };

      expect(component.render(props)).toEqual(compiledComponent.render(props));
    });
  });

  describe('compiling components with a custom template resolver', () => {
    it('keeps the behaviour after compilation', async () => {
      config.compiler.output.serverSide += '-template-resolver';
      config.components.sourceRoot = path.join(__dirname, 'template-resolver-components');
      config.components.resolver = new TestTemplateComponentResolver(config);

      compiler = new ServerSideCompiler(config);
      await compiler.compileAll();

      const {default: compiledComponent} = require(compiler.compiledComponentPath('hello-world'));
      expect(compiledComponent.render({name: 'World'})).toEqual('Hello, World!!!');
    });
  });

  describe('providing a pre compiler webpack configuration with no exports', () => {
    beforeEach(async () => {
      // impossible to invalidate require.cache
      config.compiler.output.serverSide += '2';
      config.compiler.webpack.serverSide = merge(
          createDefaultWebpackConfiguration({}),
          {
            output: {
              library: {
                type: 'var',
                name: 'any_name'
              },
              filename: '[name].js',
              path: config.compiler.output.serverSide,
            },
          }
      );

      compiler = new ServerSideCompiler(config);
    });

    it('rejects the promise with a compilation output error', async () => {
      await expect(compiler.compileAll()).rejects.toEqual(new PreCompilationOutputError('default', 'hello-world'));
    });
  });

  describe('providing a pre compiler webpack configuration that does not generates a not found', () => {
    beforeEach(async () => {
      config.compiler.output.serverSide += '3';
      config.compiler.webpack.serverSide = merge(
          createDefaultWebpackConfiguration({}),
          {
            output: {
              library: {
                type: 'var',
                name: 'any_name'
              },
              filename: '[name].zucchini.js',
              path: config.compiler.output.serverSide,
            },
          }
      );

      compiler = new ServerSideCompiler(config);
    });

    it('rejects the promise with a not found error', async () => {
      await expect(compiler.compileAll()).rejects.toEqual(new PreCompilationFailFileNotFoundError('hello-world'));
    });
  });
});
