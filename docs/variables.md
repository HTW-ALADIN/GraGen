# Variables

## General

### Global Variables

Global variable definition follows the syntax `[namespace]::variableName = value`.

### Local Variables

Local variable definition follows the syntax `def [var|ref] variableName:type = value`.

## Variables in Rules

Variables can only be declared in the evaluation-part of a rule:

- simple eval-mode: `modify|replace { eval { ... } }`
- full eval-mode:

```
modify|replace {
    --- eval { ... }
}
```

- procedures/functions

## Graph variables

Node variables are declared as follows:

```
def variableName:type = type;
```

Creation of a Node and assignment to a variable in one go:

```
(def variableName:type) = add(type);
```

**Creation of an Edge and assignment to a variable in one go:**

```
(def -variableName:type->) = add(type, node1, node2);
```
