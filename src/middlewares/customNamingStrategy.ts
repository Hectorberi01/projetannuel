import { DefaultNamingStrategy, NamingStrategyInterface } from "typeorm";
import { snakeCase } from "typeorm/util/StringUtils";

export class CustomNamingStrategy extends DefaultNamingStrategy implements NamingStrategyInterface {
    eagerJoinRelationAlias(alias: string, propertyPath: string): string {
        return `${alias}_${propertyPath.replace(".", "_")}`;
    }

    tableName(className: string, customName: string): string {
        return customName ? customName : snakeCase(className);
    }

    columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
        return snakeCase(embeddedPrefixes.concat(customName ? customName : propertyName).join("_"));
    }

    relationName(propertyName: string): string {
        return snakeCase(propertyName);
    }
}
