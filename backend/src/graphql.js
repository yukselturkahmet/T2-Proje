import { GraphQLError, buildSchema, graphql } from 'graphql';
import { AppError } from './errors.js';
import { resolvers } from './resolvers.js';
import { typeDefs } from './schema.js';

export const schema = buildSchema(typeDefs);

// buildSchema has no place for resolvers, so attach them to the fields.
for (const [typeName, fields] of Object.entries(resolvers)) {
  const type = schema.getType(typeName);
  for (const [fieldName, resolve] of Object.entries(fields)) {
    type.getFields()[fieldName].resolve = resolve;
  }
}

const json = schema.getType('JSON');
json.serialize = (value) => value;
json.parseValue = (value) => value;

function formatError(error) {
  const original = error.originalError;
  if (original instanceof AppError) {
    return { message: original.code, path: error.path, extensions: { code: original.code, params: original.params } };
  }
  // Errors raised while parsing or validating the query itself.
  if (!original || original instanceof GraphQLError) {
    return { message: error.message, extensions: { code: 'BAD_REQUEST' } };
  }
  console.error(original);
  return { message: 'Internal server error', path: error.path, extensions: { code: 'INTERNAL' } };
}

export async function execute({ query, variables, operationName }, context) {
  const result = await graphql({
    schema,
    source: query,
    variableValues: variables,
    operationName,
    contextValue: context,
  });
  return result.errors ? { ...result, errors: result.errors.map(formatError) } : result;
}
