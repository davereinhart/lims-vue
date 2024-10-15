import { hasType, JsonSchema, rankWith, resolveSchema, scopeEndsWith, type TesterContext } from '@jsonforms/core';
import _ from 'lodash';

export const customTester = rankWith(
    3, //increase rank as needed
    scopeEndsWith('name')
)

function getCurrentSchema (uischema: any, schema: JsonSchema, context: TesterContext): any {
  const schemaPath = uischema.scope;
    if (_.isEmpty(schemaPath)) {
      return false
    }
    let currentDataSchema = schema;
    if (hasType(schema, 'object')) {
      currentDataSchema = resolveSchema(
        schema,
        schemaPath,
        context?.rootSchema
      )
    }
    return currentDataSchema
}

export const textTester = function(uischema: any, schema: JsonSchema, context: TesterContext) {
  const currentDataSchema = getCurrentSchema(uischema, schema, context)
  if (currentDataSchema.type == 'string' && !currentDataSchema.format) {
    return true
  } else {
    return false
  }
}

export const nullableDateTimeTester = function(uischema: any, schema: JsonSchema, context: TesterContext) {
    const currentDataSchema = getCurrentSchema(uischema, schema, context)
    if (currentDataSchema.hasOwnProperty('anyOf')) {
        const nonNullProperties = _.reject(currentDataSchema.anyOf, {type: 'null'})
        if (nonNullProperties.length == 1 && nonNullProperties[0].type == 'string' && nonNullProperties[0].format == 'date-time') {
          return true
        }
    } else if (currentDataSchema.hasOwnProperty('format')) {
      return currentDataSchema.format == 'date-time'
    }
    
    return false
}
