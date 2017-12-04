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
 * corresponding relationship, and that no entity has an array of
 * relationships.
 */
export const normalizeRelationships = (entities) => {
  const newEntities = {};
  _.toPairs(entities).forEach(([type, typeEntities]) => {
    _.values(typeEntities).forEach((entity) => {
      const newEntity = _.omit(entity, ['relationships']);
      _.toPairs(entity.relationships).forEach(([relName, { data: relData }]) => {
        if(!Array.isArray(relData)) {
          // Keep the relationship if we are on the one side of one-to-*
          _.set(newEntity, ['relationships', relName, 'data'], relData);
          relData = [relData];
        }

        const { name: invRelName, many } = inverseRelationships[type][relName];
        // If the relationship is *-to-many, skip adding the inverse
        if(many) { return; }

        // Add the inverse relationships
        relData.forEach((rel) => {
          _.setWith(newEntities,
            [rel.type, rel.id, 'relationships', invRelName, 'data'],
            { id: entity.id, type },
            Object
          );
        });
      });
      _.updateWith(newEntities, [type, newEntity.id], old => _.merge(old, newEntity), Object);
    });
  });
  return newEntities;
};

export const deserialize = (jsonApiData) =>
  normalizeRelationships(normalize(jsonApiData));
