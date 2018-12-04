# md-graphql-spec

## Description
A simple tool to generate GraphQL documentation from the result of a GraphQL Introspection Query

```
md-graphql-spec

Usage: md-graphql-spec [command]

Commands:
  types:
    Write a file listing all available GraphQL types
    Usage: md-graphql-spec types --schema <Schema> --types <Types>

  document:
    Write a markdown formatted file documenting the specified GraphQL schema
    Usage: md-graphql-spec document --schema <Schema> --ordering <Ordering> --document <Document>


Schema: Path to JSON result of a GraphQL Introspection Query

Types: Path to write the list of available GraphQL types

Ordering: Path a list of desired Types to include in the markdown document

Document: Path to write the markdown document
```

## Example output
## Input Type UserInput

Required information to register a new user

| Field | Type | Description |
|-------|------|-------------|
  | firstName | String |  |
  | lastName | String |  |
  | username | String | Unique username |
  | email | String | Valid email |
  | birthdate | String | User's date of birth, formatted as mm/dd/yyyy |
  | password | String | Password with at least one capital letter, number, and special character |
  | confirmPassword | String | Confirm the password |

## Type CurrentUser implements GroupMember

The current logged in user

| Field | Type | Arguments | Description |
|-------|------|-----------|-------------|
| id | ID |  |  |
| firstName | String |  |  |
| lastName | String |  |  |
| groups | List< UserGroup > |  |  |
| group | UserGroup | id: ID  |  |
| createGroup | String | description: String  | Start a new Group |

## Interface GroupMember

The CurrentUser or a Groupmate

| Field | Type | Arguments | Description |
|-------|------|-----------|-------------|
| id | ID |  |  |
| firstName | String |  |  |
| lastName | String |  |  |
