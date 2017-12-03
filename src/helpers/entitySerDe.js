import _ from 'lodash';
import normalize from 'json-api-normalizer';


const inverseRelationships = {
  notebooks: {
    tags: { name: 'notebook', many: false },
    frames: { name: 'notebook', many: false },
  },
  tags: {
    notebook: { name: 'tags', many: true },
  },
  frames: {
    notebook: { name: 'frames', many: true },
  }
};

export const serializeOne = (type, entity, opts) => {
  const { pick } = opts || {};
  let { attributes } = entity;
  if(pick !== undefined) {
    attributes = _.pick(attributes, pick);
  }
  return {
    type,
    id: entity.id,
    attributes,
  };
};

/**
 * Ensures that all entities that hold a foreign key end up with a
 * corresponding relationship.
 */
export const addInverseRelationships = (entities) => {
  const invRelEntities = {};
  _.toPairs(entities).forEach(([type, typeEntities]) => {
    _.values(typeEntities).forEach((entity) => {
      _.toPairs(entity.relationships).forEach(([relName, { data: relData }]) => {
        const { name: invRelName, many } = inverseRelationships[type][relName];
        if(many) {
          return;
        }
        relData = _.isArray(relData) ? relData : [relData];
        relData.forEach((rel) => {
          const path = [rel.type, rel.id, 'relationships', invRelName, 'data'];
          _.setWith(invRelEntities, path, { id: entity.id, type }, Object);
        });
      });
    });
  });
  return _.mergeWith({}, entities, invRelEntities);
};

export const deserialize = (jsonApiData) =>
  addInverseRelationships(normalize(jsonApiData));
