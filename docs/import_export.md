# Import/Export

## Export

To export a graph, use the following options in the .grs-script:

### Recording all graph changes

```
record [fileName].grs start

[...]

record [fileName].grs stop
```

### Exporting a graph

```
export [fileName].grs
```

### Dump graph

```
dump graph [fileName].gcv
```

## Import

The model of the current host graph has to be a superset of the model of the graph to be imported.
To import a graph, use the following options:

### Import in the GrShell

```
import [fileName].grs
```

**Note:** Importing a graph in the GrShell will not overwrite the current host graph and relies on the Actions contained in the .grg-script, that was used to create the graph. All actions of the current ruleset will be executed on the host graph. **Use the following import-method in the .grg-script!**

### Import in the Ruleset

```
rule loadGraph {
    replace {
        ---
        eval {
            insert(File::import("../BP_Metamodel/test.grs"));
        }
    }
}
```
