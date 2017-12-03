import expect from 'must';
import _ from 'lodash';

import { createSelector } from '../../src/helpers/select';


describe('select', () => {
  const store = {
    animals: [
      { name: 'eagle', flies: true },
      { name: 'frog', flies: false },
      { name: 'owl', flies: true },
    ],
    vehicles: [
      { name: 'plane', flies: true },
      { name: 'car', flies: false },
    ],
  };

  const otherStore = {
    animals: [
      { name: 'bat', flies: true },
      { name: 'gecko', flies: false },
    ],
    vehicles: [],
  };

  describe('createSelector', () => {
    describe('when no input selectors are specified', () => {
      it('should pass through the first argument', () => {
        const getAnimals = createSelector([], state => state.animals);
        expect(getAnimals(store)).to.equal(store.animals);
      });

      it('should base results on the argument', () => {
        const getAnimals = createSelector([], state => state.animals);
        expect(getAnimals(store)).to.equal(store.animals);
        expect(getAnimals(otherStore)).to.equal(otherStore.animals);
      });

      it('should cache results', () => {
        let nCalls = 0;
        const getAnimals = createSelector([], state => {
          nCalls += 1;
          return state.animals;
        });
        getAnimals(store);
        getAnimals(store);
        getAnimals(otherStore);
        expect(nCalls).to.equal(2);
      });
    });

    describe('when one input selector is specified', () => {
      it('should use the input selectors', () => {
        const getAnimals = state => state.animals;
        const getFlyingAnimalNames = createSelector(
          [
            getAnimals,
          ],
          animals => _.filter(animals, animal => animal.flies).map(animal => animal.name),
        );
        expect(getFlyingAnimalNames(store)).to.eql(['eagle', 'owl']);
      });
    });

    describe('when multiple input selectors are specified', () => {
      it('should use the input selectors', () => {
        const getAnimals = state => state.animals;
        const getVehicles = state => state.vehicles;
        const getFlyingThingNames = createSelector(
          [
            getAnimals,
            getVehicles,
          ],
          (animals, vehicles) => {
            const things = animals.concat(vehicles);
            return _.filter(things, thing => thing.flies).map(thing => thing.name);
          },
        );
        expect(getFlyingThingNames(store)).to.eql(['eagle', 'owl', 'plane']);
      });
    });
  });
});
