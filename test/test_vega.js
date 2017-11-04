import fs from 'fs';
import expect from 'must';
import vegaFrameView from '../src/frameViews/vega';

describe('Vega frame view', () => {
  describe('when the spec is only valid in Vega 2', () => {
    let spec;
    beforeEach(() => {
      spec = JSON.parse(fs.readFileSync(require.resolve('./data/vega2-only-spec.json'), 'utf8'));
    });

    describe('when the schema is not set', () => {
      beforeEach(() => {
        delete spec.$schema;
      });

      it('should render without throwing an error', () => {
        expect(vegaFrameView({ body: spec })).to.eventually.be.a.string();
      });
    });

    describe('when the schema is set for v3.0', () => {
      beforeEach(() => {
        spec.$schema = 'https://vega.github.io/schema/vega/v3.0.json';
      });

      it('should throw an error during render', () => {
        expect(vegaFrameView({ body: spec })).to.reject.to.an.error();
      });
    });

    describe('when the schema is set for v2.6', () => {
      beforeEach(() => {
        spec.$schema = 'https://vega.github.io/schema/vega/v2.6.json';
      });

      it('should render without throwing an error', () => {
        expect(vegaFrameView({ body: spec })).to.eventually.be.a.string();
      });
    });
  });
});
