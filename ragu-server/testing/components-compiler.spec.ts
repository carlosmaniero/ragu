import {ComponentsCompiler} from "../src/compiler/components-compiler";
import * as fs from "fs";
import * as jsdom from "jsdom";
import {ConstructorOptions} from "jsdom";
import {RaguServerConfig, ServerSideCompiler} from "..";
import {createTestConfig} from "./test-config-factory";
import {emptyDirSync} from "fs-extra";

describe('Component Compiler', () => {
  let compiler: ComponentsCompiler;
  let dom: jsdom.JSDOM;
  let config: RaguServerConfig;

  describe('when SSR', () => {
    beforeAll(async () => {
      config = await createTestConfig();
      compiler = new ComponentsCompiler(config);

      await compiler.compileAll();
    });

    afterAll(() => {
      emptyDirSync(config.compiler.output.serverSide);
      emptyDirSync(config.compiler.output.clientSide);
    });

    beforeEach(() => {
      const options: ConstructorOptions = {
        url: config.compiler.assetsPrefix,
        resources: 'usable',
        runScripts: 'dangerously',
      }
      dom = new jsdom.JSDOM(undefined, options);

      (global as any).window = dom.window;
      (global as any).document = dom.window.document;
    })

    const evalCompiledClient = async (componentName: string) => {
      const url = new URL(await compiler.getClientFileName(componentName));
      const client = fs.readFileSync(url as any).toString();
      eval(client);
    }

    it('exports compiled component into window', async () => {
      await evalCompiledClient('hello-world');

      const resolvedComponent = (window as any)['test_components_hello-world'].default;
      const div = dom.window.document.createElement('div');
      resolvedComponent.hydrate(div, {name: 'World'}, {greetingType:'Hello'});

      expect(div.textContent).toContain('Hello, World');
    });

    describe('with dependencies', () => {
      it('resolves the dependency', async () => {
        await evalCompiledClient('with-dependencies-component');

        const resolvedComponent = (window as any)['test_components_with-dependencies-component'].default;
        const div = dom.window.document.createElement('div');
        resolvedComponent.hydrate(div, {name: 'World'});

        expect(div.textContent).toContain('Hello, World');
      });
    });

    describe('with external dependencies', () => {
      it('uses the defined dependency', async () => {
        (window as any).jQuery = jest.fn(() => ({
          'on': () => {}
        }));

        await evalCompiledClient('with-external-dependencies-component');

        const resolvedComponent = (window as any)['test_components_with-external-dependencies-component'].default;
        const div = dom.window.document.createElement('div');
        resolvedComponent.hydrate(div, {name: 'World'});

        expect((window as any).jQuery).toBeCalled();
      });
    });
  });

  describe('when SSR is disabled', () => {
    class StubViewCompiler extends ServerSideCompiler {
      stub = jest.fn();

      async compileAll(): Promise<void> {
        this.stub();
      }
    }

    let stubViewCompiler: StubViewCompiler;

    beforeAll(async () => {
      config = await createTestConfig();
      config.ssrEnabled = false;

      stubViewCompiler = new StubViewCompiler(config);
      compiler = new ComponentsCompiler(config, stubViewCompiler);

      await compiler.compileAll();
    });

    afterAll(() => {
      emptyDirSync(config.compiler.output.serverSide);
      emptyDirSync(config.compiler.output.clientSide);
    });

    it('does not call view compiler when srr is disabled', () => {
      expect(stubViewCompiler.stub).not.toBeCalled();
    });
  });
});
